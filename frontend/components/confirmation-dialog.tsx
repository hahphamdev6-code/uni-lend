"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./confirmation-dialog.module.css";

type ConfirmationDialogProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  busy?: boolean;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  title,
  children,
  confirmLabel,
  cancelLabel = "Hủy",
  pendingLabel = "Đang xử lý...",
  busy = false,
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(busy);
  const onCancelRef = useRef(onCancel);
  busyRef.current = busy;
  onCancelRef.current = onCancel;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) {
        event.preventDefault();
        return;
      }

      const firstButton = buttons.item(0);
      const lastButton = buttons.item(buttons.length - 1);
      if (!firstButton || !lastButton) return;
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  return (
    <div className={styles.backdrop}>
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.dialog}
        ref={dialogRef}
        role="alertdialog"
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        <div className={styles.description} id={descriptionId}>{children}</div>
        <div className={styles.actions}>
          <button
            className={styles.cancel}
            disabled={busy}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={tone === "danger" ? styles.danger : styles.primary}
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {busy ? pendingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
