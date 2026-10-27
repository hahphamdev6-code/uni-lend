"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "../../components/auth-shell";
import { ApiClientError } from "../../lib/api/apiClient";
import { userService } from "../../lib/api/userService";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldName = keyof FormValues;
type FormErrors = Partial<Record<FieldName, string>>;

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();

  if (!fullName) errors.fullName = "Vui lòng nhập họ và tên.";
  else if (fullName.length < 2) errors.fullName = "Họ và tên cần có ít nhất 2 ký tự.";
  else if (fullName.length > 100) errors.fullName = "Họ và tên không được vượt quá 100 ký tự.";

  if (!email) errors.email = "Vui lòng nhập email.";
  else if (email.length > 100) errors.email = "Email tối đa 100 ký tự.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email chưa đúng định dạng.";
  }

  if (!values.password) errors.password = "Vui lòng nhập mật khẩu.";
  else if (values.password.length < 8) errors.password = "Mật khẩu cần có ít nhất 8 ký tự.";
  else if (values.password.length > 72) errors.password = "Mật khẩu không được vượt quá 72 ký tự.";

  if (!values.confirmPassword) errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
  else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
  }

  return errors;
}

export default function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFormError("");
    setSuccess(false);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await userService.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setValues(initialValues);
      setSuccess(true);
    } catch (error) {
      if (error instanceof ApiClientError && error.fieldErrors) {
        setErrors({
          fullName: error.fieldErrors.fullName,
          email: error.fieldErrors.email,
          password: error.fieldErrors.password,
        });
      }
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể tạo tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Bắt đầu cùng UniLend"
      title="Tạo tài khoản"
      description="Tham gia cộng đồng sinh viên chia sẻ những món đồ hữu ích."
    >
      {success ? (
        <div className="auth-feedback success-feedback" role="status">
          <strong>Tạo tài khoản thành công!</strong>
          <span>Tài khoản của bạn đã sẵn sàng. Khám phá hồ sơ hoặc bắt đầu chia sẻ đồ dùng ngay.</span>
          <Link className="auth-submit" href="/profile">Đi đến hồ sơ của bạn</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {formError && <p className="form-alert" role="alert">{formError}</p>}
          <div className="form-field">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              autoComplete="name"
              id="fullName"
              name="fullName"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              placeholder="Nguyễn Minh Anh"
              disabled={submitting}
            />
            {errors.fullName && <span className="field-error" id="fullName-error">{errors.fullName}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="ban@example.com"
              disabled={submitting}
            />
            {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              autoComplete="new-password"
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : "password-hint"}
              placeholder="Ít nhất 8 ký tự"
              disabled={submitting}
            />
            {errors.password
              ? <span className="field-error" id="password-error">{errors.password}</span>
              : <span className="field-hint" id="password-hint">Sử dụng từ 8 đến 72 ký tự.</span>}
          </div>
          <div className="form-field">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input
              autoComplete="new-password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              placeholder="Nhập lại mật khẩu"
              disabled={submitting}
            />
            {errors.confirmPassword && <span className="field-error" id="confirmPassword-error">{errors.confirmPassword}</span>}
          </div>
          <button className="auth-submit" disabled={submitting} type="submit">
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
          <p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
