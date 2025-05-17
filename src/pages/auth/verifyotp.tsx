import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Spin, Typography, Card, Space } from 'antd';
import { MailOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import { verifyUser } from '../../services/authService';
import {sendOTP} from '../../services/otpService';
const { Title, Text } = Typography;

const OTPVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // State
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  // Lấy email từ URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      message.error('Email is required');
      navigate(-1);
      return;
    }
    setEmail(emailParam);
    handleSendOTP(emailParam);
  }, [searchParams, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Gửi OTP
  const handleSendOTP = async (email: string) => {
    try {
      setIsResending(true);
      await sendOTP(email);
      message.success(`OTP sent to ${email}`);
      setOtpSent(true);
      setCountdown(60); // 60s countdown
    } catch (error) {
      message.error('Failed to send OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Xác thực OTP
  const handleVerify = async (values: { otp: string }) => {
    try {
      setIsLoading(true);
      await verifyUser({ email, otp: values.otp });
      message.success('Account verified successfully!');
      navigate(-1); // Quay lại trang trước
    } catch (error) {
      message.error('Invalid OTP. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-2xl">
        <Space direction="vertical" size="middle" className="w-full">
          <div className="text-center">
            <Title level={3} className="font-bold text-gray-800">
              Verify Your Email
            </Title>
            <Text type="secondary" className="text-gray-600">
              {otpSent ? (
                <>
                  We sent a 6-digit code to <span className="font-medium text-blue-600">{email}</span>
                </>
              ) : (
                'Preparing your verification code...'
              )}
            </Text>
          </div>

          {otpSent ? (
            <Spin spinning={isLoading}>
              <Form form={form} onFinish={handleVerify} layout="vertical">
                <Form.Item
                  name="otp"
                  rules={[
                    { required: true, message: 'Please enter the OTP' },
                    { len: 6, message: 'OTP must be 6 digits' },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    autoFocus
                    className="py-2 rounded-lg"
                  />
                </Form.Item>

                <div className="flex justify-between items-center mb-4">
                  <Text type="secondary" className="text-sm">
                    {countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive code?"}
                  </Text>
                  <Button
                    type="link"
                    icon={<ReloadOutlined />}
                    onClick={() => handleSendOTP(email)}
                    disabled={countdown > 0}
                    loading={isResending}
                    className="text-blue-600"
                  >
                    Resend OTP
                  </Button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isLoading}
                  className="h-10 rounded-lg font-medium"
                >
                  Verify & Continue
                </Button>
              </Form>
            </Spin>
          ) : (
            <div className="flex justify-center py-8">
              <Spin size="large" tip="Sending OTP..." />
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default OTPVerificationPage;