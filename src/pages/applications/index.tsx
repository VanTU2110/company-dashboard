import React, { useState, useEffect } from 'react';
import { getListPageJob } from '../../services/jobService';
import { getListByJob, updateStatus, addNote, cancelApply } from '../../services/applicationService';
import { sendMassMessage } from '../../services/chatService'; // Import service mới
import { Application } from '../../types/application';
import { useCompany } from '../../contexts/CompanyContext';
import { SearchOutlined, MessageOutlined, UserOutlined, RiseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { JobItem, GetJobListParams } from '../../types/job';
import { Input, Select, Button, Spin, Pagination, Table, Modal, Form, message, Card, Row, Col, Checkbox, Badge, Divider, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Text, Title } = Typography;

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

  // State cho chức năng gửi tin nhắn hàng loạt
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageForm] = Form.useForm();
  const [sendingMessage, setSendingMessage] = useState(false);

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
    setSelectedCandidates([]); // Reset selection khi chọn job mới
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

  // Xử lý chọn/bỏ chọn ứng viên
  const handleCandidateSelect = (studentUuid: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, studentUuid]);
    } else {
      setSelectedCandidates(prev => prev.filter(uuid => uuid !== studentUuid));
    }
  };

  // Xử lý chọn/bỏ chọn tất cả ứng viên
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleStudents = applications
        .filter(app => app.status !== 'cancelled')
        .map(app => app.studentUuid);
      setSelectedCandidates(eligibleStudents);
    } else {
      setSelectedCandidates([]);
    }
  };

  // Mở modal gửi tin nhắn
  const handleOpenMessageModal = () => {
    if (selectedCandidates.length === 0) {
      message.warning('Vui lòng chọn ít nhất một ứng viên để gửi tin nhắn');
      return;
    }
    setMessageModalVisible(true);
  };

  // Gửi tin nhắn hàng loạt
  const handleSendMassMessage = async (values: { content: string }) => {
    if (!companyData?.uuid || selectedCandidates.length === 0) return;
    
    setSendingMessage(true);
    try {
      // Gửi tin nhắn qua WebSocket trước (real-time)
      // if (connection) {
      //   for (const studentUuid of selectedCandidates) {
      //     await connection.invoke(
      //       "SendMessageToConversation",
      //       conversationUuid, // Cần lấy conversationUuid tương ứng
      //       companyData.uuid,
      //       values.content
      //     );
      //   }
      // }

      // Sau đó gọi API để lưu vào database
      const response = await sendMassMessage({
        companyUuid: companyData.uuid,
        studentUuid: selectedCandidates,
        content: values.content
      });

      if (response.data) {
        message.success(`Đã gửi tin nhắn đến ${selectedCandidates.length} ứng viên thành công`);
        setMessageModalVisible(false);
        messageForm.resetFields();
        setSelectedCandidates([]);
      } else if (response.error) {
        message.error(response.error.message || 'Không thể gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending mass message:', error);
      message.error('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

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
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'processing', text: 'Đang chờ' },
      interviewing: { color: 'warning', text: 'Phỏng vấn' },
      accepted: { color: 'success', text: 'Chấp nhận' },
      rejected: { color: 'error', text: 'Từ chối' },
      cancelled: { color: 'default', text: 'Đã hủy' },
      hired: { color: 'gold', text: 'Đã tuyển' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge 
        status={config.color as any} 
        text={config.text}
      />
    );
  };

  // Các cột cho bảng công việc với thiết kế card
  const renderJobCard = (job: JobItem) => (
    <Card
      key={job.uuid}
      className={`mb-4 transition-all duration-200 hover:shadow-lg ${
        selectedJob === job.uuid ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      bodyStyle={{ padding: '20px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size={4}>
            <Title level={5} className="mb-0 text-gray-800">
              {job.title}
            </Title>
            <Badge 
              color="blue" 
              text={job.jobType.toUpperCase()} 
            />
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size={4}>
            <Text strong className="text-gray-600">Mức lương:</Text>
            <Text className="text-green-600 font-medium">
              {job.salaryType === 'fixed' 
                ? `${job.salaryFixed} ${job.currency}`
                : job.salaryType === 'range' 
                ? `${job.salaryMin} - ${job.salaryMax} ${job.currency}`
                : 'Thương lượng'
              }
            </Text>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size={4}>
            <Text strong className="text-gray-600">Kỹ năng:</Text>
            <Space wrap size="small">
              {job.listSkill.slice(0, 2).map(jobSkill => (
                <Badge 
                  key={jobSkill.uuid} 
                  count={jobSkill.skill.name}
                  style={{ backgroundColor: '#f0f0f0', color: '#666' }}
                />
              ))}
              {job.listSkill.length > 2 && (
                <Badge 
                  count={`+${job.listSkill.length - 2}`}
                  style={{ backgroundColor: '#1890ff', color: '#fff' }}
                />
              )}
            </Space>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={4} className="text-right">
          <Button 
            type={selectedJob === job.uuid ? 'primary' : 'default'}
            icon={<UserOutlined />}
            onClick={() => handleJobSelect(job.uuid, job.title)}
            className={selectedJob === job.uuid ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            Xem ứng viên
          </Button>
        </Col>
      </Row>
    </Card>
  );

  // Các cột cho bảng ứng tuyển
  const applicationColumns = [
    {
      title: (
        <Checkbox
          checked={
            selectedCandidates.length > 0 && 
            selectedCandidates.length === applications.filter(app => app.status !== 'cancelled').length
          }
          indeterminate={
            selectedCandidates.length > 0 && 
            selectedCandidates.length < applications.filter(app => app.status !== 'cancelled').length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Chọn
        </Checkbox>
      ),
      key: 'select',
      width: 80,
      render: (text: string, record: Application) => (
        <Checkbox
          checked={selectedCandidates.includes(record.studentUuid)}
          onChange={(e) => handleCandidateSelect(record.studentUuid, e.target.checked)}
          disabled={record.status === 'cancelled'}
        />
      ),
    },
    {
      title: 'Ứng viên',
      dataIndex: 'studentUuid',
      key: 'studentUuid',
      width: 200,
      render: (studentUuid: string) => (
        <Link 
          to={`/student-detail/${studentUuid}`} 
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
        >
          <UserOutlined />
          <Text ellipsis style={{ maxWidth: 150 }}>
            {studentUuid}
          </Text>
        </Link>
      )
    },
    {
      title: 'Thư xin việc',
      dataIndex: 'coverLetter',
      key: 'coverLetter',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {text || 'Không có'}
        </Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 150 }}>
          {text || 'Không có'}
        </Text>
      ),
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
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (text: string, record: Application) => (
        <Space wrap size="small">
          <Button
            size="small"
            type="primary"
            onClick={() => handleOpenStatusModal(record)}
            disabled={record.status === 'cancelled'}
          >
            Trạng thái
          </Button>
          <Button
            size="small"
            onClick={() => handleOpenNoteModal(record)}
            disabled={record.status === 'cancelled'}
          >
            Ghi chú
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleOpenCancelModal(record)}
            disabled={record.status === 'cancelled'}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  const eligibleCandidatesCount = applications.filter(app => app.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-2 flex items-center gap-3">
            <RiseOutlined className="text-blue-500" />
            Quản lý đơn ứng tuyển
          </Title>
          <Text className="text-gray-600">
            Quản lý và theo dõi tình trạng ứng tuyển của các vị trí trong công ty
          </Text>
        </div>
        
        {/* Phần tìm kiếm và lọc công việc */}
        <Card className="mb-6 shadow-sm">
          <Title level={4} className="text-gray-700 mb-4 flex items-center gap-2">
            <SearchOutlined />
            Tìm kiếm công việc
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Tìm kiếm theo tiêu đề công việc..."
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn loại công việc"
                className="w-full"
                size="large"
                allowClear
                onChange={(value) => handleFilterChange('jobType', value || '')}
                options={[
                  { value: 'fulltime', label: 'Toàn thời gian' },
                  { value: 'parttime', label: 'Bán thời gian' },
                  { value: 'internship', label: 'Thực tập' },
                  { value: 'remote', label: 'Từ xa' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Chọn loại lương"
                className="w-full"
                size="large"
                allowClear
                onChange={(value) => handleFilterChange('salaryType', value || '')}
                options={[
                  { value: 'fixed', label: 'Lương cố định' },
                  { value: 'range', label: 'Khoảng lương' },
                  { value: 'monthly', label: 'Theo tháng' },
                  { value: 'daily', label: 'Theo ngày' },
                  { value: 'hourly', label: 'Theo giờ' },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Danh sách công việc */}
        <Card className="mb-6 shadow-sm">
          <Title level={4} className="text-gray-700 mb-4">
            Danh sách công việc ({jobs.length})
          </Title>
          <Spin spinning={loading}>
            {jobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {jobs.map(job => renderJobCard(job))}
                </div>
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={currentPage}
                    total={totalPages * searchParams.pageSize}
                    pageSize={searchParams.pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} của ${total} công việc`
                    }
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <RiseOutlined className="text-6xl text-gray-300 mb-4" />
                <Text className="text-gray-500 text-lg">Không tìm thấy công việc nào</Text>
              </div>
            )}
          </Spin>
        </Card>

        {/* Danh sách ứng tuyển */}
        {selectedJob && (
          <Card className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="mb-0 text-gray-700">
                Danh sách ứng tuyển - {selectedJobTitle}
              </Title>
              {selectedCandidates.length > 0 && (
                <Space>
                  <Badge 
                    count={selectedCandidates.length} 
                    style={{ backgroundColor: '#52c41a' }}
                  >
                    <Text strong>Đã chọn</Text>
                  </Badge>
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={handleOpenMessageModal}
                    className="bg-green-500 hover:bg-green-600 border-green-500"
                  >
                    Gửi tin nhắn ({selectedCandidates.length})
                  </Button>
                </Space>
              )}
            </div>

            <Spin spinning={appLoading}>
              {applications.length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <Space>
                      <CheckCircleOutlined className="text-blue-500" />
                      <Text>
                        Tổng cộng: <Text strong>{applications.length}</Text> ứng viên |
                        Có thể gửi tin nhắn: <Text strong className="text-green-600">{eligibleCandidatesCount}</Text> ứng viên
                      </Text>
                    </Space>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table 
                      dataSource={applications}
                      columns={applicationColumns}
                      rowKey="uuid"
                      pagination={false}
                      size="middle"
                      className="w-full"
                      rowClassName={(record) => 
                        selectedCandidates.includes(record.studentUuid) 
                          ? 'bg-blue-50' 
                          : record.status === 'cancelled' 
                          ? 'bg-gray-50 opacity-60' 
                          : ''
                      }
                    />
                  </div>
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={appPage}
                      total={appTotalPages * 10}
                      pageSize={10}
                      onChange={handleAppPageChange}
                      showSizeChanger={false}
                      showTotal={(total, range) => 
                        `${range[0]}-${range[1]} của ${total} ứng viên`
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <UserOutlined className="text-6xl text-gray-300 mb-4" />
                  <Text className="text-gray-500 text-lg">
                    Chưa có ứng viên nào ứng tuyển vào vị trí này
                  </Text>
                </div>
              )}
            </Spin>
          </Card>
        )}

        {/* Modal gửi tin nhắn hàng loạt */}
        <Modal
          title={
            <Space>
              <MessageOutlined className="text-blue-500" />
              <span>Gửi tin nhắn đến {selectedCandidates.length} ứng viên</span>
            </Space>
          }
          open={messageModalVisible}
          onCancel={() => setMessageModalVisible(false)}
          footer={null}
          width={600}
        >
          <Divider />
          <Form
            form={messageForm}
            layout="vertical"
            onFinish={handleSendMassMessage}
          >
            <Form.Item
              name="content"
              label="Nội dung tin nhắn"
              rules={[
                { required: true, message: 'Vui lòng nhập nội dung tin nhắn' },
                { min: 10, message: 'Tin nhắn phải có ít nhất 10 ký tự' }
              ]}
            >
              <Input.TextArea 
                rows={6} 
                placeholder="Nhập nội dung tin nhắn bạn muốn gửi đến các ứng viên..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
            
            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <Text className="text-yellow-800">
                <strong>Lưu ý:</strong> Tin nhắn sẽ được gửi đến {selectedCandidates.length} ứng viên đã chọn. 
                Vui lòng kiểm tra kỹ nội dung trước khi gửi.
              </Text>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setMessageModalVisible(false)}
                disabled={sendingMessage}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={sendingMessage}
                icon={<MessageOutlined />}
                className="bg-green-500 hover:bg-green-600 border-green-500"
              >
                {sendingMessage ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal cập nhật trạng thái */}
        <Modal
          title={
            <Space>
              <CheckCircleOutlined className="text-blue-500" />
              <span>Cập nhật trạng thái ứng tuyển</span>
            </Space>
          }
          open={statusModalVisible}
          onCancel={() => setStatusModalVisible(false)}
          footer={null}
          width={500}
        >
          <Divider />
          <Form
            form={statusForm}
            layout="vertical"
            onFinish={handleUpdateStatus}
          >
            <Form.Item
              name="status"
              label="Chọn trạng thái mới"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select size="large" placeholder="Chọn trạng thái">
                <Select.Option value="pending">
                  <Badge status="processing" text="Đang chờ xử lý" />
                </Select.Option>
                <Select.Option value="interviewing">
                  <Badge status="warning" text="Đang phỏng vấn" />
                </Select.Option>
                <Select.Option value="accepted">
                  <Badge status="success" text="Đã chấp nhận" />
                </Select.Option>
                <Select.Option value="rejected">
                  <Badge status="error" text="Đã từ chối" />
                </Select.Option>
                <Select.Option value="hired">
                  <Badge status="gold" text="Đã tuyển dụng" />
                </Select.Option>
              </Select>
            </Form.Item>
            
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setStatusModalVisible(false)}
                disabled={statusLoading}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={statusLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Cập nhật trạng thái
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal thêm ghi chú */}
        <Modal
          title={
            <Space>
              <MessageOutlined className="text-green-500" />
              <span>Thêm ghi chú cho ứng viên</span>
            </Space>
          }
          open={noteModalVisible}
          onCancel={() => setNoteModalVisible(false)}
          footer={null}
          width={600}
        >
          <Divider />
          <Form
            form={noteForm}
            layout="vertical"
            onFinish={handleAddNote}
          >
            <Form.Item
              name="note"
              label="Ghi chú về ứng viên"
              rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Nhập ghi chú của bạn về ứng viên này (ví dụ: kỹ năng nổi bật, ấn tượng từ phỏng vấn...)"
                showCount
                maxLength={500}
              />
            </Form.Item>
            
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setNoteModalVisible(false)}
                disabled={noteLoading}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={noteLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                Lưu ghi chú
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Modal hủy ứng tuyển */}
        <Modal
          title={
            <Space>
              <span className="text-red-500">⚠️</span>
              <span>Xác nhận hủy ứng tuyển</span>
            </Space>
          }
          open={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={null}
          width={500}
        >
          <Divider />
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🚫</div>
            <Title level={4} className="text-gray-800 mb-2">
              Bạn có chắc chắn muốn hủy ứng tuyển này?
            </Title>
            <Text className="text-gray-600">
              Hành động này không thể hoàn tác. Ứng viên sẽ được thông báo về việc hủy ứng tuyển.
            </Text>
          </div>
          
          <div className="flex justify-center gap-3 mt-6">
            <Button 
              onClick={() => setCancelModalVisible(false)}
              disabled={cancelLoading}
              size="large"
            >
              Không, giữ lại
            </Button>
            <Button 
              type="primary" 
              danger 
              onClick={handleCancelApply} 
              loading={cancelLoading}
              size="large"
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