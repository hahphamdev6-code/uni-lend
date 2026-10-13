"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";

// --- DỮ LIỆU MẪU (MOCK DATA) ---
interface MyItem {
  id: string;
  title: string;
  category: string;
  status: "AVAILABLE" | "LENT_OUT";
  createdAt: string;
}

interface LoanRequestItem {
  id: string;
  itemName: string;
  borrowerName?: string;
  ownerName?: string;
  startDate: string;
  endDate: string;
  note: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "CANCELLED";
}

const INITIAL_MY_ITEMS: MyItem[] = [
  {
    id: "1",
    title: "Máy tính Casio fx-580VNX",
    category: "Thiết bị điện tử",
    status: "AVAILABLE",
    createdAt: "28/09/2026",
  },
  {
    id: "2",
    title: "Giáo trình Cấu trúc dữ liệu và giải thuật",
    category: "Sách & Giáo trình",
    status: "LENT_OUT",
    createdAt: "25/09/2026",
  },
];

const INITIAL_MY_REQUESTS: LoanRequestItem[] = [
  {
    id: "101",
    itemName: "Chuột không dây Logitech",
    ownerName: "Nguyễn Văn B",
    startDate: "02/10/2026",
    endDate: "05/10/2026",
    note: "Mượn để thuyết trình đồ án",
    status: "PENDING",
  },
  {
    id: "102",
    itemName: "Bảng vẽ Wacom One",
    ownerName: "Trần Thị C",
    startDate: "20/09/2026",
    endDate: "22/09/2026",
    note: "Mượn vẽ thiết kế UI",
    status: "RETURNED",
  },
];

const INITIAL_INCOMING_REQUESTS: LoanRequestItem[] = [
  {
    id: "201",
    itemName: "Máy tính Casio fx-580VNX",
    borrowerName: "Lê Văn D",
    startDate: "03/10/2026",
    endDate: "04/10/2026",
    note: "Em mượn thi môn Giải tích 2 ạ",
    status: "PENDING",
  },
  {
    id: "202",
    itemName: "Giáo trình Cấu trúc dữ liệu và giải thuật",
    borrowerName: "Hoàng Minh E",
    startDate: "26/09/2026",
    endDate: "05/10/2026",
    note: "Mượn ôn thi cuối kỳ",
    status: "APPROVED",
  },
];

