import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(dragging);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      handleDragEvents(e, false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        onFileSelect(file);
      } else {
        alert('Please drop an Excel file (.xlsx or .xls)');
      }
  }, [onFileSelect]);


  return (
    <div className="glass-card rounded-lg p-4 text-center">
        <label
            htmlFor="file-upload"
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full min-h-[20rem] px-4 transition-all duration-300 border-2 border-dashed rounded-lg cursor-pointer
            ${isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-[var(--glass-border)] hover:border-blue-400/80'}`}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <UploadIcon className="w-10 h-10 mb-4 text-[var(--text-subtle)]" />
              {isLoading ? (
                <>
                  <p className="text-lg font-semibold text-blue-500">กำลังประมวลผล...</p>
                  <p className="text-sm text-[var(--text-subtle)]">กรุณารอสักครู่</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-2">อัปโหลดไฟล์ข้อมูลลูกค้า</h3>
                  <p className="mb-2 text-sm text-[var(--text-subtle)]"><span className="font-semibold text-blue-500">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์ Excel มาวาง</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">รองรับไฟล์ XLSX, XLS</p>
                </>
              )}
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .xls" disabled={isLoading} />
        </label>
    </div>
  );
};

export default FileUpload;