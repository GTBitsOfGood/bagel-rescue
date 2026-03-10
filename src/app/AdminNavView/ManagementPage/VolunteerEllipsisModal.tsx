"use client";

import React from "react";
import styles from "./VolunteerEllipsisModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

interface VolunteerEllipsisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

const VolunteerEllipsisModal: React.FC<VolunteerEllipsisModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => e.stopPropagation()}
      />

      <div
        className={styles.modal}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-92%, 0px)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.menuButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <FontAwesomeIcon icon={faPencil} />
          Edit Volunteer
        </button>

        <button
          type="button"
          className={`${styles.menuButton} ${styles.deleteButton}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FontAwesomeIcon icon={faTrash} color={"red"} />
          Delete Volunteer
        </button>
      </div>
    </>
  );
};

export default VolunteerEllipsisModal;
