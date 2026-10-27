"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../../components/auth-provider";
import { AuthShell } from "../../../components/auth-shell";
import { ApiClientError } from "../../../lib/api/apiClient";
import { userService } from "../../../lib/api/userService";

type ProfileValues = {
  fullName: string;
  phone: string;
  university: string;
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
  const phone = values.phone.trim();
  const university = values.university.trim();

  if (!fullName) errors.fullName = "Vui lòng nhập họ và tên.";
  else if (fullName.length < 2) errors.fullName = "Họ và tên cần có ít nhất 2 ký tự.";
  else if (fullName.length > 100) errors.fullName = "Họ và tên không được vượt quá 100 ký tự.";

  if (phone && !/^(\+84|0)[0-9]{8,10}$/.test(phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (university.length > 150) {
    errors.university = "Tên trường tối đa 150 ký tự.";
  }

  return errors;
}

function validatePassword(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!values.currentPassword) errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";

  if (!values.newPassword) errors.newPassword = "Vui lòng nhập mật khẩu mới.";
  else if (values.newPassword.length < 6) {
    errors.newPassword = "Mật khẩu mới cần có ít nhất 6 ký tự.";
  } else if (values.newPassword.length > 100) {
    errors.newPassword = "Mật khẩu mới không được vượt quá 100 ký tự.";
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
  const auth = useAuth();
  const user = auth.status === "authenticated" ? auth.user : null;

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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const currentProfileValues: ProfileValues = profileValues ?? {
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    university: user?.university ?? "",
  };

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingProfile) return;

    const errors = validateProfile(currentProfileValues);
    setProfileErrors(errors);
    setProfileMessage("");
    setProfileError("");
    if (Object.keys(errors).length > 0) return;

    setSavingProfile(true);
    try {
      await userService.updateProfile(currentProfileValues);
      auth.refreshUser();
      setProfileMessage("Thông tin hồ sơ đã được cập nhật.");
    } catch (error) {
      if (error instanceof ApiClientError && error.fieldErrors) {
        setProfileErrors({
          fullName: error.fieldErrors.fullName,
          phone: error.fieldErrors.phone,
          university: error.fieldErrors.university,
        });
      }
      setProfileError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingPassword) return;

    const errors = validatePassword(passwordValues);
    setPasswordErrors(errors);
    setPasswordMessage("");
    setPasswordError("");
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    try {
      await userService.changePassword({
        oldPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
      });
      await userService.login({
        email: user?.email ?? "",
        password: passwordValues.newPassword,
      });
      setPasswordValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      setPasswordMessage("Mật khẩu đã được thay đổi.");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (auth.status === "loading" || auth.status === "unauthenticated") {
    return <main className="profile-loading" role="status">Đang tải hồ sơ...</main>;
  }

  return (
    <AuthShell
      eyebrow="Cài đặt tài khoản"
      title="Chỉnh sửa hồ sơ"
      description="Cập nhật thông tin cá nhân và giữ an toàn cho tài khoản của bạn."
    >
      {auth.status === "error" && (
        <p className="form-alert" role="alert">{auth.error}</p>
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
              disabled={savingProfile}
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
              name="email"
              type="email"
              value={user?.email ?? ""}
              disabled
              readOnly
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              autoComplete="tel"
              id="phone"
              maxLength={20}
              name="phone"
              type="tel"
              value={currentProfileValues.phone}
              onChange={(event) => {
                setProfileValues({ ...currentProfileValues, phone: event.target.value });
                setProfileErrors((current) => ({ ...current, phone: undefined }));
                setProfileMessage("");
              }}
              aria-invalid={Boolean(profileErrors.phone)}
              aria-describedby={profileErrors.phone ? "phone-error" : undefined}
              placeholder="0901234567"
              disabled={savingProfile}
            />
            {profileErrors.phone && (
              <span className="field-error" id="phone-error">{profileErrors.phone}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="university">Trường đại học</label>
            <input
              autoComplete="organization"
              id="university"
              maxLength={150}
              name="university"
              value={currentProfileValues.university}
              onChange={(event) => {
                setProfileValues({ ...currentProfileValues, university: event.target.value });
                setProfileErrors((current) => ({ ...current, university: undefined }));
                setProfileMessage("");
              }}
              aria-invalid={Boolean(profileErrors.university)}
              aria-describedby={profileErrors.university ? "university-error" : undefined}
              placeholder="Đại học Bách Khoa"
              disabled={savingProfile}
            />
            {profileErrors.university && (
              <span className="field-error" id="university-error">{profileErrors.university}</span>
            )}
          </div>
          <button className="auth-submit" disabled={savingProfile} type="submit">
            {savingProfile ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </section>

      <section className="profile-edit-section" aria-labelledby="password-title">
        <h2 id="password-title">Đổi mật khẩu</h2>
        <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
          {passwordError && <p className="form-alert" role="alert">{passwordError}</p>}
          {passwordMessage && <p className="form-success" role="status">{passwordMessage}</p>}
          <PasswordInputField
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
            disabled={savingPassword}
          />
          <PasswordInputField
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
            disabled={savingPassword}
          />
          <PasswordInputField
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
            disabled={savingPassword}
          />
          <button className="auth-submit" disabled={savingPassword} type="submit">
            {savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </section>

      <Link className="profile-edit-back" href="/profile">Quay lại hồ sơ</Link>
    </AuthShell>
  );
}

function PasswordInputField({
  autoComplete,
  disabled,
  error,
  id,
  label,
  onChange,
  value,
}: {
  autoComplete: "current-password" | "new-password";
  disabled?: boolean;
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
        disabled={disabled}
        required
      />
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  );
}
