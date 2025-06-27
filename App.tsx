
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CustomerData, CustomerSummaryData } from './types';
import SearchBar from './components/SearchBar';
import ResultsTable from './components/ResultsTable';
import Pagination from './components/Pagination';
import CustomerSummary from './components/CustomerSummary';
import ThemeToggle from './components/StatCard';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [allRecords, setAllRecords] = useState<CustomerData[]>([]);
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CustomerData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('prima49_sheetUrl') || '');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  // Auto-load data if URL exists from a previous session
  useEffect(() => {
    if (sheetUrl.trim()) {
      handleLoadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const ITEMS_PER_PAGE = 20;

  const HEADER_MAP: { [key: string]: keyof CustomerData } = {
    'ลำดับ': 'id', 'วันที่ขาย': 'saleDate', 'ช่องทางขาย': 'channel', 'ชำระเงิน': 'payment', 'ชื่อ Facebook': 'facebookName', 'พนักงานขาย': 'salesperson', 'สินค้า': 'product', 'จำนวน': 'quantity', 'ราคา': 'price', 'ชื่อผู้รับ': 'recipientName', 'เบอร์โทร': 'phone', 'ที่อยู่': 'address', 'ตำบล': 'subDistrict', 'อำเภอ': 'district', 'จังหวัด': 'province', 'รหัสไปรษณีย์': 'postalCode', 'รหัสไปรษณี': 'postalCode'
  };

  const handleReset = () => {
    setAllRecords([]);
    setSearchResults([]);
    setCustomerSummary(null);
    setQuery('');
    setSuggestions([]);
    setCurrentPage(1);
    setError(null);
    setSheetUrl('');
    localStorage.removeItem('prima49_sheetUrl');
  };

  const handleLoadData = useCallback(async () => {
    if (!sheetUrl.trim()) return;
    setIsLoading(true);
    setError(null);
    setAllRecords([]);
    setSearchResults([]);
    setCustomerSummary(null);
    setQuery('');
    setSuggestions([]);
    setCurrentPage(1);
    
    const url = sheetUrl;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`ไม่สามารถโหลดข้อมูลได้ Status: ${response.status}`);
        }
        const csvText = await response.text();
        
        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length < 2) throw new Error("ไฟล์ CSV ว่างเปล่าหรือไม่มีข้อมูล");

        const headerLine = lines.shift()!;
        const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        const records: CustomerData[] = lines.map((line, index) => {
            if (!line.trim()) return null;
             // Improved CSV parsing to handle commas inside quoted fields
             const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));

            const record: any = { id: index + 1 };
            headers.forEach((header, i) => {
                const key = HEADER_MAP[header];
                if (key && i < values.length) {
                    let value = values[i];
                    if (key === 'price' || key === 'quantity') {
                        const cleanedValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
                        record[key] = parseFloat(cleanedValue) || 0;
                    } else if (key === 'saleDate') {
                        const parsedDate = new Date(value);
                        if (!isNaN(parsedDate.getTime())) {
                            record[key] = parsedDate;
                        } else {
                            // Try parsing DD/MM/YYYY format
                            const parts = value.split('/');
                            if (parts.length === 3) {
                                // new Date(year, month-1, day)
                                const isoDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                                if (!isNaN(isoDate.getTime())) {
                                    record[key] = isoDate;
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
        localStorage.setItem('prima49_sheetUrl', url);
    } catch (err) {
        console.error("Error processing sheet:", err);
        setError(err instanceof Error ? `เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}` : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
        setIsLoading(false);
    }
  }, [sheetUrl]);

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

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 flex flex-col items-center relative">
        <div className="background">
            <div className="blob blob1"></div>
            <div className="blob blob2"></div>
        </div>
        
        <ThemeToggle theme={theme} setTheme={setTheme} />
        
        <div className="w-full max-w-5xl flex flex-col h-screen pt-12">
            <div className="w-full max-w-3xl mx-auto mb-8">
                {allRecords.length === 0 ? (
                    <div className="glass-card rounded-lg p-6 sm:p-8 w-full flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">เชื่อมต่อกับ Google Sheets</h2>
                        <div className="text-left text-[var(--text-subtle)] space-y-2 mb-6 w-full text-sm sm:text-base">
                             <p>1. เปิด Google Sheet และไปที่ <code className="bg-[var(--hover-bg)] px-1 py-0.5 rounded font-mono">File &gt; Share &gt; Publish to web</code></p>
                             <p>2. เลือกชีตที่ต้องการ และตั้งค่าเป็น <code className="bg-[var(--hover-bg)] px-1 py-0.5 rounded font-mono">Comma-separated values (.csv)</code></p>
                             <p>3. กด <code className="bg-[var(--hover-bg)] px-1 py-0.5 rounded font-mono">Publish</code> คัดลอกลิงก์ที่ได้ และนำมาวางข้างล่างนี้</p>
                        </div>
                        <div className="w-full flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                                type="text"
                                value={sheetUrl}
                                onChange={(e) => setSheetUrl(e.target.value)}
                                placeholder="วางลิงก์ CSV ที่นี่"
                                className="block w-full h-12 p-4 text-md text-[var(--text-strong)] rounded-lg bg-transparent border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[var(--text-subtle)]"
                                disabled={isLoading}
                                aria-label="Google Sheet CSV URL"
                            />
                            <button onClick={handleLoadData} disabled={isLoading || !sheetUrl.trim()} className="h-12 w-full sm:w-auto px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'โหลดข้อมูล'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow">
                        <SearchBar 
                            query={query}
                            onQueryChange={handleQueryChange}
                            suggestions={suggestions}
                            onSuggestionSelect={handleSelectCustomer}
                            disabled={isLoading} 
                        />
                      </div>
                      <button onClick={handleReset} title="Change Google Sheet" className="h-12 px-4 text-sm rounded-lg hover:bg-[var(--hover-bg)] glass-card text-[var(--text-subtle)] flex-shrink-0">
                        เปลี่ยนชีต
                      </button>
                    </div>
                )}
            </div>

            {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg text-center w-full max-w-3xl mx-auto">{error}</p>}

            {searchResults.length > 0 && customerSummary ? (
                 <div className="flex-grow flex flex-col space-y-6 overflow-hidden">
                    <div className="px-2">
                        <CustomerSummary data={customerSummary} />
                        <div className="glass-card rounded-lg p-4 mt-4 flex items-center">
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
                    <div className="flex-grow overflow-y-auto px-2 pb-4">
                        <div className="glass-card rounded-lg p-4">
                            <ResultsTable records={currentRecords} />
                            <div className="pt-4">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (!isLoading && allRecords.length > 0 && query && suggestions.length === 0 &&
                <div className="glass-card rounded-lg p-8 text-center text-[var(--text-subtle)] w-full max-w-3xl mx-auto">
                    ไม่พบข้อมูลสำหรับ "{query}"
                </div>
            )}
        </div>
    </div>
  );
};

export default App;
