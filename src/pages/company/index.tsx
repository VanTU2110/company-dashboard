import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiInfo, FiEdit, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { CompanyDetail } from '../../types/company';
import { getCompanyDetail } from '../../services/companyService';
import { ApiResponse } from "../../types/common";
import { detailUser } from '../../services/userService';
import { User } from "../../types/user";

const CompanyDetailPage = () => {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyAlert, setShowVerifyAlert] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch company details
        const companyResponse: ApiResponse<CompanyDetail> = await getCompanyDetail();
        
        if (companyResponse.error.code === 'success') {
          setCompany(companyResponse.data);
          
          // If company data is available, fetch user details
          if (companyResponse.data?.userUuid) {
            const userResponse = await detailUser(companyResponse.data.userUuid);
            
            if (userResponse.error.code === 'success') {
              setUser(userResponse.data);
              setShowVerifyAlert(!userResponse.data.isVerify);
            } else {
              setError(userResponse.error.message || 'Không thể tải thông tin người dùng');
            }
          }
        } else {
          setError(companyResponse.error.message || 'Không thể tải thông tin công ty');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    if (company) {
      navigate(`/company/edit-company/${company.uuid}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleVerifyClick = () => {
    if (user) {
      navigate(`/verify-otp?email=${user.email}`);
    }
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              {user?.isVerify ? (
                <span className="text-green-300 flex items-center" title="Đã xác thực">
                  <FiCheckCircle />
                </span>
              ) : (
                <span className="text-yellow-300 flex items-center" title="Chưa xác thực">
                  <FiAlertCircle />
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition shadow-sm"
              >
                <FiEdit /> Chỉnh sửa
              </button>
              {!user?.isVerify && (
                <button
                  onClick={handleVerifyClick}
                  className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition shadow-sm"
                >
                  Xác thực tài khoản
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Verify Alert */}
      {showVerifyAlert && (
        <div className="w-full mx-auto px-6 mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Tài khoản của bạn chưa được xác thực. Vui lòng xác thực để sử dụng đầy đủ tính năng.
                  <button
                    onClick={handleVerifyClick}
                    className="ml-2 text-yellow-700 font-medium hover:text-yellow-600 underline"
                  >
                    Xác thực ngay
                  </button>
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowVerifyAlert(false)}
                  className="text-yellow-700 hover:text-yellow-500"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="w-full mx-auto px-6 mt-6">
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
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                        {company.email}
                      </a>
                      {user?.isVerify ? (
                        <span className="text-green-500" title="Đã xác thực">
                          <FiCheckCircle size={16} />
                        </span>
                      ) : (
                        <span className="text-yellow-500" title="Chưa xác thực">
                          <FiAlertCircle size={16} />
                        </span>
                      )}
                    </div>
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
              <div>
                <p className="font-medium text-gray-800 mb-1">Trạng thái xác thực</p>
                <p className="text-sm text-gray-600 bg-white p-2 rounded">
                  {user?.isVerify ? (
                    <span className="text-green-600 flex items-center gap-2">
                      <FiCheckCircle /> Đã xác thực
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-2">
                      <FiAlertCircle /> Chưa xác thực
                    </span>
                  )}
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