export default function ManageItemsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"items" | "sent" | "incoming">("items");

  // State danh sách
  const [myItems, setMyItems] = useState(INITIAL_MY_ITEMS);
  const [myRequests, setMyRequests] = useState(INITIAL_MY_REQUESTS);
  const [incomingRequests, setIncomingRequests] = useState(INITIAL_INCOMING_REQUESTS);

  // State Modal xác nhận
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "primary" | "danger";
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Xác nhận",
    onConfirm: () => {},
  });

  const closeModal = () => setModalState((prev) => ({ ...prev, isOpen: false }));

  // --- XỬ LÝ HÀNH ĐỘNG ---
  // 1. Xóa đồ của tôi
  const handleDeleteItem = (id: string, title: string) => {
    setModalState({
      isOpen: true,
      title: "Xóa món đồ",
      message: `Bạn có chắc chắn muốn xóa "${title}" khỏi danh sách chia sẻ?`,
      variant: "danger",
      confirmText: "Xóa đồ",
      onConfirm: () => {
        setMyItems((prev) => prev.filter((item) => item.id !== id));
        showToast(`Đã xóa "${title}" thành công!`, "success");
        closeModal();
      },
    });
  };

  // 2. Hủy yêu cầu mượn đã gửi
  const handleCancelRequest = (id: string) => {
    setModalState({
      isOpen: true,
      title: "Hủy yêu cầu mượn",
      message: "Bạn có chắc chắn muốn hủy yêu cầu mượn đồ này không?",
      variant: "danger",
      confirmText: "Hủy yêu cầu",
      onConfirm: () => {
        setMyRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: "CANCELLED" } : req))
        );
        showToast("Đã hủy yêu cầu mượn đồ!", "info");
        closeModal();
      },
    });
  };

  // 3. Duyệt yêu cầu mượn
  const handleApproveRequest = (id: string) => {
    setModalState({
      isOpen: true,
      title: "Duyệt yêu cầu mượn",
      message: "Bạn có chắc chắn đồng ý cho mượn món đồ này?",
      variant: "primary",
      confirmText: "Duyệt ngay",
      onConfirm: () => {
        setIncomingRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: "APPROVED" } : req))
        );
        showToast("Đã phê duyệt yêu cầu mượn thành công!", "success");
        closeModal();
      },
    });
  };

  // 4. Từ chối yêu cầu mượn
  const handleRejectRequest = (id: string) => {
    setModalState({
      isOpen: true,
      title: "Từ chối yêu cầu mượn",
      message: "Bạn muốn từ chối yêu cầu mượn đồ này?",
      variant: "danger",
      confirmText: "Từ chối",
      onConfirm: () => {
        setIncomingRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: "REJECTED" } : req))
        );
        showToast("Đã từ chối yêu cầu mượn!", "info");
        closeModal();
      },
    });
  };

  // 5. Xác nhận người mượn đã trả đồ
  const handleMarkReturned = (id: string) => {
    setModalState({
      isOpen: true,
      title: "Xác nhận nhận lại đồ",
      message: "Xác nhận món đồ đã được hoàn trả nguyên vẹn về tay bạn?",
      variant: "primary",
      confirmText: "Đã nhận lại đồ",
      onConfirm: () => {
        setIncomingRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: "RETURNED" } : req))
        );
        showToast("Xác nhận đã trả đồ thành công!", "success");
        closeModal();
      },
    });
  };

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold">Quản lý cá nhân</h1>
          <p className="text-sm text-zinc-500">Quản lý đồ dùng và các yêu cầu mượn trả của bạn</p>
        </div>
        <Link href="/items/create">
          <Button size="md">+ Đăng món đồ mới</Button>
        </Link>
      </div>

      {/* Thanh điều hướng Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("items")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "items"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Đồ của tôi ({myItems.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "sent"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Yêu cầu tôi đã gửi ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "incoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Yêu cầu gửi đến tôi ({incomingRequests.length})
        </button>
      </div>

      {/* TAB 1: ĐỒ CỦA TÔI */}
      {activeTab === "items" && (
        <div className="space-y-4">
          {myItems.length === 0 ? (
            <Card className="text-center py-12 text-zinc-500">Bạn chưa đăng món đồ nào.</Card>
          ) : (
            myItems.map((item) => (
              <Card key={item.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <Badge status={item.status} />
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Danh mục: {item.category} • Ngày đăng: {item.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/items/${item.id}/edit`}>
                      <Button variant="outline" size="sm">Sửa</Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: YÊU CẦU TÔI ĐÃ GỬI */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <Card className="text-center py-12 text-zinc-500">Bạn chưa gửi yêu cầu mượn nào.</Card>
          ) : (
            myRequests.map((req) => (
              <Card key={req.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{req.itemName}</h3>
                      <Badge status={req.status} />
                    </div>
                    <p className="text-sm text-zinc-500">Chủ đồ: {req.ownerName}</p>
                    <p className="text-xs text-zinc-400">
                      Thời gian: {req.startDate} đến {req.endDate}
                    </p>
                    {req.note && <p className="text-xs italic text-zinc-500">"{req.note}"</p>}
                  </div>
                  {req.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(req.id)}
                    >
                      Hủy yêu cầu
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: YÊU CẦU GỬI ĐẾN TÔI */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <Card className="text-center py-12 text-zinc-500">Chưa có ai yêu cầu mượn đồ của bạn.</Card>
          ) : (
            incomingRequests.map((req) => (
              <Card key={req.id} className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{req.itemName}</h3>
                      <Badge status={req.status} />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      Người mượn: <span className="font-medium">{req.borrowerName}</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Thời gian mượn: {req.startDate} &rarr; {req.endDate}
                    </p>
                    {req.note && <p className="text-xs italic text-zinc-500">Lời nhắn: "{req.note}"</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Trạng thái PENDING: Có nút Duyệt và Từ chối */}
                    {req.status === "PENDING" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveRequest(req.id)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectRequest(req.id)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}

                    {/* Trạng thái APPROVED: Đã duyệt mượn, có nút Đã trả để xác nhận hoàn tất */}
                    {req.status === "APPROVED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkReturned(req.id)}
                      >
                        Đã trả (Thu lại đồ)
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Hộp thoại xác nhận hành động chung */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        variant={modalState.variant}
        confirmText={modalState.confirmText}
      />
    </div>
  );
}