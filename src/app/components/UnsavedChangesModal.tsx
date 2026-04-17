import styles from "./UnsavedChangesModal.module.css";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Are you sure you want to return?</h1>
        <p className={styles.subtitle}>Your unsaved changes will be lost.</p>
        <div className={styles.buttons}>
          <button className={styles.confirm} onClick={onConfirm}>Lose Changes</button>
          <button className={styles.cancel} onClick={onCancel}>Continue editing</button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
