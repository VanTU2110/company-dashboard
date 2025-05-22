// CreateJobPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertJob } from '../../services/jobService';
import { InsertJob } from '../../types/job';
import { 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  message, 
  Alert, 
  Space,
  Layout
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { useCompany } from '../../contexts/CompanyContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Content, Header } = Layout;

const CreateJobPage = () => {
  const { companyData } = useCompany();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [salaryType, setSalaryType] = useState<string>('fixed');

  useEffect(() => {
    if (companyData && companyData.uuid) {
      form.setFieldsValue({
        companyUuid: companyData.uuid,
      });
    }
  }, [companyData, form]);

  const handleSalaryTypeChange = (value: string) => {
    setSalaryType(value);
    
    // Reset salary fields based on selected type
    if (value === 'fixed') {
      form.setFieldsValue({
        salaryMin: undefined,
        salaryMax: undefined,
      });
    } else {
      form.setFieldsValue({
        salaryFixed: undefined,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setError(null);
    setLoading(true);

    try {
      // Ensure we only send the relevant salary fields based on type
      const jobData: InsertJob = {
        ...values,
        // Make sure we remove fields that shouldn't be in the payload
        ...(values.salaryType === 'fixed' 
          ? { salaryMin: undefined, salaryMax: undefined } 
          : { salaryFixed: undefined })
      };
      
      await insertJob(jobData);
      message.success('Công việc đã được tạo thành công');
      
      // Redirect after successful creation
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo công việc');
      message.error('Không thể tạo công việc. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-0 h-auto">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/jobs')}
            className="text-white p-0 mb-3 flex items-center hover:opacity-80"
          >
            Quay lại danh sách công việc
          </Button>
          <Title level={2} className="text-white m-0">
            Tạo công việc mới
          </Title>
        </div>
      </Header>

      <Content className="bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              className="mb-6"
              closable
            />
          )}

          <Card className="shadow-md">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                jobType: 'remote',
                salaryType: 'fixed',
                currency: 'VND',
                salaryFixed: 0,
              }}
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              {/* Basic information section */}
              <div className="mb-8">
                <Title level={4} className="border-b pb-2">
                  Thông tin cơ bản
                </Title>

                <Form.Item
                  label="Tiêu đề công việc"
                  name="title"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề công việc!' }
                  ]}
                >
                  <Input 
                    placeholder="Nhập tiêu đề công việc" 
                    className="p-2" 
                  />
                </Form.Item>

                <Form.Item
                  label="Loại công việc"
                  name="jobType"
                  rules={[
                    { required: true, message: 'Vui lòng chọn loại công việc!' }
                  ]}
                >
                  <Select placeholder="Chọn loại công việc">
                    <Option value="remote">Remote</Option>
                    <Option value="parttime">Bán thời gian</Option>
                    <Option value="internship">Thực tập</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="companyUuid" 
                  hidden
                >
                  <Input />
                </Form.Item>
              </div>

              {/* Salary information section */}
              <div className="mb-8">
                <Title level={4} className="border-b pb-2">
                  Thông tin lương
                </Title>

                <Form.Item
                  label="Loại lương"
                  name="salaryType"
                  rules={[
                    { required: true, message: 'Vui lòng chọn loại lương!' }
                  ]}
                >
                  <Select 
                    placeholder="Chọn loại lương" 
                    onChange={handleSalaryTypeChange}
                  >
                    <Option value="fixed">Cố định</Option>
                    <Option value="monthly">Theo tháng</Option>
                    <Option value="daily">Theo ngày</Option>
                    <Option value="hourly">Theo giờ</Option>
                  </Select>
                </Form.Item>

                {salaryType === 'fixed' ? (
                  <Form.Item
                    label="Mức lương cố định"
                    name="salaryFixed"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mức lương cố định!' },
                      { type: 'number', min: 0, message: 'Mức lương phải lớn hơn 0!' }
                    ]}
                  >
                    <InputNumber
                      prefix={<DollarOutlined />}
                      placeholder="Nhập mức lương cố định"
                      className="w-full"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="Mức lương tối thiểu"
                      name="salaryMin"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mức lương tối thiểu!' },
                        { type: 'number', min: 0, message: 'Mức lương phải lớn hơn 0!' }
                      ]}
                    >
                      <InputNumber
                        prefix={<DollarOutlined />}
                        placeholder="Nhập mức lương tối thiểu"
                        className="w-full"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Mức lương tối đa"
                      name="salaryMax"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mức lương tối đa!' },
                        { type: 'number', min: 0, message: 'Mức lương phải lớn hơn 0!' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('salaryMin') < value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mức lương tối đa phải lớn hơn mức lương tối thiểu!'));
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        prefix={<DollarOutlined />}
                        placeholder="Nhập mức lương tối đa"
                        className="w-full"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </div>
                )}

                <Form.Item
                  label="Đơn vị tiền tệ"
                  name="currency"
                  rules={[
                    { required: true, message: 'Vui lòng chọn đơn vị tiền tệ!' }
                  ]}
                >
                  <Select placeholder="Chọn đơn vị tiền tệ">
                    <Option value="VND">VND</Option>
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Description and requirements section */}
              <div className="mb-8">
                <Title level={4} className="border-b pb-2">
                  Mô tả và yêu cầu
                </Title>

                <Form.Item
                  label="Mô tả công việc"
                  name="description"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả công việc!' }
                  ]}
                >
                  <TextArea
                    placeholder="Nhập mô tả chi tiết về công việc"
                    rows={6}
                    showCount
                    maxLength={5000}
                  />
                </Form.Item>

                <Form.Item
                  label="Yêu cầu công việc"
                  name="requirements"
                  rules={[
                    { required: true, message: 'Vui lòng nhập yêu cầu công việc!' }
                  ]}
                  extra="Mỗi yêu cầu nên được viết trên một dòng riêng biệt."
                >
                  <TextArea
                    placeholder="Nhập các yêu cầu đối với ứng viên"
                    rows={6}
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </div>

              {/* Submit buttons */}
              <Form.Item className="mt-8">
                <div className="flex justify-end gap-4">
                  <Button onClick={() => navigate('/jobs')}>
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu công việc'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CreateJobPage;