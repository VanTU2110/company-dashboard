import { useForm } from 'react-hook-form';
import { registerCompany } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';

type FormData = {
  name: string;
  email: string;
  password: string;
};

const RegisterCompanyPage = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await registerCompany(data);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      alert('Lỗi đăng ký!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Đăng ký công ty</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Tên công ty" className="input" />
        <input {...register('email')} type="email" placeholder="Email" className="input" />
        <input {...register('password')} type="password" placeholder="Mật khẩu" className="input" />
        <button type="submit" className="btn">Đăng ký</button>
      </form>
    </div>
  );
};

export default RegisterCompanyPage;
