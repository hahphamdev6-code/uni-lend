import { StatusPage } from "../../components/status-page";

export default function ForbiddenPage() {
  return <StatusPage code="403" title="Bạn chưa thể truy cập" description="Trang này chỉ dành cho thành viên có quyền phù hợp. Hãy quay lại không gian của bạn hoặc khám phá món đồ khác." href="/quan-ly" linkLabel="Về không gian của tôi" />;
}