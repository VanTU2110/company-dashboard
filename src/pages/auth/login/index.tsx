import { useForm } from 'react-hook-form';
import { loginCompany } from '../../../services/authService';
import { getCompanyDetail } from '../../../services/companyService';
import { useNavigate } from 'react-router-dom';



type FormData = {
  email: string;
  password: string;
};

const LoginCompanyPage = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await loginCompany(data);

      if (res.error.code !== 'success') {
        alert('Đăng nhập thất bại!');
        return;
      }

      const { token, role,uuid,email } = res.data;

      if (role !== 1) {
        alert('Không có quyền đăng nhập vào company dashboard.');
        return;
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('useruuid', String(uuid));

      // Gọi API kiểm tra có company chưa
      const detailRes = await getCompanyDetail();

      if (detailRes.data?.uuid) {
        navigate('/dashboard');
      } else {
        navigate('/create-company');
      }

    } catch (err) {
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập công ty</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          {...register('password')}
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </form>

      <div className="mt-4 text-center">
        <span>Bạn chưa có tài khoản?</span>{' '}
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate('/register-company')}
        >
          Đăng kí ngay
        </button>
      </div>
    </div>
  );
};

export default LoginCompanyPage;
