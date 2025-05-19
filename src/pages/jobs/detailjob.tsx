import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Typography, 
  Button, 
  Spin, 
  Result, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Space, 
  Divider, 
  Tag, 
  Row, 
  Col, 
  Modal, 
  Descriptions, 
  Badge,
  Empty,
  message,
  Table,  // Thêm Table để hiển thị sinh viên gợi ý
  Avatar,  // Thêm Avatar để hiển thị ảnh sinh viên
  Tooltip  // Thêm Tooltip để hiển thị thông tin bổ sung
  
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  CalendarOutlined, 
  BankOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  PlusOutlined,
  UserOutlined,  // Icon cho sinh viên
  MailOutlined,  // Icon cho email
  PhoneOutlined,  // Icon cho số điện thoại
  TeamOutlined,    // Icon cho danh sách sinh viên được gợi ý
  ShareAltOutlined 

} from '@ant-design/icons';
import { JobItem, UpdateJob, } from '../../types/job';
import { SuggestStudentParams, ListStudentResponse,StudentDetail } from '../../types/student';
import { updateJob, detailJob } from '../../services/jobService';
import { getStudentSuggest } from '../../services/studentService';
import { deleteSchedule } from '../../services/scheduleService';
import { deleteJobSKill } from '../../services/skillService';
import { createConversation } from '../../services/conversationService';
import { useChat } from '../../contexts/ChatContext';
import { sendMessage } from '../../services/chatService';

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const JobDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteScheduleModalVisible, setDeleteScheduleModalVisible] = useState<boolean>(false);
  const [deleteSkillModalVisible, setDeleteSkillModalVisible] = useState<boolean>(false);
  const [selectedScheduleUuid, setSelectedScheduleUuid] = useState<string | null>(null);
  const [selectedSkillUuid, setSelectedSkillUuid] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // Thêm vào đầu component
