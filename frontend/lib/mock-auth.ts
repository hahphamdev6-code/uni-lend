export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
};

type StoredUser = UserProfile & { password: string };

const USERS_KEY = "unilend.mock.users";
const SESSION_KEY = "unilend.mock.session";
const AUTH_CHANGE_EVENT = "unilend:auth-change";

function isStoredUser(value: unknown): value is StoredUser {
  if (typeof value !== "object" || value === null) return false;

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "fullName" in value &&
    typeof value.fullName === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "password" in value &&
    typeof value.password === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}

export class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MockAuthError";
  }
}

function readUsers(): StoredUser[] {
  const value = localStorage.getItem(USERS_KEY);
  if (!value) return [];

  try {
    const users: unknown = JSON.parse(value);
    if (!Array.isArray(users) || !users.every(isStoredUser)) throw new Error("Invalid user list");
    return users;
  } catch {
    throw new MockAuthError("Không thể đọc dữ liệu tài khoản trên trình duyệt. Vui lòng xóa dữ liệu UniLend và thử lại.");
  }
}

export function subscribeToAuth(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

export function getSessionSnapshot(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}): void {
  const users = readUsers();
  const email = input.email.trim().toLocaleLowerCase("vi");

  if (users.some((user) => user.email === email)) {
    throw new MockAuthError("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export function loginUser(emailInput: string, password: string): UserProfile {
  const email = emailInput.trim().toLocaleLowerCase("vi");
  const user = readUsers().find((candidate) => candidate.email === email && candidate.password === password);

  if (!user) {
    throw new MockAuthError("Email hoặc mật khẩu chưa chính xác.");
  }

  const profile: UserProfile = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return profile;
}

export function getCurrentUser(): UserProfile | null {
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const session: unknown = JSON.parse(value);
    if (
      typeof session !== "object" ||
      session === null ||
      !("id" in session) ||
      typeof session.id !== "string"
    ) {
      throw new Error("Invalid session");
    }

    const user = readUsers().find((candidate) => candidate.id === session.id);
    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch (error) {
    if (error instanceof MockAuthError) throw error;
    throw new MockAuthError("Không thể đọc phiên đăng nhập. Hãy đăng nhập lại.");
  }
}

export function updateCurrentUser(input: { fullName: string; email: string }): UserProfile {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new MockAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLocaleLowerCase("vi");
  const users = readUsers();

  if (users.some((user) => user.id !== currentUser.id && user.email === email)) {
    throw new MockAuthError("Email này đã được sử dụng bởi một tài khoản khác.");
  }

  const updatedUsers = users.map((user) =>
    user.id === currentUser.id ? { ...user, fullName, email } : user,
  );
  const updatedProfile: UserProfile = {
    ...currentUser,
    fullName,
    email,
  };

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedProfile));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return updatedProfile;
}

export function changeCurrentUserPassword(input: {
  currentPassword: string;
  newPassword: string;
}): void {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new MockAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const users = readUsers();
  const user = users.find((candidate) => candidate.id === currentUser.id);
  if (!user || user.password !== input.currentPassword) {
    throw new MockAuthError("Mật khẩu hiện tại chưa chính xác.");
  }

  const updatedUsers = users.map((candidate) =>
    candidate.id === currentUser.id
      ? { ...candidate, password: input.newPassword }
      : candidate,
  );

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
