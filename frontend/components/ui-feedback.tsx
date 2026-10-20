"use client";

import { useEffect } from "react";

type ConfirmationDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationDialog({ title, message, confirmLabel, onCancel, onConfirm }: ConfirmationDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <span className="confirm-modal-mark" aria-hidden="true">?</span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>Để sau</button>
          <button className="primary-button" type="button" onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

export function ToastNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="toast-message" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <p>{message}</p>
      <button type="button" aria-label="Đóng thông báo" onClick={onDismiss}>×</button>
    </div>
  );
}