"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
          transform: 'translate(-50%, 0)',
        }}
      >
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
        >
          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          Delete Shift
        </button>
      </div>
    </>
  );
};

export default ThreeDotModal;
