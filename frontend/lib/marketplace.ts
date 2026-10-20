export type ItemStatus = "AVAILABLE" | "LENT_OUT" | "UNAVAILABLE";
export type LoanStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "CANCELLED";

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
  owner: string;
};

export type MarketplaceRequest = {
  id: string;
  itemId: string;
  itemTitle: string;
  borrower: string;
  owner: string;
  borrowFrom: string;
  dueDate: string;
  note: string;
  status: LoanStatus;
};

const ITEM_STORAGE_KEY = "unilend-marketplace-items";
const REQUEST_STORAGE_KEY = "unilend-marketplace-requests";

export const initialItems: MarketplaceItem[] = [
  { id: "item-1", title: "Máy ảnh film Canon AE-1", description: "Máy hoạt động tốt, kèm dây đeo và túi đựng.", category: "Công nghệ", status: "AVAILABLE", owner: "Minh Anh" },
  { id: "item-2", title: "Giáo trình Giải tích 1", description: "Bản in lần 3, có ghi chú ở một số chương.", category: "Học tập", status: "AVAILABLE", owner: "Minh Anh" },
  { id: "item-3", title: "Máy chiếu mini Wanbo", description: "Độ phân giải HD, có sẵn cáp HDMI.", category: "Công nghệ", status: "LENT_OUT", owner: "Minh Anh" },
  { id: "item-4", title: "Bộ cờ board game Catan", description: "Đủ quân và thẻ, phù hợp nhóm 3-4 người.", category: "Đời sống", status: "UNAVAILABLE", owner: "Minh Anh" },
];

export const initialRequests: MarketplaceRequest[] = [
  { id: "request-1", itemId: "item-1", itemTitle: "Máy ảnh film Canon AE-1", borrower: "Quốc Bảo", owner: "Minh Anh", borrowFrom: "2026-10-24", dueDate: "2026-10-27", note: "Mình cần chụp ảnh cho bài tập môn Nhiếp ảnh.", status: "PENDING" },
  { id: "request-2", itemId: "item-2", itemTitle: "Giáo trình Giải tích 1", borrower: "Thu Hà", owner: "Minh Anh", borrowFrom: "2026-10-22", dueDate: "2026-10-25", note: "Mượn ôn bài kiểm tra giữa kỳ, mình sẽ giữ gìn cẩn thận.", status: "PENDING" },
  { id: "request-3", itemId: "item-3", itemTitle: "Máy chiếu mini Wanbo", borrower: "Minh Anh", owner: "Linh Chi", borrowFrom: "2026-10-18", dueDate: "2026-10-21", note: "Dùng cho buổi chiếu phim của câu lạc bộ.", status: "APPROVED" },
  { id: "request-4", itemId: "item-4", itemTitle: "Bộ cờ board game Catan", borrower: "Tuấn Kiệt", owner: "Minh Anh", borrowFrom: "2026-10-12", dueDate: "2026-10-14", note: "", status: "RETURNED" },
  { id: "request-5", itemId: "item-1", itemTitle: "Máy ảnh film Canon AE-1", borrower: "Minh Anh", owner: "Quốc Bảo", borrowFrom: "2026-10-29", dueDate: "2026-11-01", note: "Mình muốn mượn cuối tuần để đi ngoại khóa.", status: "PENDING" },
];

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadItems(): MarketplaceItem[] {
  return readStored(ITEM_STORAGE_KEY, initialItems);
}

export function saveItems(items: MarketplaceItem[]) {
  window.localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

export function loadRequests(): MarketplaceRequest[] {
  return readStored(REQUEST_STORAGE_KEY, initialRequests);
}

export function saveRequests(requests: MarketplaceRequest[]) {
  window.localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(requests));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}