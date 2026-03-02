import React from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p>{message}</p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onConfirm}>{confirmText}</button>
          <button onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "300px",
  textAlign: "center",
};

export default ConfirmModal;
