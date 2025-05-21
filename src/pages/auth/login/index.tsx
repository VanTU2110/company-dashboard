import { Form, Input, Button, Typography, message, Card, Divider, Space, Alert } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { loginCompany } from '../../../services/authService';
import { getCompanyDetail } from '../../../services/companyService';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/Logo của CampusJob.png'; // Thay bằng đường dẫn logo thực tế
import React from 'react';

const { Title, Text } = Typography;

type FormData = {
  email: string;
  password: string;
};

const LoginCompanyPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: FormData) => {
    setLoading(true);
    try {
      const res = await loginCompany(values);

      if (res.error.code !== 'success') {
        message.error('Đăng nhập thất bại!');
        return;
      }

      const { token, role, uuid } = res.data;

      if (role !== 1) {
        message.warning('Không có quyền đăng nhập vào dashboard công ty.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('useruuid', String(uuid));

      const detailRes = await getCompanyDetail();

      if (detailRes.data?.uuid) {
        navigate('/dashboard');
      } else {
        navigate('/create-company');
      }
    } catch (err) {
      message.error('Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-white">
      {/* Phần hình ảnh/branding (ẩn trên mobile) */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-sky-500">
        <div className="max-w-md text-white">
          <img src={logo} alt="Logo" className="w-64 h-64 mb-6 mx-auto" />
          <Title level={2} className="text-white text-center">
            Quản lý doanh nghiệp chuyên nghiệp
          </Title>
          <p className="text-blue-100 text-center mt-4">
            Hệ thống quản lý và kết nối doanh nghiệp toàn diện, giúp bạn tập trung vào phát triển kinh doanh.
          </p>
        </div>
      </div>

      {/* Phần form đăng nhập */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card
            bordered={false}
            className="shadow-lg rounded-2xl border-none"
            bodyStyle={{ padding: '40px' }}
          >
            <div className="text-center mb-8">
              <Title level={3} className="mb-2">
                Đăng nhập doanh nghiệp
              </Title>
              <Text type="secondary">
                Vui lòng nhập thông tin đăng nhập để tiếp tục
              </Text>
            </div>

            

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ email: '', password: '' }}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="email@congty.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="••••••••"
                  size="large"
                />
              </Form.Item>

              <div className="text-right mb-6">
                <Button type="link" className="p-0" onClick={() => navigate('/forgot-password')}>
                  Quên mật khẩu?
                </Button>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  icon={<ArrowRightOutlined />}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <Divider plain className="text-gray-400">
              hoặc
            </Divider>

            <div className="text-center">
              <Space>
                <Text type="secondary">Chưa có tài khoản?</Text>
                <Button 
                  type="link" 
                  onClick={() => navigate('/register-company')}
                  className="p-0 font-medium"
                >
                  Tạo tài khoản ngay
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginCompanyPage;