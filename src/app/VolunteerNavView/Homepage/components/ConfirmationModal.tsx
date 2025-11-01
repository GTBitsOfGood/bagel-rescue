import React from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* greys out rest of page */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
                onClick={onCancel}
            />

            {/* confirmation modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-8 shadow-xl z-[1000] min-w-[280px] max-w-[500px]">
                <div className="flex flex-col gap-5">
                    <h3 className="text-xl font-bold text-black text-center">
                        {title}
                    </h3>
                
                    <p className="text-sm text-black leading-relaxed text-center">
                        {message}
                    </p>
                
                    <div className="flex gap-3 justify-center mt-2">
                        <button
                        className="px-6 py-3 rounded-lg text-sm font-bold transition-all text-[var(--Bagel-Rescue-Blue)] hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onCancel}
                        disabled={isLoading}
                        >
                        No, Go Back
                        </button>
                        
                        <button
                        className="px-6 py-3 rounded-lg text-sm font-bold transition-all bg-[#0F7AFF] text-white hover:bg-[#005bb5] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onConfirm}
                        disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmationModal;