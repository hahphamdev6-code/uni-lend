import { StatusPage } from "../components/status-page";

export default function NotFound() {
  return <StatusPage code="404" title="Không tìm thấy trang" description="Đường dẫn này không tồn tại hoặc món đồ đã được gỡ khỏi UniLend." href="/" linkLabel="Về trang khám phá" />;
}