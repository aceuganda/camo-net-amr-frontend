import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  cancelText?: any;
  submitText?: any;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cancelText = "Cancel",
  submitText = "OK",
  children,
}) => {
  if (!isOpen) return null;

  const handleClickAway:any = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={handleClickAway}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div>{children}</div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 bg-[#00b9f1] text-white rounded "
            onClick={onSubmit}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
