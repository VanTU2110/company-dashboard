// JobsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListPageJob } from '../../services/jobService';
import { getCompanyDetail } from '../../services/companyService'; // Import the company service
import { JobItem, GetJobListParams } from '../../types/job';
import { CompanyDetail } from '../../types/company'; // Add this import for the company type
import { ApiResponse } from '../../types/common'; // Add this import for the API response type
import { ArrowLeft, ArrowRight, Search, Filter, Briefcase, Clock, DollarSign, X, Plus } from 'lucide-react';

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [companyUuid, setCompanyUuid] = useState<string>('');
  
  // Các tham số tìm kiếm và lọc
  const [searchParams, setSearchParams] = useState<GetJobListParams>({
    pageSize: 10,
    page: 1,
    keyword: '',
    jobType: '',
    salaryType: '',
  });

  // Fetch company details when component mounts
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response: ApiResponse<CompanyDetail> = await getCompanyDetail();
        if (response.data && response.data.uuid) {
          setCompanyUuid(response.data.uuid);
          // Update search params with company UUID
          setSearchParams(prev => ({ ...prev, companyUuid: response.data.uuid }));
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };

    fetchCompanyDetails();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getListPageJob({ 
        ...searchParams, 
        page: currentPage,
        companyUuid: companyUuid // Ensure company UUID is included in every request
      });
      setJobs(response.data.items);
      setTotalPages(response.data.pagination.totalPage);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch jobs if companyUuid is available
    if (companyUuid) {
      fetchJobs();
    }
  }, [currentPage, searchParams.pageSize, companyUuid]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterReset = () => {
    setSearchParams({
      pageSize: 10,
      page: 1,
      keyword: '',
      jobType: '',
      salaryType: '',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryFixed: undefined,
      companyUuid: companyUuid, // Maintain the company UUID when resetting filters
    });
    setCurrentPage(1);
  };
  
  const goToJobDetail = (uuid: string) => {
    navigate(`/jobs/${uuid}`);
  };
  
  // Hàm chuyển đến trang tạo công việc mới
  const goToCreateJob = () => {
    navigate('/jobs/create');
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
    'freelance': 'Freelance',
    'contract': 'Hợp đồng',
    'temporary': 'Tạm thời',
    'volunteer': 'Tình nguyện',
    'on-call': 'Theo yêu cầu',
    
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Tìm kiếm công việc</h1>
          
          {/* Search bar */}
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="keyword"
                value={searchParams.keyword || ''}
                onChange={handleInputChange}
                placeholder="Tìm kiếm công việc..."
                className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter size={18} />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter panel */}
        {isFilterOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bộ lọc tìm kiếm</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại công việc
                </label>
                <select
                  name="jobType"
                  value={searchParams.jobType || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="fulltime">Toàn thời gian</option>
                  <option value="parttime">Bán thời gian</option>
                  <option value="internship">Thực tập</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại lương
                </label>
                <select
                  name="salaryType"
                  value={searchParams.salaryType || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="fixed">Cố định</option>
                  <option value="range">Khoảng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lương tối thiểu
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={searchParams.salaryMin || ''}
                  onChange={handleInputChange}
                  placeholder="Lương tối thiểu"
                  className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lương tối đa
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={searchParams.salaryMax || ''}
                  onChange={handleInputChange}
                  placeholder="Lương tối đa"
                  className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hiển thị
                </label>
                <select
                  name="pageSize"
                  value={searchParams.pageSize}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 mỗi trang</option>
                  <option value={20}>20 mỗi trang</option>
                  <option value={50}>50 mỗi trang</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleFilterReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Results summary with Create Job button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách công việc</h2>
          <div className="flex items-center gap-4">
            {!loading && (
              <p className="text-gray-600">
                Đang hiển thị {jobs.length} công việc
              </p>
            )}
            <button 
              onClick={goToCreateJob}
              className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              Thêm công việc mới
            </button>
          </div>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">Không tìm thấy công việc phù hợp</p>
            <button
              onClick={handleFilterReset}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div 
                key={job.uuid} 
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {job.tittle}
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {job.company.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                      {jobTypeDisplay[job.jobType] || job.jobType}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                      {formatSalary(job)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600 line-clamp-2">{job.description}</p>
                </div>
                
                {job.listSkill?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.listSkill.map((jobSkill) => (
                      <span 
                        key={jobSkill.uuid}
                        className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        {jobSkill.skill.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock size={16} className="mr-1" />
                    <span>
                      Lịch làm việc: {job.schedule.length} ngày/tuần
                    </span>
                  </div>
                  <button onClick={() => goToJobDetail(job.uuid)} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic để hiển thị trang hiện tại ở giữa nếu có thể
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowRight size={20} />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;