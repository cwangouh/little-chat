import React from 'react';

interface SecondaryButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ onClick, children = 'Change bio' }) => {
    return (
        <button
            onClick={onClick}
            className="
        self-start 
        font-bold 
        text-sky-300 
        hover:bg-gray-100 
        text-sm 
        px-3 
        py-1 
        rounded
        transition-colors
        duration-200
      "
        >
            {children}
        </button>
    );
};

interface BasicModalProps {
    onClose: () => void;
    children?: React.ReactNode;
}

export const BasicModal: React.FC<BasicModalProps> = ({ onClose, children }) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-96 bg-white rounded shadow-lg p-4">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>

    );
};
