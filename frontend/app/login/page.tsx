"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "../../components/auth-shell";
import { loginUser, MockAuthError } from "../../lib/mock-auth";

type FormValues = {
  email: string;
  password: string;
};

type FieldName = keyof FormValues;
type FormErrors = Partial<Record<FieldName, string>>;

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!values.email.trim()) nextErrors.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng.";
    }
    if (!values.password) nextErrors.password = "Vui lòng nhập mật khẩu.";

    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      loginUser(values.email, values.password);
      router.push("/profile");
    } catch (error) {
      setFormError(
        error instanceof MockAuthError
          ? error.message
          : "Không thể đăng nhập trên trình duyệt này. Vui lòng thử lại.",
      );
    }
  }

  return (
    <AuthShell
      eyebrow="Chào mừng bạn trở lại"
      title="Đăng nhập"
      description="Đăng nhập để xem hồ sơ và tiếp tục kết nối với cộng đồng."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <p className="form-alert" role="alert">{formError}</p>}
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            autoFocus
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="ban@example.com"
          />
          {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Nhập mật khẩu"
          />
          {errors.password && <span className="field-error" id="password-error">{errors.password}</span>}
        </div>
        <button className="auth-submit" type="submit">Đăng nhập</button>
        <p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link></p>
      </form>
    </AuthShell>
  );
}
