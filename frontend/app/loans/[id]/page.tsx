"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../../components/auth-provider";
import { useAdminToast } from "../../../components/admin-toast";
import { useNotifications } from "../../../components/notifications-provider";
import { incidentService } from "../../../lib/api/incidentService";
import { loanService } from "../../../lib/api/loanService";
import type { IncidentStatus, IncidentType, Loan, LoanIncident } from "../../../lib/api/types";
import styles from "./page.module.css";

const incidentTypes: { value: IncidentType; label: string }[] = [
  { value: "DAMAGE", label: "Đồ bị hư hỏng" },
  { value: "MISSING_PARTS", label: "Thiếu hoặc thất lạc phụ kiện" },
  { value: "LATE_RETURN", label: "Vấn đề về thời hạn trả" },
  { value: "SAFETY", label: "Vấn đề an toàn" },
  { value: "OTHER", label: "Vấn đề khác" },
];

const incidentTypeLabels: Record<IncidentType, string> = {
  DAMAGE: "Đồ bị hư hỏng",
  MISSING_PARTS: "Thiếu hoặc thất lạc phụ kiện",
  LATE_RETURN: "Vấn đề về thời hạn trả",
  SAFETY: "Vấn đề an toàn",
  OTHER: "Vấn đề khác",
};

const incidentStatusLabels: Record<IncidentStatus, string> = {
  OPEN: "Mới tiếp nhận",
  IN_REVIEW: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
};

const loanStatusLabels: Record<Loan["status"], string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt · đang mượn",
  REJECTED: "Đã từ chối",
  RETURNED: "Đã trả",
  CANCELLED: "Đã hủy",
  OVERDUE: "Quá hạn",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getIncidentStatusClass(status: IncidentStatus): string {
  const classes: Record<IncidentStatus, string> = {
    OPEN: styles.statusOPEN,
    IN_REVIEW: styles.statusIN_REVIEW,
    RESOLVED: styles.statusRESOLVED,
    CLOSED: styles.statusCLOSED,
  };
  return classes[status];
}

