// app/components/SimpleModal.tsx
"use client";

import { useEffect } from "react";

interface SimpleModalProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function SimpleModal({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onCancel,
}: SimpleModalProps) {
  // 🔹 ESC 키로 닫기
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onCancel) onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (onCancel) onCancel();
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "460px",
          maxWidth: "95%",
          backgroundColor: "#fff",
          borderRadius: "18px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
          padding: "28px 28px 22px",
          boxSizing: "border-box",
        }}
      >
        {/* 제목 */}
        {title && (
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "12px",
              color: "#111827",
            }}
          >
            {title}
          </div>
        )}

        {/* 내용 */}
        {message && (
          <div
            style={{
              fontSize: "14px",
              color: "#4b5563",
              lineHeight: 1.6,
              marginBottom: "22px",
              whiteSpace: "pre-line",
            }}
          >
            {message}
          </div>
        )}

        {/* 버튼 영역 */}
        <div
          style={{
            display: "flex",
            justifyContent: cancelText ? "flex-end" : "center",
            gap: "10px",
          }}
        >
          {/* 취소 버튼 (옵션) */}
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                minWidth: "92px",
                padding: "9px 16px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                fontSize: "13px",
                color: "#4b5563",
                cursor: "pointer",
              }}
            >
              {cancelText}
            </button>
          )}

          {/* 확인 버튼 (파란색) */}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              minWidth: "92px",
              padding: "9px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


