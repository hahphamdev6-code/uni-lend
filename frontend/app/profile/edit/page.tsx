"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { AuthShell } from "../../../components/auth-shell";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getSessionSnapshot,
  MockAuthError,
  subscribeToAuth,
  updateCurrentUser,
  type UserProfile,
} from "../../../lib/mock-auth";

type ProfileValues = {
  fullName: string;
  email: string;
};

type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileField = keyof ProfileValues;
type PasswordField = keyof PasswordValues;
type ProfileErrors = Partial<Record<ProfileField, string>>;
type PasswordErrors = Partial<Record<PasswordField, string>>;

function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();

  if (!fullName) errors.fullName = "Vui lòng nhập họ và tên.";
  else if (fullName.length < 2) errors.fullName = "Họ và tên cần có ít nhất 2 ký tự.";
  else if (fullName.length > 100) errors.fullName = "Họ và tên không được vượt quá 100 ký tự.";

  if (!email) errors.email = "Vui lòng nhập email.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email chưa đúng định dạng.";
  }

  return errors;
}

function validatePassword(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!values.currentPassword) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";

  if (!values.newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới.";
  else if (values.newPassword.length < 8) {
    errors.newPassword = "Mật khẩu mới cần có ít nhất 8 ký tự.";
  } else if (values.newPassword.length > 128) {
    errors.newPassword = "Mật khẩu mới không được vượt quá 128 ký tự.";
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "Mật khẩu mới cần khác mật khẩu hiện tại.";
  }

  if (!values.confirmPassword) errors.confirmPassword = "Vui lòng nhập lại mật khẩu mới.";
  else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
  }

  return errors;
}

