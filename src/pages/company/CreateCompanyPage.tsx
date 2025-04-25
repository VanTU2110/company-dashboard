import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProvinces, getDistricts, getCommunes } from '../../services/regionService';
import { createCompany } from '../../services/companyService';
import { Location } from '../../types/location';
import { useNavigate } from 'react-router-dom';

type FormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  description: string;
  matp: string;
  maqh: string;
  xaid: string;
};

const CreateCompanyPage = () => {
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>();
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [communes, setCommunes] = useState<Location[]>([]);

  const matp = watch('matp');
  const maqh = watch('maqh');

  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getProvinces({ keyword: '' });
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (matp) {
      const fetchDistricts = async () => {
        const data = await getDistricts({ matp });
        setDistricts(data);
        setValue('maqh', '');  
        setCommunes([]);
      };
      fetchDistricts();
    }
  }, [matp, setValue]);

  useEffect(() => {
    if (maqh) {
      const fetchCommunes = async () => {
        const data = await getCommunes({ maqh });
        setCommunes(data);
        setValue('xaid', '');  // reset commune
      };
      fetchCommunes();
    }
  }, [maqh, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Lấy userUuid từ localStorage
      const userUuid = localStorage.getItem('useruuid');
      
      if (!userUuid) {
        alert('User không hợp lệ!');
        return;
      }

      await createCompany({
        userUuid,  // Sử dụng userUuid lấy từ localStorage
        name: data.name,
        description: data.description,
        email: data.email,
        phoneNumber: data.phoneNumber,
        matp: data.matp, // use matp directly from form data
        maqh: data.maqh, // use maqh directly from form data
        xaid: data.xaid, // use xaid directly from form data
      });

      alert('Tạo công ty thành công!');
      navigate('/dashboard');
    } catch (err) {
      alert('Tạo công ty thất bại!');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Tạo hồ sơ công ty</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Tên công ty" className="input w-full" required />
        <input {...register('email')} type="email" placeholder="Email" className="input w-full" required />
        <input {...register('phoneNumber')} placeholder="Số điện thoại" className="input w-full" required />
        <textarea {...register('description')} placeholder="Mô tả công ty" className="input w-full h-24" />

        <div className="grid grid-cols-3 gap-3">
          <select {...register('matp')} className="input" required>
            <option value="">Chọn tỉnh</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>

          <select {...register('maqh')} className="input" required disabled={!matp}>
            <option value="">Chọn quận/huyện</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>

          <select {...register('xaid')} className="input" required disabled={!maqh}>
            <option value="">Chọn xã/phường</option>
            {communes.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn w-full">Tạo công ty</button>
      </form>
    </div>
  );
};

export default CreateCompanyPage;
