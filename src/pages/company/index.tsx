import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiInfo, FiEdit, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { CompanyDetail } from '../../types/company';
import { getCompanyDetail } from '../../services/companyService';
import { ApiResponse } from "../../types/common";

const CompanyDetailPage = () => {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        setLoading(true);
        // Gọi service để lấy chi tiết công ty
        const response: ApiResponse<CompanyDetail> = await getCompanyDetail();
        
        if (response.error.code === 'success') {
          setCompany(response.data);
        } else {
          setError(response.error.message || 'Không thể tải thông tin công ty');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error fetching company details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, []);

  const handleEdit = () => {
    // Điều hướng đến trang chỉnh sửa với ID công ty
    if (company) {
      navigate(`/company/edit-company/${company.uuid}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error || 'Không tìm thấy dữ liệu công ty'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const address = `${company.xa.name}, ${company.qh.name}, ${company.tp.name}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6 md:px-10">
        <div className="w-full mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition mb-6"
          >
            <FiArrowLeft /> Quay lại
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition shadow-sm"
            >
              <FiEdit /> Chỉnh sửa
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full mx-auto px-6 mt-[-24px]">
        <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Mô tả công ty */}
            <div>
              <h2 className="text-xl font-semibold flex items-center text-gray-800 mb-4">
                <FiInfo className="mr-2 text-blue-500" /> Thông tin công ty
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <h2 className="text-xl font-semibold flex items-center text-gray-800 mb-4">
                <FiMapPin className="mr-2 text-blue-500" /> Địa chỉ
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{address}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Thông tin liên hệ */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin liên hệ</h2>
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FiMail />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FiPhone />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                    <a href={`tel:${company.phoneNumber}`} className="text-blue-600 hover:underline">
                      {company.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mã công ty và người dùng */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-800 mb-1">Mã công ty</p>
                <p className="font-mono text-sm text-gray-600 bg-white p-2 rounded overflow-x-auto">
                  {company.uuid}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Mã người dùng</p>
                <p className="font-mono text-sm text-gray-600 bg-white p-2 rounded overflow-x-auto">
                  {company.userUuid}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mx-auto px-6 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center text-sm text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </footer>
    </div>
  );
};


export default CompanyDetailPage;