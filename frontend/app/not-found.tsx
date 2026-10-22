import { StatusPage } from "../components/status-page";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn có thể đã thay đổi hoặc trang này không còn tồn tại."
    />
  );
}
