import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentDetail } from '../../services/studentService';
import { StudentDetail } from '../../types/student';
import { useNavigate } from 'react-router-dom';
import { createConversation } from '../../services/conversationService';
import { useCompany } from '../../contexts/CompanyContext';
import { CV } from '../../types/cv';
import { getListCV } from '../../services/cvService';
import ReportForm from '../../components/ReportForm';
// Import thư viện react-pdf
import { Document, Page, pdfjs } from 'react-pdf';
// Cấu hình worker cho pdfjs - sử dụng phiên bản cụ thể và đường dẫn https
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

import {
  Spin,
  Card,
  Avatar,
  Button,
  Badge,
  Timeline,
  Divider,
  Tag,
  Alert,
  Empty,
  Modal,
  List,
  Typography,
  Image,
  Space,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  BookOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  EyeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const StudentDetailPage: React.FC = () => {
  const { studentUuid } = useParams<{ studentUuid: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [cvLoading, setCvLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // State cho react-pdf
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<Error | null>(null);
  
  const openReportModal = () => setReportModalVisible(true);
  const closeReportModal = () => setReportModalVisible(false);
  const navigate = useNavigate();
  const { companyData } = useCompany();

  useEffect(() => {
    const fetchStudentDetail = async () => {
      if (!studentUuid) return;

      setLoading(true);
      try {
        const response = await getStudentDetail(studentUuid);
        setStudent(response.data);
        fetchStudentCVs(studentUuid);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Không thể tải thông tin chi tiết của sinh viên');
      } finally {
        setLoading(false);
      }
    };

    const fetchStudentCVs = async (uuid: string) => {
      setCvLoading(true);
      try {
        const response = await getListCV(uuid);
        setCvs(response.data);
      } catch (err) {
        console.error('Error fetching student CVs:', err);
        message.error('Không thể tải danh sách CV');
      } finally {
        setCvLoading(false);
      }
    };

    fetchStudentDetail();
  }, [studentUuid]);

  const handleMessage = async () => {
    if (!student || !companyData?.uuid) return;

    try {
      const response = await createConversation({
        studentUuid: student.uuid,
        companyUuid: companyData?.uuid,
      });

      navigate(`/conversations/${response.data.uuid}`);
    } catch (err) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', err);
      message.error('Không thể tạo cuộc trò chuyện');
    }
  };

  const handlePreviewCV = (url: string) => {
    setPreviewUrl(url);
    setPreviewVisible(true);
    setPageNumber(1); // Reset về trang đầu khi mở PDF mới
    setPdfLoading(true);
    setPdfError(null);
    setScale(1.0); // Reset scale
  };

  const handleDownloadCV = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm xử lý khi PDF được load thành công
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
  };

  // Xử lý khi PDF load bị lỗi
  const onDocumentLoadError = (error: Error) => {
    console.error('Error while loading PDF:', error);
    setPdfError(error);
    setPdfLoading(false);
    // Hiển thị thông báo lỗi cho người dùng
    message.error('Không thể tải file PDF. Vui lòng tải xuống để xem.');
  };

  // Các hàm điều hướng trang PDF
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  // Các hàm phóng to, thu nhỏ PDF
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Format gender
  const getGender = (gender: number) => {
    switch (gender) {
      case 0: return 'Nam';
      case 1: return 'Nữ';
      default: return 'Khác';
    }
  };

  // Format birthday
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format upload time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Map ngày trong tuần sang tiếng Việt
  const mapDayOfWeek = (day: string) => {
    const dayMap: Record<string, string> = {
      'Monday': 'Thứ Hai',
      'Tuesday': 'Thứ Ba',
      'Wednesday': 'Thứ Tư',
      'Thursday': 'Thứ Năm',
      'Friday': 'Thứ Sáu',
      'Saturday': 'Thứ Bảy',
      'Sunday': 'Chủ Nhật'
    };
    return dayMap[day] || day;
  };

  // Hàm chuyển proficiency sang text + màu sắc
  const getProficiencyTag = (proficiency: string) => {
    const colorMap: Record<string, string> = {
      'Beginner': 'blue',
      'Intermediate': 'green',
      'Advanced': 'purple',
      'Expert': 'red'
    };

    return (
      <Tag color={colorMap[proficiency] || 'default'}>
        {proficiency}
      </Tag>
    );
  };

  // Tạo initials từ tên đầy đủ cho avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải thông tin sinh viên...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy thông tin sinh viên'}
          type="error"
          showIcon
        />
        <div className="mt-6 text-center">
          <Link to="/applications">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              Quay lại danh sách ứng tuyển
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link to="/applications" className="mr-4">
            <Button icon={<ArrowLeftOutlined />} className="flex items-center">
              Quay lại danh sách ứng tuyển
            </Button>
          </Link>
        </div>

        {/* Header Card */}
        <Card className="shadow-md mb-6 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/4 flex justify-center items-start mb-4 md:mb-0">
              <Avatar
                size={100}
                style={{
                  backgroundColor: '#1890ff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '36px'
                }}
              >
                {getInitials(student.fullname)}
              </Avatar>
            </div>
            <div className="md:w-3/4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {student.fullname}
                </h1>
                <div className="space-x-2">
                  <Button onClick={handleMessage} type="primary">
                    Nhắn tin
                  </Button>
                  <Button onClick={openReportModal} danger>
                    Báo cáo
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center">
                  <IdcardOutlined className="mr-2" />
                  {student.uuid}
                </span>
                <Badge
                  status={student.gender === 0 ? "processing" : "success"}
                  text={getGender(student.gender)}
                />
                <span className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  {student.phoneNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {formatDate(student.birthday)}
                </span>
                <span className="flex items-center">
                  <BankOutlined className="mr-2" />
                  {student.university}
                </span>
                <span className="flex items-center">
                  <BookOutlined className="mr-2" />
                  {student.major}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Địa chỉ */}
          <Card
            title={
              <span className="flex items-center">
                <EnvironmentOutlined className="mr-2" />
                Địa chỉ
              </span>
            }
            className="shadow-md col-span-1"
          >
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 mb-1">Tỉnh/Thành phố:</p>
                <p className="font-medium">{student.tp?.name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Quận/Huyện:</p>
                <p className="font-medium">{student.qh?.name || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phường/Xã:</p>
                <p className="font-medium">{student.xa?.name || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </Card>

          {/* Kỹ năng */}
          <Card
            title={
              <span className="flex items-center">
                <UserOutlined className="mr-2" />
                Kỹ năng
              </span>
            }
            className="shadow-md col-span-1 md:col-span-2"
          >
            {student.listSkill && student.listSkill.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {student.listSkill.map((skillItem) => (
                  <div
                    key={skillItem.uuid}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <span className="font-medium">{skillItem.skill.name}</span>
                    {getProficiencyTag(skillItem.proficiency)}
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có thông tin về kỹ năng" />
            )}
          </Card>

          {/* Danh sách CV */}
          <Card
            title={
              <span className="flex items-center">
                <FilePdfOutlined className="mr-2" />
                Hồ sơ (CV)
              </span>
            }
            className="shadow-md col-span-1 md:col-span-3"
            loading={cvLoading}
          >
            {cvs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={cvs}
                renderItem={(cv) => (
                  <List.Item
                    actions={[
                      <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => handlePreviewCV(cv.url)}
                      >
                        Xem trước
                      </Button>,
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => handleDownloadCV(cv.url, `CV_${student.fullname}_${formatDateTime(cv.uploadAt)}.pdf`)}
                      >
                        Tải xuống
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />}
                      title={<Text strong>CV {formatDateTime(cv.uploadAt)}</Text>}
                      description={`Đã tải lên: ${formatDateTime(cv.uploadAt)}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Sinh viên chưa tải lên CV nào" />
            )}
          </Card>

          {/* Lịch trình */}
          <Card
            title={
              <span className="flex items-center">
                <ClockCircleOutlined className="mr-2" />
                Lịch trình khả dụng
              </span>
            }
            className="shadow-md col-span-1 md:col-span-3"
          >
            {student.availabilities && student.availabilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {student.availabilities.map((availability) => (
                  <div
                    key={availability.uuid}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="text-lg font-medium mb-2 text-blue-600">
                      {mapDayOfWeek(availability.dayOfWeek)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="bg-white rounded-lg p-2 border border-gray-200 text-center flex-1 mr-2">
                        <div className="text-xs text-gray-500">Bắt đầu</div>
                        <div className="font-medium">{availability.startTime}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200 text-center flex-1 ml-2">
                        <div className="text-xs text-gray-500">Kết thúc</div>
                        <div className="font-medium">{availability.endTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có thông tin về lịch trình khả dụng" />
            )}
          </Card>
        </div>
      </div>

      {/* Modal báo cáo */}
      <Modal
        open={isReportModalVisible}
        onCancel={closeReportModal}
        footer={null}
        title="Báo cáo sinh viên"
        destroyOnClose
      >
        <ReportForm
          targetUuid={student.uuid}
          onClose={closeReportModal}
        />
      </Modal>

      {/* Modal xem trước CV sử dụng react-pdf */}
      <Modal
        open={previewVisible}
        title={`CV của ${student.fullname}`}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
        destroyOnClose
      >
        <div className="flex flex-col items-center">
          {/* Thanh công cụ điều khiển PDF */}
          <div className="bg-gray-100 p-3 rounded-lg mb-4 flex items-center justify-center w-full">
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadCV(previewUrl, `CV_${student.fullname}.pdf`)}
              >
                Tải xuống CV
              </Button>
            </Space>
          </div>

          {/* Container cho PDF viewer với fallback */}
          <div style={{ height: '70vh', width: '100%', overflow: 'auto' }} className="flex justify-center flex-col items-center">
            {pdfLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Spin size="large" />
                <p className="mt-4">Đang tải PDF...</p>
              </div>
            )}
            
            {pdfError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Alert
                  message="Không thể hiển thị PDF"
                  description="Trình duyệt không thể hiển thị file PDF này trực tiếp. Vui lòng tải xuống và mở bằng trình đọc PDF trên máy tính của bạn."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
                <iframe 
                  src={previewUrl} 
                  width="100%" 
                  height="500px" 
                  style={{ border: 'none' }}
                  title="CV Preview Fallback"
                />
                <p className="mt-4 text-gray-500">Nếu không thấy nội dung PDF, vui lòng tải xuống file.</p>
              </div>
            ) : (
              <Document
                file={previewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<Spin size="large" />}
                noData={<Empty description="Không tìm thấy tập tin PDF" />}
                error={<Empty description="Không thể hiển thị PDF" />}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="pdf-page"
                />
              </Document>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDetailPage;