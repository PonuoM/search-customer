import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }
    
    const buttonClass = "px-4 py-2 rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors glass-card";

    return (
        <div className="flex items-center justify-end text-sm text-[var(--text-subtle)] space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={buttonClass}
            >
                ย้อนกลับ
            </button>
            <span className="px-4 py-2 text-[var(--text-strong)] font-semibold glass-card rounded-lg">
                หน้า {currentPage} จาก {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={buttonClass}
            >
                ถัดไป
            </button>
        </div>
    );
};

export default Pagination;