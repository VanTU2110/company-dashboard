// CreateJobPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { insertJob } from '../../services/jobService';
import { InsertJob } from '../../types/job';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
const CreateJobPage = () => {
  const { companyData } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
 
  
  const [jobData, setJobData] = useState<InsertJob>({
    title: '',
    description: '',
    jobType: 'remote',
    salaryType: 'fixed',
    currency: 'VND',
    requirements: '',
    companyUuid: '',
    salaryFixed: 0,
  });
  useEffect(() => {
    if (companyData && companyData.uuid) {
      setJobData(prev => ({
        ...prev,
        companyUuid: companyData.uuid,
      }));
    }
  }, [companyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
    
    // Xóa các trường lương không cần thiết khi thay đổi loại lương
    if (name === 'salaryType') {
      if (value === 'fixed') {
        setJobData(prev => ({ 
          ...prev, 
          salaryType: value,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryFixed: prev.salaryFixed || 0
        }));
      } else {
        setJobData(prev => ({ 
          ...prev, 
          salaryType: value,
          salaryFixed: undefined,
          salaryMin: prev.salaryMin || 0,
          salaryMax: prev.salaryMax || 0
        }));
      }
    }
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? undefined : Number(value);
    setJobData(prev => ({ ...prev, [name]: numericValue }));
  };

  const validateForm = (): boolean => {
    if (!jobData.tittle) {
      setError('Vui lòng nhập tiêu đề công việc');
      return false;
    }
    if (!jobData.description) {
      setError('Vui lòng nhập mô tả công việc');
      return false;
    }
    if (!jobData.requirements) {
      setError('Vui lòng nhập yêu cầu công việc');
      return false;
    }
    if (!jobData.companyUuid) {
      setError('Vui lòng chọn công ty');
      return false;
    }

    // Kiểm tra lương
    if (jobData.salaryType === 'fixed') {
      if (!jobData.salaryFixed || jobData.salaryFixed <= 0) {
        setError('Vui lòng nhập mức lương cố định hợp lệ');
        return false;
      }
    } else {
      if (!jobData.salaryMin || jobData.salaryMin <= 0) {
        setError('Vui lòng nhập mức lương tối thiểu hợp lệ');
        return false;
      }
      if (!jobData.salaryMax || jobData.salaryMax <= 0) {
        setError('Vui lòng nhập mức lương tối đa hợp lệ');
        return false;
      }
      if (jobData.salaryMin >= jobData.salaryMax) {
        setError('Mức lương tối thiểu phải nhỏ hơn mức lương tối đa');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await insertJob(jobData);
      setSuccess(true);
      
      // Chuyển hướng về trang danh sách công việc sau 2 giây
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating job:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center text-white mb-4 hover:underline"
          >
            <ArrowLeft size={18} className="mr-1" />
            Quay lại danh sách công việc
          </button>
          <h1 className="text-3xl font-bold text-white">Tạo công việc mới</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Thành công! </strong>
            <span className="block sm:inline">Công việc đã được tạo thành công. Đang chuyển hướng...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Thông tin cơ bản */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Thông tin cơ bản</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tittle"
                  value={jobData.tittle}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề công việc"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

             

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại công việc <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="remote">Remote</option>
                  <option value="fulltime">Toàn thời gian</option>
                  <option value="parttime">Bán thời gian</option>
                  <option value="internship">Thực tập</option>
                </select> 
              </div>
            </div>

            {/* Thông tin lương */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Thông tin lương</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại lương <span className="text-red-500">*</span>
                </label>
                <select
                  name="salaryType"
                  value={jobData.salaryType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="fixed">Cố định</option>
                  <option value="monthly">Theo tháng</option>
                  <option value="daily">Theo ngày</option>
                  <option value="hourly">Theo giờ</option>
                </select>
              </div>

              {jobData.salaryType === 'fixed' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức lương cố định <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="salaryFixed"
                      value={jobData.salaryFixed || ''}
                      onChange={handleNumericInputChange}
                      placeholder="Nhập mức lương cố định"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức lương tối thiểu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="salaryMin"
                        value={jobData.salaryMin || ''}
                        onChange={handleNumericInputChange}
                        placeholder="Nhập mức lương tối thiểu"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                      />
                      <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức lương tối đa <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="salaryMax"
                        value={jobData.salaryMax || ''}
                        onChange={handleNumericInputChange}
                        placeholder="Nhập mức lương tối đa"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="0"
                      />
                      <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tiền tệ <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={jobData.currency}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Mô tả và yêu cầu */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Mô tả và yêu cầu</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={jobData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả chi tiết về công việc"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="requirements"
                  value={jobData.requirements}
                  onChange={handleInputChange}
                  placeholder="Nhập các yêu cầu đối với ứng viên"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                  required
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">Mỗi yêu cầu nên được viết trên một dòng riêng biệt.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu công việc
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

export default CreateJobPage;