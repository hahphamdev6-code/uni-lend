import { StatusPage } from "../../components/status-page";

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Bạn không có quyền truy cập"
      description="Tài khoản hiện tại không được phép xem trang này."
    />
  );
}
