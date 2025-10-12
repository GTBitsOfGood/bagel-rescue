import React from 'react';

interface Props {
  text: string;
  onClose?: () => void;
}

export default function ErrorBanner({ text, onClose }: Props) {
  if (!text) return null;

  return (
    <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <p className="text-red-400 text-sm font-medium">{text}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="Close error message"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}
