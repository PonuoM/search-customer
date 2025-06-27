
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CustomerData, CustomerSummaryData } from './types.ts';
import SearchBar from './components/SearchBar.tsx';
import ResultsTable from './components/ResultsTable.tsx';
import Pagination from './components/Pagination.tsx';
import CustomerSummary from './components/CustomerSummary.tsx';
import ThemeToggle from './components/StatCard.tsx';
import AiAssistant from './components/AiAssistant.tsx';
import FileUpload from './components/FileUpload.tsx';

declare var XLSX: any;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [allRecords, setAllRecords] = useState<CustomerData[]>([]);
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CustomerData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const ITEMS_PER_PAGE = 20;

  const HEADER_MAP: { [key: string]: keyof CustomerData } = {
    'ลำดับ': 'id', 'วันที่ขาย': 'saleDate', 'ช่องทางขาย': 'channel', 'ชำระเงิน': 'payment', 'ชื่อ Facebook': 'facebookName', 'พนักงานขาย': 'salesperson', 'สินค้า': 'product', 'จำนวน': 'quantity', 'ราคา': 'price', 'ชื่อผู้รับ': 'recipientName', 'เบอร์โทร': 'phone', 'ที่อยู่': 'address', 'ตำบล': 'subDistrict', 'อำเภอ': 'district', 'จังหวัด': 'province', 'รหัสไปรษณีย์': 'postalCode', 'รหัสไปรษณี': 'postalCode'
  };
  
  const processExcelData = useCallback((arrayBuffer: ArrayBuffer) => {
    setIsLoading(true);
    try {
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) throw new Error("ไฟล์ Excel ว่างเปล่าหรือไม่มีข้อมูล");
        
        const headerRow = jsonData.shift()!;
        const headers = headerRow.map(h => String(h).trim());
        
        const records: CustomerData[] = jsonData.map((row, index) => {
          if (!row || row.length === 0 || row.every(cell => cell === null || cell === '')) return null;

          const record: any = { id: index + 1 };
          headers.forEach((header, i) => {
            const key = HEADER_MAP[header];
            if (key && i < row.length) {
              let value = row[i];
              if (key === 'price' || key === 'quantity') {
                  const cleanedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
                  record[key] = parseFloat(cleanedValue) || 0;
              } else if (key === 'saleDate') {
                  if(typeof value === 'number') { // Excel date serial number
                      record[key] = new Date(Math.round((value - 25569) * 86400 * 1000));
                  } else if (typeof value === 'string') {
                      const parsedDate = new Date(value);
                      if (!isNaN(parsedDate.getTime())) {
                          record[key] = parsedDate;
                      } else {
                          const parts = value.split('/');
                          if (parts.length === 3) {
                              // Assuming dd/mm/yyyy format
                              const isoDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                              if (!isNaN(isoDate.getTime())) {
                                  record[key] = isoDate;
                              }
                          }
                      }
                  }
              } else {
                  record[key] = value;
              }
            }
          });
          if (!(record.saleDate instanceof Date)) return null;
          return record as CustomerData;
        }).filter((r): r is CustomerData => r !== null && !!r.recipientName && !!r.phone);

        setAllRecords(records);
        setError(null);
        setShowFileUpload(false);
      } catch (err) {
        console.error("Error processing sheet:", err);
        setError(err instanceof Error ? `เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${err.message}` : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
        setShowFileUpload(true);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      // Use a relative path to be compatible with GitHub Pages subdirectories
      const dataUrl = 'data.xlsx';
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          if (response.status === 404) {
             setShowFileUpload(true);
             setError("ไม่พบไฟล์ 'data.xlsx'. กรุณาวางไฟล์ในโฟลเดอร์หลักของโปรเจกต์ หรืออัปโหลดด้วยตนเอง");
          } else {
            throw new Error(`ไม่สามารถโหลดไฟล์ได้ (Status: ${response.status})`);
          }
        } else {
            const arrayBuffer = await response.arrayBuffer();
            processExcelData(arrayBuffer);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError('ไม่สามารถเชื่อมต่อเพื่อโหลดไฟล์ข้อมูลได้ กรุณาอัปโหลดด้วยตนเอง');
        setShowFileUpload(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [processExcelData]);

  const handleFileUploaded = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
            processExcelData(arrayBuffer);
        }
    };
    reader.onerror = () => {
        setError('เกิดข้อผิดพลาดในการอ่านไฟล์');
        setIsLoading(false);
    }
    reader.readAsArrayBuffer(file);
  }, [processExcelData]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
        setSuggestions([]);
        return;
    }
    const trimmedQuery = newQuery.trim().toLowerCase();
    const uniqueSuggestions = allRecords.reduce((acc, record) => {
        const isMatch = record.phone.toString().trim().includes(trimmedQuery) || record.recipientName.toLowerCase().includes(trimmedQuery);
        if (isMatch && !acc.some(s => s.phone === record.phone)) {
            acc.push(record);
        }
        return acc;
    }, [] as CustomerData[]);
    setSuggestions(uniqueSuggestions.slice(0, 5));
  };

  const handleSelectCustomer = (customer: CustomerData) => {
    setQuery('');
    setSuggestions([]);
    setCurrentPage(1);

    const results = allRecords.filter(record => record.phone === customer.phone);
    setSearchResults(results.sort((a,b) => b.saleDate.getTime() - a.saleDate.getTime()));
  };
  
  const filteredData = useMemo(() => {
    if (!isDateFilterActive) {
        return searchResults;
    }
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return searchResults.filter(record => record.saleDate >= threeMonthsAgo);
  }, [searchResults, isDateFilterActive]);


  useEffect(() => {
    if (searchResults.length > 0) {
        const dataToSummarize = filteredData;
        
        const firstResult = searchResults[0];
        const totalSpent = dataToSummarize.reduce((sum, record) => sum + (record.price || 0), 0);
        const purchaseCount = dataToSummarize.length;

        const productCounts = dataToSummarize.reduce((acc, record) => {
            const productName = record.product.trim();
            if (productName) {
                acc[productName] = (acc[productName] || 0) + record.quantity;
            }
            return acc;
        }, {} as { [key: string]: number });

        let mostFrequentProduct = { name: '-', count: 0 };
        if (Object.keys(productCounts).length > 0) {
            const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
            mostFrequentProduct = { name: topProduct[0], count: topProduct[1] };
        }
        
        const fullAddress = [firstResult.address, firstResult.subDistrict, firstResult.district, firstResult.province, firstResult.postalCode].filter(Boolean).join(' ');

        setCustomerSummary({
            name: firstResult.recipientName, phone: firstResult.phone,
            fullAddress: fullAddress,
            totalSpent: totalSpent, purchaseCount: purchaseCount,
            mostFrequentProduct: mostFrequentProduct
        });
    } else {
        setCustomerSummary(null);
    }
  }, [searchResults, filteredData]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfLastRecord = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstRecord = indexOfLastRecord - ITEMS_PER_PAGE;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const renderContent = () => {
    if (isLoading && !showFileUpload) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-[var(--text-strong)]">กำลังโหลดข้อมูล...</p>
        </div>
      )
    }

    if (showFileUpload) {
       return (
          <div className="w-full max-w-3xl flex flex-col items-center">
              <div className="glass-card rounded-lg p-6 sm:p-8 w-full mx-auto flex flex-col items-center text-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">ไม่พบไฟล์ข้อมูลเริ่มต้น</h2>
                <p className="text-[var(--text-subtle)] mt-1">กรุณาอัปโหลดไฟล์ข้อมูลเพื่อเริ่มต้นใช้งาน</p>
                {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm w-full">{error}</p>}
              </div>
              <FileUpload onFileSelect={handleFileUploaded} isLoading={isLoading} />
          </div>
       );
    }
    
    return (
       <div className="w-full max-w-5xl flex flex-col h-screen pt-12">
            <div className="w-full max-w-3xl mx-auto mb-8">
              <SearchBar 
                  query={query}
                  onQueryChange={handleQueryChange}
                  suggestions={suggestions}
                  onSuggestionSelect={handleSelectCustomer}
                  disabled={allRecords.length === 0}
              />
            </div>

            {searchResults.length > 0 && customerSummary ? (
                 <div className="flex-grow flex flex-col space-y-6 overflow-hidden">
                    <div className="px-2">
                        <CustomerSummary data={customerSummary} />
                        <div className="glass-card rounded-lg p-4 mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="date-filter"
                                    checked={isDateFilterActive}
                                    onChange={() => {
                                        setIsDateFilterActive(!isDateFilterActive);
                                        setCurrentPage(1);
                                    }}
                                    className="h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 bg-transparent"
                                />
                                <label htmlFor="date-filter" className="ml-3 block text-sm font-medium text-[var(--text-strong)]">
                                    แสดงข้อมูล 3 เดือนล่าสุด
                                </label>
                            </div>
                        </div>
                         <div className="mt-6">
                           <AiAssistant customerData={filteredData} customerName={customerSummary.name} />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto px-2 pb-4">
                        <div className="glass-card rounded-lg p-4">
                            <ResultsTable records={currentRecords} />
                            {filteredData.length > ITEMS_PER_PAGE && (
                              <div className="pt-4">
                                  <Pagination 
                                      currentPage={currentPage}
                                      totalPages={totalPages}
                                      onPageChange={handlePageChange}
                                  />
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (allRecords.length > 0 && query && suggestions.length === 0 ?
                <div className="glass-card rounded-lg p-8 text-center text-[var(--text-subtle)] w-full max-w-3xl mx-auto">
                    ไม่พบข้อมูลสำหรับ "{query}"
                </div>
                : allRecords.length > 0 && searchResults.length === 0 &&
                <div className="glass-card rounded-lg p-8 text-center text-[var(--text-subtle)] w-full max-w-3xl mx-auto">
                    <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-2">พร้อมใช้งาน</h2>
                    <p>กรุณาใช้ช่องค้นหาด้านบนเพื่อค้นหาข้อมูลลูกค้า</p>
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative">
        <div className="background">
            <div className="blob blob1"></div>
            <div className="blob blob2"></div>
        </div>
        
        <ThemeToggle theme={theme} setTheme={setTheme} />
        
        {renderContent()}
    </div>
  );
};

export default App;