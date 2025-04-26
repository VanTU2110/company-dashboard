import { Form, Input, Button, Typography, message, Card } from 'antd';
import { registerCompany } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

const { Title } = Typography;

type FormData = {
  email: string;
  password: string;
  repassword: string;
};

const RegisterCompanyPage = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.repassword) {
      message.error('Mật khẩu và nhập lại mật khẩu không khớp!');
      return;
    }

    try {
      await registerCompany({
        email: data.email,
        password: data.password,
      });

      message.success('Đăng ký thành công!');
      navigate('/login-company');
    } catch (err) {
      message.error('Lỗi đăng ký!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg" bordered={false}>
        <Title level={3} className="text-center mb-6">
          Đăng ký tài khoản công ty
        </Title>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Vui lòng nhập email!',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không hợp lệ!',
                }
              }}
              render={({ field }) => (
                <Input {...field} placeholder="Nhập email" />
              )}
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            label="Mật khẩu"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu!' }}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Nhập mật khẩu" />
              )}
            />
          </Form.Item>

          {/* Re-password Field */}
          <Form.Item
            label="Nhập lại mật khẩu"
            validateStatus={errors.repassword ? 'error' : ''}
            help={errors.repassword?.message}
          >
            <Controller
              name="repassword"
              control={control}
              rules={{ required: 'Vui lòng nhập lại mật khẩu!' }}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Nhập lại mật khẩu" />
              )}
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đăng ký
            </Button>
          </Form.Item>

          {/* Login redirect */}
          <div className="text-center mt-2">
            <span>Đã có tài khoản?</span>{' '}
            <Button type="link" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterCompanyPage;