export default function EditProfilePage() {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getSessionSnapshot,
    () => "__loading__",
  );
  const profileState = useMemo(() => {
    if (sessionSnapshot === "__loading__") return { status: "loading" as const };
    if (!sessionSnapshot) return { status: "unauthenticated" as const };

    try {
      const user = getCurrentUser();
      return user
        ? { status: "authenticated" as const, user }
        : { status: "unauthenticated" as const };
    } catch (error) {
      return {
        status: "error" as const,
        message: error instanceof Error ? error.message : "Không thể tải thông tin hồ sơ.",
      };
    }
  }, [sessionSnapshot]);
  const user: UserProfile | null =
    profileState.status === "authenticated" ? profileState.user : null;

  const [profileValues, setProfileValues] = useState<ProfileValues | null>(null);
  const [passwordValues, setPasswordValues] = useState<PasswordValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const currentProfileValues = profileValues ?? {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
  };

  useEffect(() => {
    if (profileState.status === "unauthenticated") router.replace("/login");
  }, [profileState.status, router]);

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateProfile(currentProfileValues);
    setProfileErrors(errors);
    setProfileMessage("");
    setProfileError("");
    if (Object.keys(errors).length > 0) return;

    try {
      updateCurrentUser(currentProfileValues);
      setProfileMessage("Thông tin hồ sơ đã được cập nhật.");
    } catch (error) {
      setProfileError(
        error instanceof MockAuthError
          ? error.message
          : "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      );
    }
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validatePassword(passwordValues);
    setPasswordErrors(errors);
    setPasswordMessage("");
    setPasswordError("");
    if (Object.keys(errors).length > 0) return;

    try {
      changeCurrentUserPassword(passwordValues);
      setPasswordValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      setPasswordMessage("Mật khẩu đã được thay đổi.");
    } catch (error) {
      setPasswordError(
        error instanceof MockAuthError
          ? error.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    }
  }

  if (profileState.status === "loading" || profileState.status === "unauthenticated") {
    return <main className="profile-loading" role="status">Đang tải hồ sơ...</main>;
  }

  return (
    <AuthShell
      eyebrow="Cài đặt tài khoản"
      title="Chỉnh sửa hồ sơ"
      description="Cập nhật thông tin cá nhân và giữ an toàn cho tài khoản của bạn."
    >
      {profileState.status === "error" && (
        <p className="form-alert" role="alert">{profileState.message}</p>
      )}

      <section className="profile-edit-section" aria-labelledby="profile-information-title">
        <h2 id="profile-information-title">Thông tin cá nhân</h2>
        <form className="auth-form" onSubmit={handleProfileSubmit} noValidate>
          {profileError && <p className="form-alert" role="alert">{profileError}</p>}
          {profileMessage && <p className="form-success" role="status">{profileMessage}</p>}
          <div className="form-field">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              autoComplete="name"
              id="fullName"
              maxLength={100}
              name="fullName"
              value={currentProfileValues.fullName}
              onChange={(event) => {
                setProfileValues({ ...currentProfileValues, fullName: event.target.value });
                setProfileErrors((current) => ({ ...current, fullName: undefined }));
                setProfileMessage("");
              }}
              aria-invalid={Boolean(profileErrors.fullName)}
              aria-describedby={profileErrors.fullName ? "fullName-error" : undefined}
              required
            />
            {profileErrors.fullName && (
              <span className="field-error" id="fullName-error">{profileErrors.fullName}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              maxLength={254}
              name="email"
              type="email"
              value={currentProfileValues.email}
              onChange={(event) => {
                setProfileValues({ ...currentProfileValues, email: event.target.value });
                setProfileErrors((current) => ({ ...current, email: undefined }));
                setProfileMessage("");
              }}
              aria-invalid={Boolean(profileErrors.email)}
              aria-describedby={profileErrors.email ? "email-error" : undefined}
              required
            />
            {profileErrors.email && (
              <span className="field-error" id="email-error">{profileErrors.email}</span>
            )}
          </div>
          <button className="auth-submit" type="submit">Lưu thông tin</button>
        </form>
      </section>

      <section className="profile-edit-section" aria-labelledby="password-title">
        <h2 id="password-title">Đổi mật khẩu</h2>
        <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
          {passwordError && <p className="form-alert" role="alert">{passwordError}</p>}
          {passwordMessage && <p className="form-success" role="status">{passwordMessage}</p>}
          <PasswordField
            error={passwordErrors.currentPassword}
            id="currentPassword"
            label="Mật khẩu hiện tại"
            onChange={(value) => {
              setPasswordValues((current) => ({ ...current, currentPassword: value }));
              setPasswordErrors((current) => ({ ...current, currentPassword: undefined }));
              setPasswordMessage("");
            }}
            value={passwordValues.currentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            error={passwordErrors.newPassword}
            id="newPassword"
            label="Mật khẩu mới"
            onChange={(value) => {
              setPasswordValues((current) => ({ ...current, newPassword: value }));
              setPasswordErrors((current) => ({ ...current, newPassword: undefined }));
              setPasswordMessage("");
            }}
            value={passwordValues.newPassword}
            autoComplete="new-password"
          />
          <PasswordField
            error={passwordErrors.confirmPassword}
            id="confirmPassword"
            label="Nhập lại mật khẩu mới"
            onChange={(value) => {
              setPasswordValues((current) => ({ ...current, confirmPassword: value }));
              setPasswordErrors((current) => ({ ...current, confirmPassword: undefined }));
              setPasswordMessage("");
            }}
            value={passwordValues.confirmPassword}
            autoComplete="new-password"
          />
          <button className="auth-submit" type="submit">Cập nhật mật khẩu</button>
        </form>
      </section>

      <Link className="profile-edit-back" href="/profile">Quay lại hồ sơ</Link>
    </AuthShell>
  );
}

function PasswordField({
  autoComplete,
  error,
  id,
  label,
  onChange,
  value,
}: {
  autoComplete: "current-password" | "new-password";
  error?: string;
  id: PasswordField;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        autoComplete={autoComplete}
        id={id}
        name={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        required
      />
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  );
}
