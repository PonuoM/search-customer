import React from 'react';
import { CustomerData } from '../types';

interface ResultsTableProps {
  records: CustomerData[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ records }) => {
  const headers = [
    { key: 'date', label: 'วันที่', className: 'text-left' },
    { key: 'product', label: 'สินค้า', className: 'w-2/5 text-left' },
    { key: 'quantity', label: 'จำนวน', className: 'text-center' },
    { key: 'salesperson', label: 'ผู้ขาย', className: 'text-left' },
    { key: 'price', label: 'ราคา (บาท)', className: 'w-1/5 text-right' }
  ];

  return (
    <div className="w-full">
        <h3 className="text-xl font-semibold text-[var(--text-strong)] mb-4">ประวัติการซื้อ</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              {headers.map(header => (
                <th key={header.key} scope="col" className={`px-4 py-3 font-semibold text-[var(--text-subtle)] uppercase ${header.className}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={`${record.id}-${index}`} className="border-b border-[var(--glass-border)]">
                <td className="px-4 py-4 text-[var(--text-subtle)] whitespace-nowrap">{record.saleDate.toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-4 text-[var(--text-strong)] font-medium">{record.product}</td>
                <td className="px-4 py-4 text-center text-[var(--text-subtle)]">{record.quantity.toLocaleString('th-TH')}</td>
                <td className="px-4 py-4 text-[var(--text-subtle)]">{record.salesperson}</td>
                <td className="px-4 py-4 text-right text-[var(--text-strong)] font-medium">
                  {record.price.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
             {records.length === 0 && (
                <tr>
                    <td colSpan={headers.length} className="text-center py-10 text-[var(--text-subtle)]">
                        ไม่พบข้อมูล
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;