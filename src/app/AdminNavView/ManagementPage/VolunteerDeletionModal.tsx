"use client";

import React, { useEffect } from "react";

interface VolunteerDeletionModalProps {
  isOpen: boolean;
  volunteerName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

function VolunteerDeletionModal({
  isOpen,
  volunteerName,
  onClose,
  onConfirm,
}: VolunteerDeletionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-volunteer-title"
      aria-describedby="delete-volunteer-description"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          <h2
            id="delete-volunteer-title"
            className="text-xl font-semibold text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]"
          >
            Delete volunteer?
          </h2>

          <p
            id="delete-volunteer-description"
            className="text-sm leading-6 text-[#6C7D93]"
          >
            {volunteerName
              ? `Are you sure you want to delete ${volunteerName}? This action cannot be undone.`
              : "Are you sure you want to delete this volunteer? This action cannot be undone."}
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#D3D8DE] bg-white px-4 py-2 text-sm font-medium text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)] transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-[#D92D20] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDeletionModal;
