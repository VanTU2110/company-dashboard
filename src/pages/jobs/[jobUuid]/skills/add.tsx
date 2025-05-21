import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPageListSkill, createJobSkill } from "../../../../services/skillService";
import { SkillItem } from "../../../../types/skill";
import React from "react";

export default function AddJobSkillPage() {
  // Lấy jobUuid từ URL parameters và khởi tạo navigate
  const { jobUuid } = useParams<{ jobUuid: string }>();
  const navigate = useNavigate();

  // State để quản lý dữ liệu
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  
  // Search state
  const [keyword, setKeyword] = useState<string>("");

  // Fetch danh sách kỹ năng khi component được mount hoặc pagination/keyword thay đổi
  useEffect(() => {
    fetchSkills();
  }, [pagination.page, pagination.pageSize, keyword]);

  // Hàm để fetch danh sách kỹ năng
  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: keyword || undefined
      };
      
      const response = await getPageListSkill(params);
      
      if (response && response.data) {
        setSkills(response.data.items || []);
        setPagination({
          ...pagination,
          totalCount: response.data.pagination.totalCount,
          totalPages: response.data.pagination.totalPage
        });
      }
    } catch (err) {
      setError("Không thể tải danh sách kỹ năng. Vui lòng thử lại sau.");
      console.error("Error fetching skills:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Xử lý thay đổi kích thước trang
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination({
      ...pagination,
      pageSize: parseInt(e.target.value),
      page: 1 // Reset về trang đầu tiên khi thay đổi kích thước trang
    });
  };

  // Xử lý thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  // Xử lý khi người dùng nhấn Enter để tìm kiếm
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPagination({ ...pagination, page: 1 }); // Reset về trang đầu tiên khi tìm kiếm
      fetchSkills();
    }
  };

  // Xử lý khi chọn kỹ năng
  const handleSkillSelect = (skillUuid: string) => {
    setSelectedSkill(skillUuid === selectedSkill ? "" : skillUuid);
  };

  // Xử lý khi thêm kỹ năng
  const handleAddSkill = async () => {
    if (!selectedSkill) {
      setError("Vui lòng chọn một kỹ năng để thêm");
      return;
    }

    if (!jobUuid) {
      setError("Không tìm thấy thông tin công việc");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = {
        jobUuid: jobUuid,
        skillUuid: selectedSkill
      };
      
      await createJobSkill(data);
      setSuccessMessage("Thêm kỹ năng thành công");
      setSelectedSkill(""); // Reset lựa chọn
      
      // Tự động chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate(`/jobs/${jobUuid}`);
      }, 2000);
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || "Có lỗi xảy ra khi thêm kỹ năng");
      } else {
        setError("Không thể thêm kỹ năng. Vui lòng thử lại sau.");
      }
      console.error("Error adding job skill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý quay lại trang danh sách kỹ năng của công việc
  const handleCancel = () => {
    if (jobUuid) {
      navigate(`/jobs/${jobUuid}`);
    } else {
      navigate("/jobs");
    }
  };

  // Kiểm tra nếu không có kỹ năng nào
  const noSkillsFound = skills.length === 0 && !isLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Thêm Kỹ Năng Cho Công Việc</h1>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>
        
        {/* Thông báo lỗi */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {/* Thông báo thành công */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Tìm kiếm kỹ năng */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm kỹ năng..."
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={keyword}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
            />
          </div>
        </div>
        
        {/* Kỹ năng đã chọn */}
        {selectedSkill && (
          <div className="mb-6">
            <p className="text-gray-700 mb-2">Kỹ năng đã chọn:</p>
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg inline-block">
              {skills.find(skill => skill.uuid === selectedSkill)?.name}
              <button 
                onClick={() => setSelectedSkill("")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Danh sách kỹ năng */}
        <div className="mb-6">
          <div className="mt-2">
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : noSkillsFound ? (
              <div className="py-10 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Không tìm thấy kỹ năng nào phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.uuid}
                    onClick={() => handleSkillSelect(skill.uuid)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all ${
                      selectedSkill === skill.uuid
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center border ${
                        selectedSkill === skill.uuid
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-400"
                      }`}>
                        {selectedSkill === skill.uuid && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-800">{skill.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Phân trang */}
        {!noSkillsFound && !isLoading && (
          <div className="flex justify-between items-center mb-6 border-t pt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Hiển thị:</span>
              <select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600 ml-4">
                {pagination.totalCount > 0 ? (
                  <>
                    Hiển thị {(pagination.page - 1) * pagination.pageSize + 1}-
                    {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} 
                    {" "}trong tổng số {pagination.totalCount} kỹ năng
                  </>
                ) : "Không có kết quả"}
              </span>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border mr-1 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border mr-1 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="mx-2 text-sm">
                <span className="font-medium">{pagination.page}</span>
                <span className="text-gray-500"> / {pagination.totalPages || 1}</span>
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border mr-1 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Nút thao tác */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleAddSkill}
            disabled={isLoading || !selectedSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm Kỹ Năng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}