const { connection } = useChat();
  
  // Thêm state cho phần gợi ý sinh viên
  const [suggestedStudents, setSuggestedStudents] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  useEffect(() => {
    const getJobDetail = async () => {
      if (!uuid) {
        setError('Không tìm thấy mã công việc');
        setLoading(false);
        return;
      }
  
      try {
        const response = await detailJob(uuid);
        
        if (response.error.code !== 'success' || !response.data) {
          setError('Không tìm thấy thông tin công việc');
          setLoading(false);
          return;
        }
        
        const jobData = response.data;
        
        setJob(jobData);

        // Set initial form values
        form.setFieldsValue({
          title: jobData.title,
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
        
        // Sau khi lấy thông tin công việc, gọi API để lấy danh sách sinh viên được gợi ý
        fetchSuggestedStudents(1, pagination.pageSize);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Có lỗi xảy ra khi tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };
  
    getJobDetail();
  }, [uuid, form]);

  // Thêm hàm để lấy danh sách sinh viên được gợi ý
  const fetchSuggestedStudents = async (page: number, pageSize: number) => {
    if (!uuid) return;
    
    setSuggestLoading(true);
    try {
      const params: SuggestStudentParams = {
        page: page,
        pageSize: pageSize,
        jobUuid: uuid
      };
      
      const response = await getStudentSuggest(params);
      
      if (response.error.code === 'success' && response.data) {
        setSuggestedStudents(response.data.items);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.pagination.totalCount
        });
      } else {
        message.error('Không thể tải danh sách sinh viên được gợi ý');
      }
    } catch (err) {
      console.error('Error fetching suggested students:', err);
      message.error('Có lỗi xảy ra khi tải danh sách sinh viên được gợi ý');
    } finally {
      setSuggestLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi trang trong bảng sinh viên được gợi ý
  const handleTableChange = (pagination: any) => {
    fetchSuggestedStudents(pagination.current, pagination.pageSize);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Đảm bảo có companyUuid
      if (!values.companyUuid && job && job.company) {
        values.companyUuid = job.company.uuid;
      }
      
      // Tạo object với đầy đủ thông tin cần update
      const updatedData: UpdateJob = {
        uuid: uuid as string,
        title: values.title,
        description: values.description,
        jobType: values.jobType,
        salaryType: values.salaryType,
        currency: values.currency,
        requirements: values.requirements,
        companyUuid: values.companyUuid
      };
  
      // Xử lý các trường lương theo salaryType
      switch (values.salaryType) {
        case 'fixed':
          updatedData.salaryFixed = values.salaryFixed;
          updatedData.salaryMin = 0;  // Đảm bảo reset các trường không dùng
          updatedData.salaryMax = 0;
          break;
        
        case 'monthly':
        case 'daily':
        case 'hourly':
          updatedData.salaryMin = values.salaryMin;
          updatedData.salaryMax = values.salaryMax;
          updatedData.salaryFixed = 0;  // Đảm bảo reset các trường không dùng
          break;
        
        default:
          // Cho các trường hợp khác (nếu có)
          updatedData.salaryMin = 0;
          updatedData.salaryMax = 0;
          updatedData.salaryFixed = 0;
      }
  
      setIsSaving(true);
      const response = await updateJob(updatedData);
      
      if (response.error.code === 'success') {
        // Refresh lại dữ liệu sau khi update thành công
        if (uuid) {
          const detailResponse = await detailJob(uuid);
          if (detailResponse.error.code === 'success' && detailResponse.data) {
            setJob(detailResponse.data);
            // Cập nhật lại form values với dữ liệu mới
            form.setFieldsValue({
              ...detailResponse.data,
              salaryMin: detailResponse.data.salaryMin,
              salaryMax: detailResponse.data.salaryMax,
              salaryFixed: detailResponse.data.salaryFixed
            });
          }
        }
        message.success('Cập nhật công việc thành công');
        setIsEditing(false);
      } else {
        throw new Error(response.error.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Error updating job:', err);
      Modal.error({
        title: 'Lỗi cập nhật',
        content: (err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin công việc'),
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleUpdateJob = () => {
    if (job && job.company) {
      form.setFieldValue('companyUuid', job.company.uuid);
    }
    setIsEditing(true);
  };

  const handleAddSchedule = () => {
    if (job) {
      navigate(`/jobs/${job.uuid}/schedules/add`);
    }
  };

  const handleAddSkill = () => {
    if (job) {
      navigate(`/jobs/${job.uuid}/skills/add`);
    }
  };
  // Thêm hàm xử lý xoá lịch trình
const handleDeleteSchedule = async () => {
  setDeleteScheduleModalVisible(false);
  if (selectedScheduleUuid) {
    setIsProcessing(true);
    try {
      await deleteSchedule(selectedScheduleUuid);
      message.success('Xoá lịch trình thành công');
      // Refresh job data
      if (uuid) {
        const response = await detailJob(uuid);
        if (response.error.code === 'success' && response.data) {
          setJob(response.data);
        }
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      message.error('Có lỗi xảy ra khi xoá lịch trình');
    } finally {
      setIsProcessing(false);
    }
  }
};

// Thêm hàm xử lý xoá kỹ năng
const handleDeleteSkill = async () => {
  setDeleteSkillModalVisible(false);
  if (selectedSkillUuid) {
    setIsProcessing(true);
    try {
      await deleteJobSKill(selectedSkillUuid);
      message.success('Xoá kỹ năng thành công');
      // Refresh job data
      if (uuid) {
        const response = await detailJob(uuid);
        if (response.error.code === 'success' && response.data) {
          setJob(response.data);
        }
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
      message.error('Có lỗi xảy ra khi xoá kỹ năng');
    } finally {
      setIsProcessing(false);
    }
  }
};

const renderSalaryInfo = () => {
  if (!job) return null;

  // Map các loại lương sang tiếng Việt
  const salaryTypeMap: Record<string, string> = {
    'fixed': 'Cố định',
    'monthly': 'Tháng',
    'daily': 'Ngày',
    'hourly': 'Giờ'
  };

  // Map các loại công việc sang tiếng Việt
  const jobTypeMap: Record<string, string> = {
    'remote': 'Làm từ xa',
    'parttime': 'Bán thời gian',
    'internship': 'Thực tập'
  };

  const salaryTypeText = salaryTypeMap[job.salaryType] || job.salaryType;
  const jobTypeText = jobTypeMap[job.jobType] || job.jobType;

  // Xử lý hiển thị theo từng loại lương
  if (job.salaryType === 'fixed' && job.salaryFixed) {
    return `${job.salaryFixed.toLocaleString('vi-VN')} ${job.currency} (${salaryTypeText})`;
  } 
  else if ((job.salaryType === 'monthly' || job.salaryType === 'daily' || job.salaryType === 'hourly') && job.salaryMin && job.salaryMax) {
    return `${job.salaryMin.toLocaleString('vi-VN')} - ${job.salaryMax.toLocaleString('vi-VN')} ${job.currency}/${salaryTypeText}`;
  } 
  else {
    return 'Thương lượng';
  }
};
const handleMessage = async (student: StudentDetail) => {
  const companyUuid = job?.company?.uuid;
  if (!student || !companyUuid) return;

  try {
    const response = await createConversation({
      studentUuid: student.uuid,
      companyUuid: companyUuid, // đảm bảo luôn là string
    });

    navigate(`/conversations/${response.data.uuid}`);
  } catch (err) {
    console.error('Lỗi khi tạo cuộc trò chuyện:', err);
    message.error('Không thể tạo cuộc trò chuyện.');
  }
};
const handleShareJob = async (student: StudentDetail) => {
  if (!job || !student) return;

  try {
    // Tạo nội dung tin nhắn với thông tin công việc
    const jobInfo = `[JOB_INVITE uuid=${job.uuid} title="${job.title}" salary="${renderSalaryInfo()}"][/JOB_INVITE]`;
    const messageContent = `Xin chào, chúng tôi có công việc phù hợp với bạn:\n${jobInfo}`;

    // Tạo hoặc lấy conversation với sinh viên
    const conversationResponse = await createConversation({
      studentUuid: student.uuid,
      companyUuid: job.company?.uuid || '',
    });

    // Lưu tin nhắn vào database qua API
    const sendMessageResponse = await sendMessage({
      conversationUuid: conversationResponse.data.uuid,
      senderUuid: job.company?.uuid || '',
      content: messageContent,
    });

    // Gửi tin nhắn qua WebSocket để real-time
    if (connection) {
      await connection.invoke(
        "SendMessageToConversation", 
        conversationResponse.data.uuid, 
        job.company?.uuid || '', 
        messageContent
      );
    }

    // // Cập nhật state nếu cần
    // addMessage({
    //   uuid: sendMessageResponse.data.uuid,
    //   content: messageContent,
    //   createdAt: new Date().toISOString(),
    //   sender: {
    //     uuid: job.company?.uuid || '',
    //     name: job.company?.name || 'Công ty',
    //     type: 'COMPANY'
    //   }
    // });

    // Chuyển hướng đến cuộc trò chuyện
    navigate(`/conversations/${conversationResponse.data.uuid}`);
    
    message.success('Đã chia sẻ công việc thành công');
  } catch (err) {
    console.error('Error sharing job:', err);
    message.error('Có lỗi xảy ra khi chia sẻ công việc');
  }
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

// Thiết lập cột cho bảng sinh viên được gợi ý
const studentColumns = [
  {
    title: 'Sinh viên',
    dataIndex: 'fullname',
    key: 'fullname',
    render: (text: string, record: any) => (
      <Space>
        <Avatar 
          src={record.avatar || undefined} 
          icon={!record.avatar && <UserOutlined />}
          size={48}
        />
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">{record.major || 'Chưa cập nhật ngành học'}</Text>
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: 'Thông tin liên hệ',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    render: (_: string, record: any) => (
      <Space direction="vertical" size="small">
        <Space>
          <PhoneOutlined />
          <Text>{record.phoneNumber || 'Chưa cập nhật'}</Text>
        </Space>
      </Space>
    ),
  },
  {
    title: 'Kỹ năng phù hợp',
    dataIndex: 'listSkill',
    key: 'listSkill',
    render: (_: any, record: any) => {
      const matchedSkills = record.listSkill || [];
      if (!matchedSkills.length) {
        return <Text type="secondary">Chưa có kỹ năng phù hợp</Text>;
      }
  
      // Nhóm mỗi 2 kỹ năng thành 1 dòng
      const rows = [];
      for (let i = 0; i < matchedSkills.length && i < 5; i += 2) {
        rows.push(matchedSkills.slice(i, i + 2));
      }
  
      return (
        <div>
          {rows.map((row: any[], rowIndex: number) => (
            <div key={rowIndex} style={{ display: 'flex', gap: '8px', marginBottom: 4 }}>
              {row.map((item: any, index: number) => (
                <Tag
                  key={item.uuid || `${rowIndex}-${index}`}
                  color={
                    item.proficiency === 'advanced'
                      ? 'green'
                      : item.proficiency === 'intermediate'
                      ? 'blue'
                      : 'default'
                  }
                >
                  {item.skill?.name} ({item.proficiency})
                </Tag>
              ))}
            </div>
          ))}
  
          {matchedSkills.length > 5 && (
            <Tooltip title={matchedSkills.slice(5).map((s: any) => `${s.skill?.name} (${s.proficiency})`).join(', ')}>
              <Tag>+{matchedSkills.length - 5}</Tag>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  
  
  {
    title: 'Lịch rảnh',
    dataIndex: 'availabilities',
    key: 'availabilities',
    render: (schedules: { dayOfWeek: string; startTime: string; endTime: string }[]) => (
      <div className="flex flex-wrap gap-2">
        {schedules.map((schedule, index) => (
          <Tag
            key={index}
            color="blue"
            className="!rounded-xl !px-3 !py-1 !text-sm !font-medium !bg-blue-100 !text-blue-700"
          >
            {formatDayOfWeek(schedule.dayOfWeek)}: {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_: any, record: any) => (
      <Space size="middle">
        <Link to={`/student-detail/${record.uuid}`}>
          <Button type="primary" size="small">
            Xem chi tiết
          </Button>
        </Link>
        <Button
          type="default"
          size="small"
          onClick={() => handleMessage(record)}
        >
          Nhắn tin
        </Button>
        <Button
          type="dashed"
          size="small"
          onClick={() => handleShareJob(record)}
          icon={<ShareAltOutlined />}
        >
          Chia sẻ việc
        </Button>
      </Space>
    ),
  },
];



// Render giao diện chính
return (
  <Layout className="job-detail-page">
    <Header className="site-layout-background" style={{ padding: '0 24px', background: '#fff', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/jobs')}
          >
            Quay lại danh sách
          </Button>
          <Divider type="vertical" />
          <Title level={4} style={{ margin: 0 }}>Chi tiết công việc</Title>
        </Space>
        <Space>
          {!isEditing && (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleUpdateJob}
                disabled={loading || !job}
              >
                Chỉnh sửa
              </Button>

            </>
          )}
          {isEditing && (
            <>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={isSaving}
              >
                Lưu thay đổi
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      </div>
    </Header>

    <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      ) : error ? (
        <Result
          status="error"
          title="Không thể tải thông tin công việc"
          subTitle={error}
          extra={[
            <Button type="primary" key="back" onClick={() => navigate('/jobs')}>
              Quay lại danh sách công việc
            </Button>
          ]}
        />
      ) : job ? (
        <div className="job-content">
          {/* Phần thông tin công việc */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Thông tin công việc</span>
                  </div>
                }
                bordered={false}
                className="card-shadow"
                style={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
                }}
              >
                {isEditing ? (
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      title: job.title,
                      description: job.description,
                      jobType: job.jobType,
                      salaryType: job.salaryType,
                      salaryMin: job.salaryMin,
                      salaryMax: job.salaryMax,
                      salaryFixed: job.salaryFixed,
                      currency: job.currency,
                      requirements: job.requirements,
                      companyUuid: job.company?.uuid
                    }}
                  >
                    <Form.Item
                      name="title"
                      label="Tiêu đề công việc"
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc' }]}
                    >
                      <Input placeholder="Nhập tiêu đề công việc" />
                    </Form.Item>
                    
                    <Form.Item
                      name="jobType"
                      label="Loại công việc"
                      rules={[{ required: true, message: 'Vui lòng chọn loại công việc' }]}
                    >
                      <Select placeholder="Chọn loại công việc">
                        <Option value="FULL_TIME">Toàn thời gian</Option>
                        <Option value="PART_TIME">Bán thời gian</Option>
                        <Option value="CONTRACT">Hợp đồng</Option>
                        <Option value="INTERNSHIP">Thực tập</Option>
                        <Option value="TEMPORARY">Tạm thời</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
    name="salaryType"
    label="Loại lương"
    rules={[{ required: true, message: 'Vui lòng chọn loại lương' }]}
  >
    <Select 
      placeholder="Chọn loại lương"
      onChange={(value) => {
        // Reset các trường lương khi thay đổi loại lương
        form.setFieldsValue({
          salaryMin: undefined,
          salaryMax: undefined,
          salaryFixed: undefined
        });
      }}
    >
      <Option value="monthly">Theo tháng</Option>
      <Option value="daily">Theo ngày</Option>
      <Option value="hourly">Theo giờ</Option>
      <Option value="fixed">Cố định</Option>
    </Select>
  </Form.Item>

  {/* Hiển thị các trường lương tương ứng */}
  {form.getFieldValue('salaryType') === 'fixed' && (
    <Form.Item
      name="salaryFixed"
      label="Mức lương cố định"
      rules={[
        { required: true, message: 'Vui lòng nhập mức lương' },
        { type: 'number', min: 0, message: 'Lương phải là số dương' }
      ]}
    >
      <InputNumber
        style={{ width: '100%' }}
        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
      />
    </Form.Item>
  )}

  {(form.getFieldValue('salaryType') === 'monthly' || 
    form.getFieldValue('salaryType') === 'daily' || 
    form.getFieldValue('salaryType') === 'hourly') && (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="salaryMin"
            label="Lương tối thiểu"
            rules={[
              { required: true, message: 'Vui lòng nhập lương tối thiểu' },
              { type: 'number', min: 0, message: 'Lương phải là số dương' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="salaryMax"
            label="Lương tối đa"
            rules={[
              { required: true, message: 'Vui lòng nhập lương tối đa' },
              { type: 'number', min: 0, message: 'Lương phải là số dương' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('salaryMin') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Lương tối đa phải lớn hơn tối thiểu');
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )}

  <Form.Item
    name="currency"
    label="Đơn vị tiền tệ"
    rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
  >
    <Select placeholder="Chọn đơn vị tiền tệ">
      <Option value="VND">VND</Option>
      <Option value="USD">USD</Option>
    </Select>
  </Form.Item>
                    )
                    
                    <Form.Item
                      name="description"
                      label="Mô tả công việc"
                      rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
                    >
                      <TextArea rows={6} placeholder="Nhập mô tả chi tiết về công việc" />
                    </Form.Item>
                    
                    <Form.Item
                      name="requirements"
                      label="Yêu cầu công việc"
                      rules={[{ required: true, message: 'Vui lòng nhập yêu cầu công việc' }]}
                    >
                      <TextArea rows={6} placeholder="Nhập yêu cầu chi tiết về công việc" />
                    </Form.Item>
                  </Form>
                ) : (
                  <>
                    <div className="job-info-section">
                      <Title level={3} style={{ marginTop: 0 }}>{job.title}</Title>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                        <Space>
                          <Tag color="blue" icon={<BankOutlined />} style={{ padding: '2px 10px', fontSize: '14px' }}>
                            {job.company?.name || 'Công ty chưa cập nhật'}
                          </Tag>
                        </Space>
                        <Space>
                          <Tag color="green" icon={<ClockCircleOutlined />} style={{ padding: '2px 10px', fontSize: '14px' }}>
                            {job.jobType === 'FULL_TIME' ? 'Toàn thời gian' : 
                             job.jobType === 'PART_TIME' ? 'Bán thời gian' : 
                             job.jobType === 'CONTRACT' ? 'Hợp đồng' : 
                             job.jobType === 'INTERNSHIP' ? 'Thực tập' : 
                             job.jobType === 'TEMPORARY' ? 'Tạm thời' : job.jobType}
                          </Tag>
                        </Space>
                        <Space>
                          <Tag color="orange" icon={<DollarOutlined />} style={{ padding: '2px 10px', fontSize: '14px' }}>
                            {renderSalaryInfo()}
                          </Tag>
                        </Space>
                        <Space>
                          <Tag color="purple" icon={<CalendarOutlined />} style={{ padding: '2px 10px', fontSize: '14px' }}>
                            Ngày đăng: {new Date(job.created).toLocaleDateString('vi-VN')}
                          </Tag>
                        </Space>
                      </div>
                      
                      <Divider orientation="left">Mô tả công việc</Divider>
                      <Paragraph style={{ whiteSpace: 'pre-line', fontSize: '15px' }}>
                        {job.description || 'Chưa có mô tả chi tiết.'}
                      </Paragraph>
                      
                      <Divider orientation="left">Yêu cầu công việc</Divider>
                      <Paragraph style={{ whiteSpace: 'pre-line', fontSize: '15px' }}>
                        {job.requirements || 'Chưa có yêu cầu chi tiết.'}
                      </Paragraph>
                    </div>
                  </>
                )}
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
             
              
              {/* Kỹ năng yêu cầu */}
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Kỹ năng yêu cầu</span>
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<PlusOutlined />}
                      onClick={handleAddSkill}
                    >
                      Thêm kỹ năng
                    </Button>
                  </div>
                }
                bordered={false}
                className="card-shadow"
                style={{ 
                  marginBottom: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
                }}
              >
                {job.listSkill && job.listSkill.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.listSkill.map((skill) => (
                      <Tag 
                        key={skill.uuid} 
                        color="blue"
                        style={{ fontSize: '14px', padding: '4px 8px', margin: '4px' }}
                        closable
                        onClose={(e) => {
                          e.preventDefault();
                          setSelectedSkillUuid(skill.uuid);
                          setDeleteSkillModalVisible(true);
                        }}
                      >
                        {skill.skill.name}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Empty description="Chưa có kỹ năng yêu cầu" />
                )}
              </Card>
              
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Lịch trình công việc </span>
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<PlusOutlined />}
                      onClick={handleAddSchedule}
                    >
                      Thêm lịch trình
                    </Button>
                  </div>
                }
                bordered={false}
                className="card-shadow"
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
                }}
              >
                {job.schedule && job.schedule.length > 0 ? (
                  job.schedule.map((schedule) => (
                    <div 
                      key={schedule.uuid} 
                      style={{ 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          size="small"
                          onClick={() => {
                            setSelectedScheduleUuid(schedule.uuid);
                            setDeleteScheduleModalVisible(true);
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ClockCircleOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 12 }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{formatDayOfWeek(schedule.dayOfWeek)}</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                              {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                            </div>
                          </div>
                        </div>
                    </div>
                  ))
                ) : (
                  <Empty description="Công việc chưa có lịch làm việc" />
                )}
              </Card>
            </Col>
          </Row>
          
          {/* Phần sinh viên được gợi ý */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <TeamOutlined style={{ fontSize: '18px' }} />
                  <span>Sinh viên phù hợp với công việc này</span>
                </Space>
                <Badge count={pagination.total} overflowCount={999} />
              </div>
            }
            bordered={false}
            className="card-shadow"
            style={{ 
              marginTop: '24px', 
              borderRadius: '8px',
              boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
            }}  
          >
            <Table
              columns={studentColumns}
              dataSource={suggestedStudents}
              rowKey="uuid"
              loading={suggestLoading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} sinh viên`,
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
              bordered={false}
            />
          </Card>
        </div>
      ) : (
        <Empty description="Không tìm thấy thông tin công việc" />
      )}
    </Content>
    {/* Modal xác nhận xóa lịch làm việc */}
    <Modal
          title="Xác nhận xóa lịch làm việc"
          open={deleteScheduleModalVisible}
          onOk={handleDeleteSchedule}
          onCancel={() => {
            setDeleteScheduleModalVisible(false);
            setSelectedScheduleUuid(null);
          }}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: isProcessing }}
        >
          <p>Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động này không thể hoàn tác.</p>
        </Modal>

        {/* Modal xác nhận xóa kỹ năng */}
        <Modal
          title="Xác nhận xóa kỹ năng"
          open={deleteSkillModalVisible}
          onOk={handleDeleteSkill}
          onCancel={() => {
            setDeleteSkillModalVisible(false);
            setSelectedSkillUuid(null);
          }}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: isProcessing }}
        >
          <p>Bạn có chắc chắn muốn xóa kỹ năng này? Hành động này không thể hoàn tác.</p>
        </Modal>
    </Layout>
  );
};

export default JobDetailPage;