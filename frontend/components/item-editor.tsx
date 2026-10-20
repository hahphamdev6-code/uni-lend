"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { loadItems, saveItems, type ItemStatus, type MarketplaceItem } from "../lib/marketplace";
import { ItemEditorSkeleton } from "./page-skeleton";

type Values = { title: string; description: string; category: string; status: ItemStatus };
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

const categories = ["Học tập", "Công nghệ", "Đời sống", "Khác"];
const emptyValues: Values = { title: "", description: "", category: "Học tập", status: "AVAILABLE" };

export function ItemEditor({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(!itemId);
  const [canChangeStatus, setCanChangeStatus] = useState(true);

  useEffect(() => {
    if (!itemId) return;
    window.queueMicrotask(() => {
      const item = loadItems().find((entry) => entry.id === itemId);
      if (item) {
        setValues({ title: item.title, description: item.description, category: item.category, status: item.status === "LENT_OUT" ? "AVAILABLE" : item.status });
        setCanChangeStatus(item.status !== "LENT_OUT");
      }
      setReady(true);
    });
  }, [itemId]);

  function updateField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    const title = values.title.trim();
    const description = values.description.trim();
    if (!title) nextErrors.title = "Vui lòng nhập tên món đồ.";
    else if (title.length > 150) nextErrors.title = "Tên món đồ không được vượt quá 150 ký tự.";
    if (description.length > 5000) nextErrors.description = "Mô tả không được vượt quá 5.000 ký tự.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const items = loadItems();
    const existing = itemId ? items.find((item) => item.id === itemId) : undefined;
    const updated: MarketplaceItem = {
      id: existing?.id ?? `item-${Date.now()}`,
      title,
      description,
      category: values.category,
      status: canChangeStatus ? values.status : "LENT_OUT",
      owner: existing?.owner ?? "Minh Anh",
    };
    saveItems(existing ? items.map((item) => item.id === existing.id ? updated : item) : [updated, ...items]);
    window.sessionStorage.setItem("unilend-toast", itemId ? "Đã cập nhật món đồ." : "Đã đăng món đồ mới.");
    router.push("/quan-ly?tab=items");
  }

  if (!ready) return <ItemEditorSkeleton />;
  if (itemId && !loadItems().some((item) => item.id === itemId)) {
    return <main className="manage-loading"><p>Không tìm thấy món đồ này.</p><Link href="/quan-ly">Quay lại quản lý</Link></main>;
  }

  return (
    <main className="editor-page">
      <header className="manage-header editor-header">
        <Link className="brand" href="/"><span className="brand-mark">U</span><span>uni<span className="brand-accent">lend</span></span></Link>
        <Link className="editor-back" href="/quan-ly">Quay lại quản lý</Link>
      </header>
      <div className="editor-layout">
        <div className="editor-intro">
          <span className="manage-kicker">GÓC CHIA SẺ CỦA BẠN</span>
          <h1>{itemId ? "Sửa thông tin đồ" : "Đăng một món đồ mới"}</h1>
          <p>Thêm vài thông tin để mọi người biết món đồ của bạn có thể giúp ích thế nào.</p>
          <div className="editor-aside"><span className="editor-aside-mark">↗</span><span>Chia sẻ rõ ràng giúp việc mượn và trả đồ nhẹ nhàng hơn.</span></div>
        </div>
        <form className="item-editor-form" onSubmit={submit} noValidate>
          <div className="editor-form-heading"><span>THÔNG TIN MÓN ĐỒ</span><span className="required-note">* Bắt buộc</span></div>
          <div className="form-field">
            <label htmlFor="item-title">Tên món đồ <span>*</span></label>
            <input id="item-title" maxLength={150} value={values.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Ví dụ: Máy ảnh film Canon AE-1" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "item-title-error" : "item-title-count"} />
            {errors.title ? <span className="field-error" id="item-title-error">{errors.title}</span> : <span className="field-hint" id="item-title-count">{values.title.length}/150 ký tự</span>}
          </div>
          <div className="form-field">
            <label htmlFor="item-category">Danh mục <span>*</span></label>
            <select id="item-category" value={values.category} onChange={(event) => updateField("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          </div>
          <div className="form-field">
            <div className="label-with-count"><label htmlFor="item-description">Mô tả</label><span>{values.description.length}/5000</span></div>
            <textarea id="item-description" maxLength={5000} rows={5} value={values.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Tình trạng, phụ kiện đi kèm, lưu ý khi sử dụng..." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "item-description-error" : undefined} />
            {errors.description && <span className="field-error" id="item-description-error">{errors.description}</span>}
          </div>
          {canChangeStatus && <fieldset className="status-fieldset"><legend>Trạng thái hiển thị</legend><label className={`status-choice${values.status === "AVAILABLE" ? " selected" : ""}`}><input type="radio" name="item-status" checked={values.status === "AVAILABLE"} onChange={() => updateField("status", "AVAILABLE")} /><span className="status-choice-dot available-dot" /><span><strong>Có thể mượn</strong><small>Mọi người có thể gửi yêu cầu mượn</small></span></label><label className={`status-choice${values.status === "UNAVAILABLE" ? " selected" : ""}`}><input type="radio" name="item-status" checked={values.status === "UNAVAILABLE"} onChange={() => updateField("status", "UNAVAILABLE")} /><span className="status-choice-dot hidden-dot" /><span><strong>Tạm ẩn</strong><small>Ẩn món đồ khỏi danh sách khám phá</small></span></label></fieldset>}
          {!canChangeStatus && <p className="locked-status-note">Món đồ đang được mượn nên không thể đổi trạng thái.</p>}
          <div className="editor-actions"><Link className="secondary-button" href="/quan-ly">Hủy</Link><button className="primary-button" type="submit">{itemId ? "Lưu thay đổi" : "Đăng món đồ"}</button></div>
        </form>
      </div>
    </main>
  );
}