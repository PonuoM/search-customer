import React from 'react';
import { CustomerSummaryData } from '../types.ts';
import UserIcon from './icons/UserIcon.tsx';
import PhoneIcon from './icons/PhoneIcon.tsx';
import AddressIcon from './icons/AddressIcon.tsx';
import DollarIcon from './icons/DollarIcon.tsx';
import CartIcon from './icons/CartIcon.tsx';

interface CustomerSummaryProps {
  data: CustomerSummaryData;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 mt-1 text-[var(--text-subtle)]">{icon}</div>
    <div className="ml-3">
      <p className="text-sm font-medium text-[var(--text-subtle)]">{label}</p>
      <p className="text-base font-semibold text-[var(--text-strong)]">{value}</p>
    </div>
  </div>
);

const CustomerSummary: React.FC<CustomerSummaryProps> = ({ data }) => {
  return (
    <div className="glass-card rounded-lg p-6 w-full">
      <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">สรุปข้อมูลลูกค้า</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
        <InfoItem icon={<UserIcon />} label="ชื่อลูกค้า" value={data.name} />
        <InfoItem icon={<PhoneIcon />} label="เบอร์โทรศัพท์" value={data.phone} />
        <InfoItem icon={<AddressIcon />} label="ที่อยู่" value={data.fullAddress || '-'} />
        <InfoItem icon={<DollarIcon />} label="ยอดใช้จ่ายทั้งหมด" value={`${data.totalSpent.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท`} />
        <InfoItem icon={<CartIcon />} label="จำนวนครั้งที่ซื้อ" value={`${data.purchaseCount.toLocaleString('th-TH')} ครั้ง`} />
        <InfoItem icon={<CartIcon />} label="สินค้าที่ซื้อบ่อยที่สุด" value={`${data.mostFrequentProduct.name} (${data.mostFrequentProduct.count.toLocaleString('th-TH')} ชิ้น)`} />
      </div>
    </div>
  );
};

export default CustomerSummary;