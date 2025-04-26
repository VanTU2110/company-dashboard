import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Empty
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
  PlusOutlined 
} from '@ant-design/icons';
import { JobItem, UpdateJob } from '../../types/job';
import { updateJob, detailJob } from '../../services/jobService';

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
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

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
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Có lỗi xảy ra khi tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };
  
    getJobDetail();
  }, [uuid, form]);

  const handleSave = async () => {
    try {
      // Lấy tất cả giá trị hiện tại từ form
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
        salaryMin: values.salaryMin,
        salaryMax: values.salaryMax,
        salaryFixed: values.salaryFixed,
        currency: values.currency,
        requirements: values.requirements,
        companyUuid: values.companyUuid
      };
      
      setIsSaving(true);
      await updateJob(updatedData);
      
      if (uuid) {
        const response = await detailJob(uuid);
        if (response.error.code === 'success' && response.data) {
          setJob(response.data);
        }
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating job:', err);
      Modal.error({
        title: 'Lỗi cập nhật',
        content: 'Có lỗi xảy ra khi cập nhật thông tin công việc',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModalVisible(false);
    // Logic xóa công việc sẽ được thêm ở đây
    // Sau khi xóa thành công, chuyển về trang danh sách
    navigate('/jobs');
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

  // Render các trạng thái khác nhau
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <Result
        status="404"
        title="Không tìm thấy thông tin"
        subTitle={error || 'Không tìm thấy thông tin công việc'}
        extra={
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/jobs')}>
            Quay lại danh sách công việc
          </Button>
        }
      />
    );
  }

  return (
    <Layout className="site-layout" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', margin: '0 auto', maxWidth: '1000px' }}>
        {isEditing ? (
          // Form chỉnh sửa - đặt toàn bộ form ở đây
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
              companyUuid: job.company.uuid
            }}
          >
            <Card 
              style={{ marginBottom: 24 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    type="link" 
                    onClick={() => navigate('/jobs')}
                    style={{ marginRight: 16, padding: 0 }}
                  >
                    Quay lại danh sách công việc
                  </Button>
                </div>
              }
              extra={
                <Space>
                  <Button onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                    loading={isSaving}
                  >
                    Lưu thay đổi
                  </Button>
                </Space>
              }
            >
              <Form.Item
                name="title"
                label="Tiêu đề công việc"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc' }]}
              >
                <Input placeholder="Nhập tiêu đề công việc" />
              </Form.Item>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="jobType"
                    label="Loại công việc"
                    rules={[{ required: true, message: 'Vui lòng chọn loại công việc' }]}
                  >
                    <Select placeholder="Chọn loại công việc">
                      <Option value="fulltime">Toàn thời gian</Option>
                      <Option value="parttime">Bán thời gian</Option>
                      <Option value="internship">Thực tập</Option>
                      <Option value="remote">Làm việc từ xa</Option>
                      <Option value="on-site">Tại văn phòng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="salaryType"
                    label="Loại lương"
                    rules={[{ required: true, message: 'Vui lòng chọn loại lương' }]}
                  >
                    <Select placeholder="Chọn loại lương">
                      <Option value="fixed">Cố định</Option>
                      <Option value="range">Khoảng</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.salaryType !== currentValues.salaryType}
              >
                {({ getFieldValue }) => 
                  getFieldValue('salaryType') === 'fixed' ? (
                    <Row gutter={24}>
                      <Col span={18}>
                        <Form.Item
                          name="salaryFixed"
                          label="Mức lương cố định"
                          rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập mức lương"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name="currency"
                          label="Đơn vị tiền"
                          rules={[{ required: true, message: 'Vui lòng nhập đơn vị tiền' }]}
                        >
                          <Input placeholder="VND" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Row gutter={24}>
                      <Col span={8}>
                        <Form.Item
                          name="salaryMin"
                          label="Lương tối thiểu"
                          rules={[{ required: true, message: 'Vui lòng nhập lương tối thiểu' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Lương tối thiểu"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="salaryMax"
                          label="Lương tối đa"
                          rules={[{ required: true, message: 'Vui lòng nhập lương tối đa' }]}
                        >
                          <InputNumber 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Lương tối đa"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="currency"
                          label="Đơn vị tiền"
                          rules={[{ required: true, message: 'Vui lòng nhập đơn vị tiền' }]}
                        >
                          <Input placeholder="VND" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              </Form.Item>
              
              <Form.Item name="companyUuid" hidden>
                <Input />
              </Form.Item>
            </Card>
            
            {/* Phần Mô tả công việc */}
            <Card 
              title="Mô tả công việc" 
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc' }]}
              >
                <TextArea 
                  rows={6}
                  placeholder="Nhập mô tả công việc"
                />
              </Form.Item>
            </Card>
            
            {/* Phần Yêu cầu */}
            <Card 
              title="Yêu cầu" 
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="requirements"
                rules={[{ required: true, message: 'Vui lòng nhập yêu cầu công việc' }]}
              >
                <TextArea 
                  rows={6}
                  placeholder="Nhập yêu cầu công việc"
                />
              </Form.Item>
            </Card>
            
            {/* Các phần thông tin khác không cần chỉnh sửa */}
            <Card 
              title="Kỹ năng yêu cầu" 
              style={{ marginBottom: 24 }}
            >
              {job.listSkill && job.listSkill.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.listSkill.map((jobSkill) => (
                    <Tag key={jobSkill.uuid} color="blue" style={{ padding: '4px 8px', fontSize: 14 }}>
                      {jobSkill.skill.name}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Empty description="Chưa có kỹ năng nào được thêm vào." />
              )}
            </Card>
            
            <Card 
              title="Lịch làm việc"
            >
              {job.schedule && job.schedule.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {job.schedule.map((schedule) => (
                    <Col key={schedule.uuid} xs={24} sm={12} md={8}>
                      <Card size="small" hoverable>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ClockCircleOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 12 }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{formatDayOfWeek(schedule.dayOfWeek)}</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                              {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="Chưa có lịch làm việc nào được thêm vào." />
              )}
            </Card>
          </Form>
        ) : (
          // Chế độ xem thông tin
          <>
            <Card 
              style={{ marginBottom: 24 }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    type="link" 
                    onClick={() => navigate('/jobs')}
                    style={{ marginRight: 16, padding: 0 }}
                  >
                    Quay lại danh sách công việc
                  </Button>
                </div>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={handleUpdateJob}
                  >
                    Cập nhật công việc
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => setDeleteModalVisible(true)}
                  >
                    Xóa
                  </Button>
                </Space>
              }
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <Title level={3} style={{ marginBottom: 8 }}>{job.title}</Title>
                  <Space direction="vertical" size={2}>
                    <Text>
                      <BankOutlined style={{ marginRight: 8 }} />
                      <Text strong>{job.company.name}</Text>
                    </Text>
                    <Text>
                      <DollarOutlined style={{ marginRight: 8 }} />
                      {formatSalary(job)}
                    </Text>
                    <Text>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Ngày tạo: {formatDate(job.created)}
                      {job.updated && (
                        <Text style={{ marginLeft: 16 }}>Cập nhật lần cuối: {formatDate(job.updated)}</Text>
                      )}
                    </Text>
                  </Space>
                </div>
                <Badge.Ribbon 
                  text={jobTypeDisplay[job.jobType] || job.jobType} 
                  color="blue"
                >
                  <div style={{ width: 120, height: 70 }}></div>
                </Badge.Ribbon>
              </div>
            </Card>
            
            {/* Phần Mô tả công việc */}
            <Card 
              title="Mô tả công việc" 
              style={{ marginBottom: 24 }}
            >
              <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </Paragraph>
            </Card>
            
            {/* Phần Yêu cầu */}
            <Card 
              title="Yêu cầu" 
              style={{ marginBottom: 24 }}
            >
              <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {job.requirements}
              </Paragraph>
            </Card>
            
            {/* Phần Kỹ năng yêu cầu */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Kỹ năng yêu cầu</span>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddSkill}
                  >
                    Thêm mới kĩ năng
                  </Button>
                </div>
              }
              style={{ marginBottom: 24 }}
            >
              {job.listSkill && job.listSkill.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.listSkill.map((jobSkill) => (
                    <Tag key={jobSkill.uuid} color="blue" style={{ padding: '4px 8px', fontSize: 14 }}>
                      {jobSkill.skill.name}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Empty description="Chưa có kỹ năng nào được thêm vào." />
              )}
            </Card>
            
            {/* Phần Lịch làm việc */}
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Lịch làm việc</span>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddSchedule}
                  >
                    Thêm mới lịch làm việc
                  </Button>
                </div>
              }
            >
              {job.schedule && job.schedule.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {job.schedule.map((schedule) => (
                    <Col key={schedule.uuid} xs={24} sm={12} md={8}>
                      <Card size="small" hoverable>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ClockCircleOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 12 }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{formatDayOfWeek(schedule.dayOfWeek)}</div>
                            <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                              {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="Chưa có lịch làm việc nào được thêm vào." />
              )}
            </Card>
          </>
        )}
        
        {/* Modal xác nhận xóa */}
        <Modal
          title="Xác nhận xóa"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p>Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default JobDetailPage;