export default function LoanDetailPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const loanId = Number(rawId);
  const router = useRouter();
  const auth = useAuth();
  const { showToast } = useAdminToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [incidents, setIncidents] = useState<LoanIncident[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, IncidentStatus>>({});
  const [updateMessages, setUpdateMessages] = useState<Record<number, string>>({});
  const [updatingIncidentId, setUpdatingIncidentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState<IncidentType>("DAMAGE");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    if (!Number.isSafeInteger(loanId) || loanId < 1) {
      setError("Mã lượt mượn không hợp lệ.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      loanService.getById(loanId, { signal: controller.signal }),
      incidentService.listByLoan(loanId, { signal: controller.signal }),
    ])
      .then(([loanData, incidentData]) => {
        if (controller.signal.aborted) return;
        setLoan(loanData);
        setIncidents(incidentData);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Không thể tải chi tiết lượt mượn.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [auth.status, loanId]);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loan) return;
    setSubmitting(true);
    try {
      const created = await incidentService.create(loan.id, { type, description: description.trim() });
      setIncidents((current) => [created, ...current]);
      setDescription("");
      showToast("success", "Đã gửi báo cáo sự cố.");
      await refreshNotifications();
    } catch (submitError) {
      showToast(
        "error",
        submitError instanceof Error ? submitError.message : "Không thể gửi báo cáo sự cố.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateIncidentStatus(event: FormEvent<HTMLFormElement>, incident: LoanIncident) {
    event.preventDefault();
    const message = updateMessages[incident.id]?.trim();
    if (!message) return;

    setUpdatingIncidentId(incident.id);
    try {
      const updated = await incidentService.updateStatus(incident.id, {
        status: statusDrafts[incident.id] ?? incident.status,
        message,
      });
      setIncidents((current) =>
        current.map((currentIncident) =>
          currentIncident.id === updated.id ? updated : currentIncident,
        ),
      );
      setUpdateMessages((current) => ({ ...current, [incident.id]: "" }));
      showToast("success", "Đã cập nhật trạng thái báo cáo và thông báo cho hai bên.");
      await refreshNotifications();
    } catch (updateError) {
      showToast(
        "error",
        updateError instanceof Error ? updateError.message : "Không thể cập nhật trạng thái báo cáo.",
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  }

  const canReport = loan?.status === "APPROVED" || loan?.status === "OVERDUE";
  const canManageIncidents = auth.status === "authenticated" && auth.user.roles.includes("ADMIN");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="UniLend - về trang chủ">
          <span className={styles.brandMark} aria-hidden="true">U</span>
          <span>uni<span className={styles.brandAccent}>lend</span></span>
        </Link>
        <nav className={styles.navigation} aria-label="Điều hướng chính">
          <Link href="/">Trang chủ</Link>
          <Link href="/my">Quản lý cá nhân</Link>
          <span aria-current="page">Chi tiết lượt mượn</span>
        </nav>
        <Link className={styles.headerLink} href="/my">Quay lại giao dịch</Link>
      </header>

      <section className={styles.content} aria-labelledby="loan-detail-title">
        <Link className={styles.backLink} href="/my">← Quay lại quản lý cá nhân</Link>
        {auth.status === "error" ? (
          <div className={styles.statePanel} role="alert">{auth.error}</div>
        ) : loading ? (
          <div className={styles.statePanel} role="status">Đang tải chi tiết lượt mượn...</div>
        ) : error ? (
          <div className={styles.statePanel} role="alert">
            <h1>Không thể tải chi tiết lượt mượn</h1>
            <p>{error}</p>
          </div>
        ) : loan ? (
          <>
            <div className={styles.heading}>
              <span className={styles.eyebrow}>Mã lượt mượn #{loan.id}</span>
              <h1 id="loan-detail-title">{loan.item.title}</h1>
              <span className={styles.loanStatus}>{loanStatusLabels[loan.status]}</span>
            </div>

            <section className={styles.loanSummary} aria-label="Thông tin lượt mượn">
              <div><span>Người mượn</span><strong>{loan.borrower.fullName}</strong></div>
              <div><span>Chủ món đồ</span><strong>{loan.owner.fullName}</strong></div>
              <div><span>Ngày bắt đầu</span><strong>{loan.borrowFrom ?? "Chưa cập nhật"}</strong></div>
              <div><span>Hạn trả</span><strong>{loan.dueDate ?? "Chưa cập nhật"}</strong></div>
            </section>

            {canReport && (
              <section className={styles.reportCard} aria-labelledby="report-title">
                <div>
                  <span className={styles.eyebrow}>Cần hỗ trợ?</span>
                  <h2 id="report-title">Báo sự cố lượt mượn</h2>
                  <p>Chọn loại vấn đề và mô tả rõ điều đã xảy ra để các bên cùng theo dõi.</p>
                </div>
                <form className={styles.reportForm} onSubmit={(event) => void submitReport(event)}>
                  <label htmlFor="incident-type">Loại vấn đề</label>
                  <select
                    id="incident-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as IncidentType)}
                  >
                    {incidentTypes.map((entry) => (
                      <option key={entry.value} value={entry.value}>{entry.label}</option>
                    ))}
                  </select>
                  <label htmlFor="incident-description">Mô tả sự cố</label>
                  <textarea
                    id="incident-description"
                    maxLength={2000}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Mô tả tình trạng, thời điểm phát hiện và thông tin cần lưu ý..."
                    required
                    rows={5}
                    value={description}
                  />
                  <div className={styles.formFooter}>
                    <span>{description.length}/2000 ký tự</span>
                    <button disabled={submitting || !description.trim()} type="submit">
                      {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            <section className={styles.historySection} aria-labelledby="history-title">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>Theo dõi xử lý</span>
                  <h2 id="history-title">Lịch sử báo sự cố</h2>
                </div>
                <span className={styles.count}>{incidents.length} báo cáo</span>
              </div>
              {incidents.length ? (
                <div className={styles.incidentList}>
                  {incidents.map((incident) => (
                    <article className={styles.incidentCard} key={incident.id}>
                      <div className={styles.incidentTop}>
                        <div>
                          <span className={styles.incidentType}>{incidentTypeLabels[incident.type]}</span>
                          <p className={styles.reporter}>Báo bởi {incident.reporter.fullName} · {formatDate(incident.createdAt)}</p>
                        </div>
                        <span
                          className={`${styles.incidentStatus} ${getIncidentStatusClass(incident.status)}`}
                        >
                          {incidentStatusLabels[incident.status]}
                        </span>
                      </div>
                      <p className={styles.description}>{incident.description}</p>
                      <h3>Các cập nhật</h3>
                      <ol className={styles.timeline}>
                        {incident.updates.map((update) => (
                          <li key={update.id}>
                            <span className={styles.timelineDot} aria-hidden="true" />
                            <div>
                              <p>{update.message}</p>
                              <span>{incidentStatusLabels[update.status]} · {update.actor.fullName} · {formatDate(update.createdAt)}</span>
                            </div>
                          </li>
                        ))}
                      </ol>
                      {canManageIncidents && (
                        <form
                          className={styles.statusForm}
                          onSubmit={(event) => void updateIncidentStatus(event, incident)}
                        >
                          <label htmlFor={`incident-status-${incident.id}`}>Cập nhật trạng thái</label>
                          <select
                            id={`incident-status-${incident.id}`}
                            onChange={(event) =>
                              setStatusDrafts((current) => ({
                                ...current,
                                [incident.id]: event.target.value as IncidentStatus,
                              }))
                            }
                            value={statusDrafts[incident.id] ?? incident.status}
                          >
                            <option value="OPEN">Mới tiếp nhận</option>
                            <option value="IN_REVIEW">Đang xử lý</option>
                            <option value="RESOLVED">Đã giải quyết</option>
                          </select>
                          <label htmlFor={`incident-update-${incident.id}`}>Nội dung cập nhật</label>
                          <textarea
                            id={`incident-update-${incident.id}`}
                            maxLength={1000}
                            onChange={(event) =>
                              setUpdateMessages((current) => ({
                                ...current,
                                [incident.id]: event.target.value,
                              }))
                            }
                            placeholder="Cho hai bên biết tiến độ hoặc kết quả xử lý..."
                            required
                            rows={3}
                            value={updateMessages[incident.id] ?? ""}
                          />
                          <button
                            disabled={updatingIncidentId === incident.id || !updateMessages[incident.id]?.trim()}
                            type="submit"
                          >
                            {updatingIncidentId === incident.id ? "Đang cập nhật..." : "Lưu cập nhật"}
                          </button>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span aria-hidden="true">✓</span>
                  <h3>Chưa có sự cố nào</h3>
                  <p>Các báo cáo mới sẽ xuất hiện tại đây để hai bên cùng theo dõi tiến độ.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
