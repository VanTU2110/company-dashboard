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
  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSkill(e.target.value);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thêm Kỹ Năng Cho Công Việc</h1>
      
      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Thông báo thành công */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Tìm kiếm kỹ năng */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm kỹ năng..."
          className="px-4 py-2 border rounded-lg w-full"
          value={keyword}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
        />
      </div>
      
      {/* Danh sách kỹ năng */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Chọn Kỹ Năng:</label>
        <select
          className="px-4 py-2 border rounded-lg w-full"
          value={selectedSkill}
          onChange={handleSkillChange}
          disabled={isLoading}
        >
          <option value="">-- Chọn kỹ năng --</option>
          {skills.map((skill) => (
            <option key={skill.uuid} value={skill.uuid}>
              {skill.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Phân trang */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="mr-2">Số mục mỗi trang:</span>
          <select
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <div className="flex">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-3 py-1">
            Trang {pagination.page} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
      
      {/* Nút thao tác */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Hủy
        </button>
        <button
          onClick={handleAddSkill}
          disabled={isLoading || !selectedSkill}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Đang xử lý..." : "Thêm Kỹ Năng"}
        </button>
      </div>
    </div>
  );
}