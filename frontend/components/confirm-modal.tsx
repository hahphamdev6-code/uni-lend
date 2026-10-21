"use client";

import type { ReactNode } from "react";
import { AdminModal } from "./admin-modal";

type ConfirmModalProps = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const titleId = "admin-confirm-title";

  return (
    <AdminModal onClose={onCancel} titleId={titleId}>
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      <div className="admin-modal-actions">
        <button
          className="admin-secondary-button"
          disabled={isPending}
          onClick={onCancel}
          type="button"
        >
          Hủy
        </button>
        <button
          className={destructive ? "admin-danger-button" : "admin-primary-button"}
          disabled={isPending}
          onClick={onConfirm}
          type="button"
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
