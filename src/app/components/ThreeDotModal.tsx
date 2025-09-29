"use client";
import React from "react";
import styles from "./ThreeDotModal.module.css";

interface ThreeDotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

const ThreeDotModal: React.FC<ThreeDotModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  position,
}) => {
  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={styles.modal}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-80%, 0)',
        }}
      >
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 18C2.45 18 1.97934 17.8043 1.588 17.413C1.19667 17.0217 1.00067 16.5507 1 16V3C0.71667 3 0.479337 2.904 0.288004 2.712C0.0966702 2.52 0.000670115 2.28267 3.44827e-06 2C-0.000663218 1.71733 0.0953369 1.48 0.288004 1.288C0.48067 1.096 0.718003 1 1 1H5C5 0.716667 5.096 0.479333 5.288 0.288C5.48 0.0966668 5.71734 0.000666667 6 0H10C10.2833 0 10.521 0.0960001 10.713 0.288C10.905 0.48 11.0007 0.717333 11 1H15C15.2833 1 15.521 1.096 15.713 1.288C15.905 1.48 16.0007 1.71733 16 2C15.9993 2.28267 15.9033 2.52033 15.712 2.713C15.5207 2.90567 15.2833 3.00133 15 3V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.805 13.5507 18.0007 13 18H3ZM13 3H3V16H13V3ZM6 14C6.28334 14 6.521 13.904 6.713 13.712C6.905 13.52 7.00067 13.2827 7 13V6C7 5.71667 6.904 5.47933 6.712 5.288C6.52 5.09667 6.28267 5.00067 6 5C5.71734 4.99933 5.48 5.09533 5.288 5.288C5.096 5.48067 5 5.718 5 6V13C5 13.2833 5.096 13.521 5.288 13.713C5.48 13.905 5.71734 14.0007 6 14ZM10 14C10.2833 14 10.521 13.904 10.713 13.712C10.905 13.52 11.0007 13.2827 11 13V6C11 5.71667 10.904 5.47933 10.712 5.288C10.52 5.09667 10.2827 5.00067 10 5C9.71734 4.99933 9.48 5.09533 9.288 5.288C9.096 5.48067 9 5.718 9 6V13C9 13.2833 9.096 13.521 9.288 13.713C9.48 13.905 9.71734 14.0007 10 14Z" fill="#E60000"/>
          </svg>
          Delete Shift
        </button>
      </div>
    </>
  );
};

export default ThreeDotModal;
