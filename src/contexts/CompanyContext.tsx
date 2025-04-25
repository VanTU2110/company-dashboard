import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getCompanyDetail } from '../services/companyService';
import { CompanyDetail } from '../types/company';
import { ApiResponse } from '../types/common';

// Định nghĩa kiểu dữ liệu cho context
interface CompanyContextType {
  companyData: CompanyDetail | null;
  loading: boolean;
  error: any;
  refreshCompanyData: () => Promise<void>;
}

// Tạo context với giá trị mặc định
export const CompanyContext = createContext<CompanyContextType>({
  companyData: null,
  loading: true,
  error: null,
  refreshCompanyData: async () => {}
});

// Props cho CompanyProvider
interface CompanyProviderProps {
  children: ReactNode;
}

// Tạo Provider component
export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companyData, setCompanyData] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Hàm để lấy thông tin công ty
  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response: ApiResponse<CompanyDetail> = await getCompanyDetail();
      if (response.data) {
        setCompanyData(response.data);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để làm mới dữ liệu công ty (có thể gọi khi cần)
  const refreshCompanyData = async () => {
    await fetchCompanyData();
  };

  // Gọi API khi component mount lần đầu
  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Cung cấp giá trị context cho các component con
  return (
    <CompanyContext.Provider value={{ companyData, loading, error, refreshCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook để sử dụng context dễ dàng hơn
export const useCompany = () => useContext(CompanyContext);