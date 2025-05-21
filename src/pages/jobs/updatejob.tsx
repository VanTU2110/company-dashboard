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
  Row, 
  Col, 
  Modal,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined
} from '@ant-design/icons';
import { UpdateJob } from '../../types/job';
import { updateJob, detailJob } from '../../services/jobService';

const { Title } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const EditJobPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
        message.success('Cập nhật công việc thành công');
        // Chuyển về trang chi tiết sau khi cập nhật
        navigate(`/jobs/${uuid}`);
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

  // Render giao diện chính
  return (
    <Layout className="edit-job-page">
      <Header className="site-layout-background" style={{ padding: '0 24px', background: '#fff', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/jobs/${uuid}`)}
            >
              Quay lại chi tiết
            </Button>
            <Divider type="vertical" />
            <Title level={4} style={{ margin: 0 }}>Chỉnh sửa công việc</Title>
          </Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={isSaving}
          >
            Lưu thay đổi
          </Button>
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
        ) : (
          <Card 
            title="Thông tin công việc"
            bordered={false}
            className="card-shadow"
            style={{ 
              borderRadius: '8px', 
              boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                title: job?.title,
                description: job?.description,
                jobType: job?.jobType,
                salaryType: job?.salaryType,
                salaryMin: job?.salaryMin,
                salaryMax: job?.salaryMax,
                salaryFixed: job?.salaryFixed,
                currency: job?.currency,
                requirements: job?.requirements,
                companyUuid: job?.company?.uuid
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
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default EditJobPage;