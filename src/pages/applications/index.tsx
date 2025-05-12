import React, { useState, useEffect } from 'react';
import { getListPageJob } from '../../services/jobService';
import { getListByJob, updateStatus, addNote, cancelApply } from '../../services/applicationService';
import { Application } from '../../types/application';
import { useCompany } from '../../contexts/CompanyContext';
import { SearchOutlined } from '@ant-design/icons';
import { JobItem, GetJobListParams } from '../../types/job';
import { Input, Select, Button, Spin, Pagination, Table, Modal, Form, message } from 'antd';
import { Link } from 'react-router-dom';

const JobApplicationsPage: React.FC = () => {
  const { companyData } = useCompany();
  
  // State cho danh sách công việc
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<GetJobListParams>({
    pageSize: 10,
    page: 1,
    keyword: '',
    jobType: '',
    salaryType: '',
  });
  
  // State cho danh sách ứng tuyển
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(0);

  // State cho modal cập nhật trạng thái
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusForm] = Form.useForm();
  const [statusLoading, setStatusLoading] = useState(false);

  // State cho modal thêm ghi chú
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [noteLoading, setNoteLoading] = useState(false);

  // State cho modal hủy ứng tuyển
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Cập nhật companyUuid khi companyData thay đổi
  useEffect(() => {
    if (companyData && companyData.uuid) {
      setSearchParams(prev => ({
        ...prev,
        companyUuid: companyData.uuid,
      }));
    }
  }, [companyData]);

  // Lấy danh sách công việc
  const fetchJobs = async () => {
    if (!companyData || !companyData.uuid) return;
    
    setLoading(true);
    try {
      const response = await getListPageJob({
        ...searchParams,
        page: currentPage,
        companyUuid: companyData.uuid
      });
      setJobs(response.data.items);
      setTotalPages(response.data.pagination.totalPage);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách ứng tuyển theo công việc
  const fetchApplications = async (jobUuid: string) => {
    if (!jobUuid) return;
    
    setAppLoading(true);
    try {
      const response = await getListByJob({
        jobUuid: jobUuid,
        pageSize: 10,
        page: appPage
      });
      setApplications(response.data.items);
      setAppTotalPages(response.data.pagination.totalPage);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Không thể tải danh sách ứng tuyển');
    } finally {
      setAppLoading(false);
    }
  };

  // Cập nhật tìm kiếm
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, keyword: value, page: 1 }));
    setCurrentPage(1);
  };

  // Cập nhật bộ lọc
  const handleFilterChange = (name: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [name]: value, page: 1 }));
    setCurrentPage(1);
  };

  // Xử lý chọn công việc
  const handleJobSelect = (jobUuid: string, jobTitle: string) => {
    setSelectedJob(jobUuid);
    setSelectedJobTitle(jobTitle);
    setAppPage(1);
  };

  // Xử lý phân trang jobs
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý phân trang applications
  const handleAppPageChange = (page: number) => {
    setAppPage(page);
  };

  // Side effect khi thay đổi tham số tìm kiếm hoặc trang
  useEffect(() => {
    if (searchParams.companyUuid) {
      fetchJobs();
    }
  }, [searchParams, currentPage]);

  // Side effect khi chọn công việc hoặc thay đổi trang applications
  useEffect(() => {
    if (selectedJob) {
      fetchApplications(selectedJob);
    }
  }, [selectedJob, appPage]);

  // Xử lý mở modal cập nhật trạng thái
  const handleOpenStatusModal = (application: Application) => {
    setSelectedApplication(application);
    statusForm.setFieldsValue({ status: application.status });
    setStatusModalVisible(true);
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (values: { status: string }) => {
    if (!selectedApplication) return;
    
    setStatusLoading(true);
    try {
      const response = await updateStatus({
        uuid: selectedApplication.uuid,
        status: values.status
      });
      
      if (response.data) {
        message.success('Cập nhật trạng thái thành công');
        setStatusModalVisible(false);
        
        // Cập nhật UI
        setApplications(prevApps => 
          prevApps.map(app => 
            app.uuid === selectedApplication.uuid ? response.data : app
          )
        );
      } else if (response.error) {
        message.error(response.error.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setStatusLoading(false);
    }
  };

  // Xử lý mở modal thêm ghi chú
  const handleOpenNoteModal = (application: Application) => {
    setSelectedApplication(application);
    noteForm.setFieldsValue({ note: application.note || '' });
    setNoteModalVisible(true);
  };

  // Xử lý thêm ghi chú
  const handleAddNote = async (values: { note: string }) => {
    if (!selectedApplication) return;
    
    setNoteLoading(true);
    try {
      const response = await addNote({
        uuid: selectedApplication.uuid,
        note: values.note
      });
      
      if (response.data) {
        message.success('Thêm ghi chú thành công');
        setNoteModalVisible(false);
        
        // Cập nhật UI
        setApplications(prevApps => 
          prevApps.map(app => 
            app.uuid === selectedApplication.uuid ? response.data : app
          )
        );
      } else if (response.error) {
        message.error(response.error.message || 'Không thể thêm ghi chú');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      message.error('Có lỗi xảy ra khi thêm ghi chú');
    } finally {
      setNoteLoading(false);
    }
  };

  // Xử lý mở modal hủy ứng tuyển
  const handleOpenCancelModal = (application: Application) => {
    setSelectedApplication(application);
    setCancelModalVisible(true);
  };

  // Xử lý hủy ứng tuyển
  const handleCancelApply = async () => {
    if (!selectedApplication) return;
    
    setCancelLoading(true);
    try {
      const response = await cancelApply({
        application_uuid: selectedApplication.uuid
      });
      
      if (response.data) {
        message.success('Hủy ứng tuyển thành công');
        setCancelModalVisible(false);
        
        // Cập nhật UI
        setApplications(prevApps => 
          prevApps.map(app => 
            app.uuid === selectedApplication.uuid ? response.data : app
          )
        );
      } else if (response.error) {
        message.error(response.error.message || 'Không thể hủy ứng tuyển');
      }
    } catch (error) {
      console.error('Error cancelling application:', error);
      message.error('Có lỗi xảy ra khi hủy ứng tuyển');
    } finally {
      setCancelLoading(false);
    }
  };

  // Hiển thị trạng thái với màu sắc phù hợp
  const renderStatus = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-800',
      interviewing: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      hired: 'bg-yellow-100 text-yellow-800',
    };
    
    const statusClass = statusClasses[status] || statusClasses.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Các cột cho bảng công việc
  const jobColumns = [
    {
      title: 'Tiêu đề công việc',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại công việc',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType: string) => jobType.toUpperCase(),
    },
    {
      title: 'Lương',
      key: 'salary',
      render: (record: JobItem) => {
        if (record.salaryType === 'fixed') {
          return `${record.salaryFixed} ${record.currency}`;
        } else if (record.salaryType === 'range') {
          return `${record.salaryMin} - ${record.salaryMax} ${record.currency}`;
        } else {
          return 'Thương lượng';
        }
      },
    },
    {
      title: 'Kỹ năng',
      key: 'skills',
      render: (record: JobItem) => (
        <div className="flex flex-wrap gap-1">
          {record.listSkill.slice(0, 3).map(jobSkill => (
            <span key={jobSkill.uuid} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {jobSkill.skill.name}
            </span>
          ))}
          {record.listSkill.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              +{record.listSkill.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text: string, record: JobItem) => (
        <Button 
          type={selectedJob === record.uuid ? 'primary' : 'default'}
          onClick={() => handleJobSelect(record.uuid, record.title)}
          className={selectedJob === record.uuid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white hover:bg-gray-50'}
        >
          Xem ứng viên
        </Button>
      ),
    },
  ];

  // Các cột cho bảng ứng tuyển
  const applicationColumns = [
    {
      title: 'UUID Ứng viên',
      dataIndex: 'studentUuid',
      key: 'studentUuid',
      ellipsis: true,
      width: 200,
      render: (studentUuid: string) => (
        <Link 
          to={`/student-detail/${studentUuid}`} 
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {studentUuid}
        </Link>
      )
    },
    {
      title: 'Thư xin việc',
      dataIndex: 'coverLetter',
      key: 'coverLetter',
      ellipsis: true,
      render: (text: string) => text || 'Không có',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text: string) => text || 'Không có',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatus(status),
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text: string, record: Application) => (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleOpenStatusModal(record)}
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={record.status === 'cancelled'}
          >
            Cập nhật trạng thái
          </Button>
          <Button
            onClick={() => handleOpenNoteModal(record)}
            className="bg-green-500 text-white hover:bg-green-600"
            disabled={record.status === 'cancelled'}
          >
            Ghi chú
          </Button>
          <Button
            onClick={() => handleOpenCancelModal(record)}
            className="bg-red-500 text-white hover:bg-red-600"
            disabled={record.status === 'cancelled'}
            danger
          >
            Hủy
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="job-applications-page bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn ứng tuyển</h1>
        
        {/* Phần tìm kiếm và lọc công việc */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Tìm kiếm công việc</h2>
          <div className="flex flex-wrap gap-4">
            <Input.Search
              placeholder="Tìm kiếm theo tiêu đề"
              onSearch={handleSearch}
              className="w-full sm:w-64"
              enterButton={<SearchOutlined />}
              allowClear
            />
            <Select
              placeholder="Loại công việc"
              className="w-full sm:w-48"
              allowClear
              onChange={(value) => handleFilterChange('jobType', value || '')}
              options={[
                { value: 'fulltime', label: 'Toàn thời gian' },
                { value: 'parttime', label: 'Bán thời gian' },
                { value: 'internship', label: 'Thực tập' },
                { value: 'remote', label: 'Từ xa' },
              ]}
            />
            <Select
              placeholder="Loại lương"
              className="w-full sm:w-48"
              allowClear
              onChange={(value) => handleFilterChange('salaryType', value || '')}
              options={[
                { value: 'fixed', label: 'Cố định' },
                { value: 'range', label: 'Khoảng' },
                { value: 'monthly', label: 'Hàng tháng' },
                { value: 'daily', label: 'Hàng ngày' },
                { value: 'hourly', label: 'Theo giờ' },
              ]}
            />
          </div>
        </div>

        {/* Danh sách công việc */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Danh sách công việc</h2>
          <Spin spinning={loading}>
            {jobs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table 
                    dataSource={jobs}
                    columns={jobColumns}
                    rowKey="uuid"
                    pagination={false}
                    size="middle"
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination
                    current={currentPage}
                    total={totalPages * searchParams.pageSize}
                    pageSize={searchParams.pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không tìm thấy công việc nào</p>
              </div>
            )}
          </Spin>
        </div>

        {/* Danh sách ứng tuyển */}
        {selectedJob && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-700 mb-2">
              Danh sách ứng tuyển - {selectedJobTitle}
            </h2>
            <Spin spinning={appLoading}>
              {applications.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table 
                      dataSource={applications}
                      columns={applicationColumns}
                      rowKey="uuid"
                      pagination={false}
                      size="middle"
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Pagination
                      current={appPage}
                      total={appTotalPages * 10}
                      pageSize={10}
                      onChange={handleAppPageChange}
                      showSizeChanger={false}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Chưa có ứng viên nào ứng tuyển vào vị trí này</p>
                </div>
              )}
            </Spin>
          </div>
        )}

        {/* Modal cập nhật trạng thái */}
        <Modal
          title="Cập nhật trạng thái ứng tuyển"
          open={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
          footer={null}
        >
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleUpdateStatus}
          >
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                <Select.Option value="pending">Đang chờ</Select.Option>
                <Select.Option value="interviewing">Phỏng vấn</Select.Option>
                <Select.Option value="accepted">Chấp nhận</Select.Option>
                <Select.Option value="rejected">Từ chối</Select.Option>
                <Select.Option value="hired">Đã tuyển</Select.Option>
              </Select>
            </Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setStatusModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={statusLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal thêm ghi chú */}
        <Modal
          title="Thêm ghi chú cho ứng tuyển"
          open={noteModalVisible}
          onCancel={() => setNoteModalVisible(false)}
          footer={null}
        >
          <Form
            form={noteForm}
            layout="vertical"
            onFinish={handleAddNote}
          >
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
            >
              <Input.TextArea rows={4} placeholder="Nhập ghi chú của bạn về ứng viên này..." />
            </Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setNoteModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={noteLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Lưu ghi chú
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal hủy ứng tuyển */}
        <Modal
          title="Xác nhận hủy ứng tuyển"
          open={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={null}
        >
          <p>Bạn có chắc chắn muốn hủy ứng tuyển này không? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCancelModalVisible(false)}>
              Không
            </Button>
            <Button 
              type="primary" 
              danger 
              onClick={handleCancelApply} 
              loading={cancelLoading}
            >
              Có, hủy ứng tuyển
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default JobApplicationsPage;