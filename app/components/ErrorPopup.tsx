import React from 'react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-red-600 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-red-100 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;