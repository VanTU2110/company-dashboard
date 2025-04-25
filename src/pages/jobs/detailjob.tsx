import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Edit, Calendar, Building, DollarSign, Clock, Plus } from 'lucide-react';
import { JobItem, UpdateJob } from '../../types/job';
import { updateJob, detailJob } from '../../services/jobService';

const JobDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateJob | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const getJobDetail = async () => {
      if (!uuid) {
        setError('Không tìm thấy mã công việc');
        setLoading(false);
        return;
      }
  
      try {
        const response = await detailJob(uuid);
        
        // Kiểm tra response có thành công không
        if (response.error.code !== 'success' || !response.data) {
          setError('Không tìm thấy thông tin công việc');
          setLoading(false);
          return;
        }
        
        // Lấy dữ liệu job trực tiếp từ response.data
        const jobData = response.data;
        
        setJob(jobData);
        setFormData({
          uuid: jobData.uuid,
          title: jobData.tittle,
          description: jobData.description,
          jobType: jobData.jobType,
          salaryType: jobData.salaryType,
          salaryMin: jobData.salaryMin,
          salaryMax: jobData.salaryMax,
          salaryFixed: jobData.salaryFixed,
          currency: jobData.currency,
          requirements: jobData.requirements,
          companyUuid: jobData.company.uuid
        });
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Có lỗi xảy ra khi tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };
  
    getJobDetail();
  }, [uuid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value ? Number(value) : 0 };
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    
    // Đảm bảo companyUuid luôn được truyền vào
    if (!formData.companyUuid && job && job.company) {
      formData.companyUuid = job.company.uuid;
    }
    
    setIsSaving(true);
    try {
      await updateJob(formData);
      // Sau khi cập nhật thành công, tải lại dữ liệu
      if (uuid) {
        const response = await detailJob(uuid);
        if (response.error.code === 'success' && response.data) {
          setJob(response.data);
        }
      }
      setIsEditing(false);
      // Hiển thị thông báo thành công ở đây nếu cần
    } catch (err) {
      console.error('Error updating job:', err);
      // Hiển thị thông báo lỗi ở đây nếu cần
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      // Thêm logic xóa công việc ở đây
      // Sau khi xóa thành công, chuyển về trang danh sách
      navigate('/jobs');
    }
  };

  const handleUpdateJob = () => {
    // Trước khi chuyển sang chế độ chỉnh sửa, đảm bảo companyUuid đã được thiết lập
    if (formData && !formData.companyUuid && job && job.company) {
      setFormData(prev => {
        if (!prev) return null;
        return { ...prev, companyUuid: job.company.uuid };
      });
    }
    setIsEditing(true);
  };

  const handleAddSchedule = () => {
    // Thêm logic để mở modal hoặc chuyển đến trang thêm lịch làm việc
    console.log('Thêm mới lịch làm việc');
    // Có thể mở modal hoặc redirect đến trang thêm lịch làm việc
    if (job) {
      // Chuyển hướng đến trang thêm lịch làm việc với uuid của công việc
      navigate(`/jobs/${job.uuid}/schedules/add`);
    }
  };

  const handleAddSkill = () => {
    if (job) {
      // Chuyển hướng đến trang thêm kỹ năng với uuid của công việc
      navigate(`/jobs/${job.uuid}/skills/add`);
     
    }
  };

  // Format lương với đơn vị tiền tệ
  const formatSalary = (job: JobItem) => {
    if (job.salaryType === 'fixed') {
      return `${job.salaryFixed.toLocaleString()} ${job.currency}`;
    } else if (job.salaryType === 'range') {
      return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`;
    }
    return 'Thương lượng';
  };

  // Mapping cho hiển thị của JobType
  const jobTypeDisplay: Record<string, string> = {
    'fulltime': 'Toàn thời gian',
    'parttime': 'Bán thời gian',
    'internship': 'Thực tập',
    'remote': 'Làm việc từ xa',
    'on-site': 'Tại văn phòng',
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Format lịch làm việc
  const formatDayOfWeek = (day: string): string => {
    const daysMap: Record<string, string> = {
      'monday': 'Thứ 2',
      'tuesday': 'Thứ 3',
      'wednesday': 'Thứ 4',
      'thursday': 'Thứ 5',
      'friday': 'Thứ 6',
      'saturday': 'Thứ 7',
      'sunday': 'Chủ nhật'
    };
    return daysMap[day] || day;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'Không tìm thấy thông tin công việc'}</p>
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách công việc
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách công việc
          </Link>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" /> Lưu thay đổi
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleUpdateJob} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Edit size={16} className="mr-2" /> Cập nhật công việc
                </button>
                <button 
                  onClick={handleDelete} 
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" /> Xóa
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề công việc</label>
                <input
                  type="text"
                  name="tittle"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tiêu đề công việc"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
                  <select
                    name="jobType"
                    value={formData.jobType || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fulltime">Toàn thời gian</option>
                    <option value="parttime">Bán thời gian</option>
                    <option value="internship">Thực tập</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại lương</label>
                  <select
                    name="salaryType"
                    value={formData.salaryType || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fixed">Cố định</option>
                    <option value="range">Khoảng</option>
                  </select>
                </div>
              </div>
              
              {formData.salaryType === 'fixed' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương cố định</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="salaryFixed"
                      value={formData.salaryFixed || 0}
                      onChange={handleNumberInputChange}
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      name="currency"
                      value={formData.currency || ''}
                      onChange={handleInputChange}
                      className="w-24 p-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VND"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lương tối thiểu</label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin || 0}
                      onChange={handleNumberInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lương tối đa</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax || 0}
                        onChange={handleNumberInputChange}
                        className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        name="currency"
                        value={formData.currency || ''}
                        onChange={handleInputChange}
                        className="w-24 p-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VND"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ẩn trường companyUuid nhưng vẫn giữ giá trị */}
              <input 
                type="hidden" 
                name="companyUuid" 
                value={formData.companyUuid || ''} 
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{job.tittle}</h1>
                <div className="mt-2 md:mt-0 flex gap-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded">
                    {jobTypeDisplay[job.jobType] || job.jobType}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-gray-700 mb-2">
                <Building size={18} className="mr-2" />
                <span className="font-medium">{job.company.name}</span>
              </div>
              <div className="flex items-center text-gray-700 mb-2">
                <DollarSign size={18} className="mr-2" />
                <span>{formatSalary(job)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar size={18} className="mr-2" />
                <span>Ngày tạo: {formatDate(job.created)}</span>
                {job.updated && (
                  <span className="ml-4">Cập nhật lần cuối: {formatDate(job.updated)}</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Mô tả công việc</h2>
          {isEditing ? (
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mô tả công việc"
            />
          ) : (
            <div className="text-gray-700 whitespace-pre-line">
              {job.description}
            </div>
          )}
        </div>

        {/* Yêu cầu */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Yêu cầu</h2>
          {isEditing ? (
            <textarea
              name="requirements"
              value={formData.requirements || ''}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập yêu cầu công việc"
            />
          ) : (
            <div className="text-gray-700 whitespace-pre-line">
              {job.requirements}
            </div>
          )}
        </div>

        {/* Kỹ năng yêu cầu */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Kỹ năng yêu cầu</h2>
            <button 
              onClick={handleAddSkill}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus size={16} className="mr-2" /> Thêm mới kĩ năng
            </button>
          </div>
          {job.listSkill && job.listSkill.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {job.listSkill.map((jobSkill) => (
                <span 
                  key={jobSkill.uuid}
                  className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md"
                >
                  {jobSkill.skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có kỹ năng nào được thêm vào.</p>
          )}
        </div>

        {/* Lịch làm việc */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Lịch làm việc</h2>
            <button 
              onClick={handleAddSchedule}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus size={16} className="mr-2" /> Thêm mới lịch làm việc
            </button>
          </div>
          {job.schedule && job.schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.schedule.map((schedule) => (
                <div 
                  key={schedule.uuid}
                  className="flex items-center p-4 border border-gray-200 rounded-md"
                >
                  <Clock size={18} className="mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">{formatDayOfWeek(schedule.dayOfWeek)}</div>
                    <div className="text-gray-600">
                      {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có lịch làm việc nào được thêm vào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;