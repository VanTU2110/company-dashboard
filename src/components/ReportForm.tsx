import { REPORT_REASONS } from '../constants/reportReason';
import { useCompany } from '../contexts/CompanyContext';;
import { createReport } from '../services/reportService';
import type { CreateReportParams } from '../types/report';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  targetUuid: string;
  onClose: () => void;
}

export default function ReportForm({ targetUuid }: Props) {
  const navigate = useNavigate();

  const [reason, setReason] = useState<CreateReportParams['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
const {companyData} = useCompany();

  const handleSubmit = async () => {
    if (!reason) {
      setErrorMsg('Vui lòng chọn lý do.');
      return;
    }

    if (reason === 'other' && !description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả chi tiết.');
      return;
    }

    if (!companyData?.uuid) {
      setErrorMsg('Không thể xác định người gửi báo cáo. Vui lòng thử lại sau.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const payload: CreateReportParams = {
      reporterUuid: companyData?.uuid || '',
      targetUuid,
      targetType: 'student',
      reason,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await createReport(payload);

      if (res.error?.code !== 'success') {
        throw new Error(res.error.message);
      }

      alert('Báo cáo của bạn đã được gửi.');
      navigate(-1); // quay lại trang trước
    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Báo cáo nội dung</h1>

      <label className="block font-medium mb-1">Lý do</label>
      <select
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        value={reason}
        onChange={(e) => setReason(e.target.value as CreateReportParams['reason'])}
      >
        <option value="">-- Chọn lý do --</option>
        {REPORT_REASONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label className="block font-medium mb-1">
        {reason === 'other' ? 'Mô tả chi tiết (bắt buộc)' : 'Mô tả thêm (tùy chọn)'}
      </label>
      <textarea
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 min-h-[100px]"
        placeholder="Nhập mô tả..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {errorMsg && <p className="text-red-500 mb-3">{errorMsg}</p>}

      <button
        disabled={loading}
        onClick={handleSubmit}
        className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
      </button>
    </div>
  );
}
