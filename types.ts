export interface CustomerData {
  id: number;
  saleDate: Date;
  channel: string;
  payment: string;
  facebookName: string;
  salesperson: string;
  product: string;
  quantity: number;
  price: number;
  recipientName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface CustomerSummaryData {
  name: string;
  phone: string;
  fullAddress: string;
  totalSpent: number;
  purchaseCount: number;
  mostFrequentProduct: {
      name: string;
      count: number;
  };
}