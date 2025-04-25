import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiInfo, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { CompanyDetail, UpdateCompanyInput } from '../../types/company';
import { getCompanyDetail, updateCompany } from '../../services/companyService';
import { getProvinces, getDistricts, getCommunes } from '../../services/regionService';
import { Location } from '../../types/location';
import { ApiResponse } from "../../types/common";

const CompanyEditPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [formData, setFormData] = useState<UpdateCompanyInput>({
    userUuid: '',
    name: '',
    description: '',
    phoneNumber: '',
    matp: '',
    maqh: '',
    xaid: ''
  });
  
  // State cho danh sách địa chỉ
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [communes, setCommunes] = useState<Location[]>([]);
  
  // Tải dữ liệu công ty và danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tải thông tin công ty
        const response: ApiResponse<CompanyDetail> = await getCompanyDetail();
        
        if (response.error.code === 'success' && response.data) {
          setCompany(response.data);
          
          // Khởi tạo formData
          setFormData({
            userUuid: localStorage.getItem('userUuid') || '',
            name: response.data.name,
            description: response.data.description,
            phoneNumber: response.data.phoneNumber,
            matp: response.data.tp.code,
            maqh: response.data.qh.code,
            xaid: response.data.xa.code
          });
          
          // Tải danh sách tỉnh/thành phố
          const provincesData = await getProvinces({ keyword: '' });
          setProvinces(provincesData);
          
          // Tải danh sách quận/huyện dựa trên tỉnh/thành phố hiện tại
          if (response.data.tp.code) {
            const districtsData = await getDistricts({ 
              keyword: '',
              matp: response.data.tp.code
            });
            setDistricts(districtsData);
          }
          
          // Tải danh sách xã/phường dựa trên quận/huyện hiện tại
          if (response.data.qh.code) {
            const communesData = await getCommunes({
              keyword: '',
              maqh: response.data.qh.code
            });
            setCommunes(communesData);
          }
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

    fetchData();
  }, [uuid]);
  
  // Xử lý khi thay đổi tỉnh/thành phố
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      matp: provinceCode,
      maqh: '',  // Reset quận/huyện
      xaid: ''   // Reset xã/phường
    }));
    
    // Tải danh sách quận/huyện mới
    if (provinceCode) {
      try {
        const districtsData = await getDistricts({
          keyword: '',
          matp: provinceCode
        });
        setDistricts(districtsData);
        setCommunes([]); // Reset danh sách xã/phường
      } catch (err) {
        console.error('Error fetching districts:', err);
        setError('Không thể tải danh sách quận/huyện');
      }
    } else {
      setDistricts([]);
      setCommunes([]);
    }
  };
  
  // Xử lý khi thay đổi quận/huyện
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      maqh: districtCode,
      xaid: ''  // Reset xã/phường
    }));
    
    // Tải danh sách xã/phường mới
    if (districtCode) {
      try {
        const communesData = await getCommunes({
          keyword: '',
          maqh: districtCode
        });
        setCommunes(communesData);
      } catch (err) {
        console.error('Error fetching communes:', err);
        setError('Không thể tải danh sách xã/phường');
      }
    } else {
      setCommunes([]);
    }
  };
  
  // Xử lý khi thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý khi thay đổi select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Lấy userUuid từ localStorage một lần nữa để đảm bảo có dữ liệu mới nhất
      const useruuid = localStorage.getItem('useruuid');
    
    if (!useruuid) {
      setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      setSubmitting(false);
      return;
    }
    
    // Gửi dữ liệu cập nhật lên server, ánh xạ useruuid từ localStorage vào userUuid cho API
    const response = await updateCompany({
      ...formData,
      userUuid: useruuid, // Quan trọng: gán giá trị của useruuid vào thuộc tính userUuid
    });
      
      if (response.error.code === 'success') {
        setSuccessMessage('Cập nhật thông tin công ty thành công!');
        
        // Cập nhật dữ liệu công ty trong state
        setCompany(response.data);
        
        // Hiển thị thông báo thành công trong 3 giây
        setTimeout(() => {
          setSuccessMessage(null);
          navigate(`/company-profile`);
        }, 3000);
      } else {
        setError(response.error.message || 'Không thể cập nhật thông tin công ty');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi cập nhật dữ liệu');
      console.error('Error updating company:', err);
    } finally {
      setSubmitting(false);
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
  
  if (error && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={handleBack} 
            className="flex items-center mb-6 hover:text-blue-200 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Quay lại
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Chỉnh sửa thông tin công ty</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Form chỉnh sửa */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Thông báo thành công */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
                <div className="mr-3 text-green-500 text-xl">✓</div>
                <div>{successMessage}</div>
              </div>
            )}
            
            {/* Thông báo lỗi */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                <div className="mr-3 text-red-500 text-xl">⚠</div>
                <div>{error}</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiInfo className="mr-2 text-blue-500" /> Thông tin cơ bản
                  </h2>
                  
                  {/* Tên công ty */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Tên công ty <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Mô tả */}
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả công ty
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Số điện thoại */}
                  <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <FiPhone className="text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Địa chỉ */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiMapPin className="mr-2 text-blue-500" /> Địa chỉ
                  </h2>
                  
                  {/* Tỉnh/Thành phố */}
                  <div className="mb-4">
                    <label htmlFor="matp" className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="matp"
                      name="matp"
                      value={formData.matp || ''}
                      onChange={handleProvinceChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Quận/Huyện */}
                  <div className="mb-4">
                    <label htmlFor="maqh" className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="maqh"
                      name="maqh"
                      value={formData.maqh || ''}
                      onChange={handleDistrictChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!formData.matp}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Xã/Phường */}
                  <div className="mb-4">
                    <label htmlFor="xaid" className="block text-sm font-medium text-gray-700 mb-1">
                      Xã/Phường <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="xaid"
                      name="xaid"
                      value={formData.xaid || ''}
                      onChange={handleSelectChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!formData.maqh}
                    >
                      <option value="">-- Chọn Xã/Phường --</option>
                      {communes.map(commune => (
                        <option key={commune.code} value={commune.code}>
                          {commune.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Thông tin không được phép chỉnh sửa */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin không thể chỉnh sửa</h3>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <FiMail className="mr-2" />
                        <strong className="mr-1">Email:</strong> {company?.email}
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2 mt-1">🆔</span>
                        <div>
                          <strong className="mr-1">Mã công ty:</strong>
                          <span className="font-mono text-xs break-all">{company?.uuid}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Nút lưu */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 mr-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyEditPage;