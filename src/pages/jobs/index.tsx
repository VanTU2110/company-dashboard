// JobsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getListPageJob } from '../../services/jobService';
import { getCompanyDetail } from '../../services/companyService';
import { JobItem, GetJobListParams } from '../../types/job';
import { CompanyDetail } from '../../types/company';
import { ApiResponse } from '../../types/common';
import {
  Typography,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Tag,
  Space,
  Pagination,
  Spin,
  Empty,
  Form,
  Drawer,
  InputNumber,
  Badge,
  Tooltip,
  Avatar,
  Divider,
  Alert,
  Progress
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PlusOutlined,
  CalendarOutlined,
  RightOutlined,
  TagsOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [companyUuid, setCompanyUuid] = useState<string>('');
  const [form] = Form.useForm();
  const [hasFilters, setHasFilters] = useState<boolean>(false);
  
  // Các tham số tìm kiếm và lọc
  const [searchParams, setSearchParams] = useState<GetJobListParams>({
    pageSize: 10,
    page: 1,
    keyword: '',
    jobType: '',
    salaryType: '',
  });

  // Fetch company details when component mounts
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response: ApiResponse<CompanyDetail> = await getCompanyDetail();
        if (response.data && response.data.uuid) {
          setCompanyUuid(response.data.uuid);
          // Update search params with company UUID
          setSearchParams(prev => ({ ...prev, companyUuid: response.data.uuid }));
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };

    fetchCompanyDetails();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getListPageJob({ 
        ...searchParams, 
        page: currentPage,
        companyUuid: companyUuid 
      });
      setJobs(response.data.items);
      setTotalPages(response.data.pagination.totalPage);
      setTotalItems(response.data.pagination.totalCount || response.data.items.length * response.data.pagination.totalPage);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch jobs if companyUuid is available
    if (companyUuid) {
      fetchJobs();
    }
  }, [currentPage, searchParams.pageSize, companyUuid]);

  // Check if any filters are applied
  useEffect(() => {
    const hasActiveFilters = 
      searchParams.keyword !== '' || 
      searchParams.jobType !== '' || 
      searchParams.salaryType !== '' ||
      searchParams.salaryMin !== undefined ||
      searchParams.salaryMax !== undefined;
    
    setHasFilters(hasActiveFilters);
  }, [searchParams]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setSearchParams(prev => ({ ...prev, pageSize }));
    }
  };

  const handleFilterFinish = (values: any) => {
    // Tạo object mới với các giá trị từ form
    const newParams = {
      ...searchParams,
      ...values,
      page: 1,
    };
    
    // Cập nhật state
    setSearchParams(newParams);
    setIsFilterOpen(false);
    setCurrentPage(1);
    
    // Gọi fetchJobs với giá trị newParams trực tiếp
    setLoading(true);
    getListPageJob({ 
      ...newParams, 
      companyUuid: companyUuid 
    }).then(response => {
      setJobs(response.data.items);
      setTotalPages(response.data.pagination.totalPage);
      setTotalItems(response.data.pagination.totalCount || response.data.items.length * response.data.pagination.totalPage);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });
  };

  const handleFilterReset = () => {
    form.resetFields();
    
    const resetParams = {
      pageSize: 10,
      page: 1,
      keyword: '',
      jobType: '',
      salaryType: '',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryFixed: undefined,
      companyUuid: companyUuid,
    };
    
    setSearchParams(resetParams);
    setCurrentPage(1);
    setLoading(true);
    
    getListPageJob({ 
      ...resetParams, 
      companyUuid: companyUuid 
    }).then(response => {
      setJobs(response.data.items);
      setTotalPages(response.data.pagination.totalPage);
      setTotalItems(response.data.pagination.totalCount || response.data.items.length * response.data.pagination.totalPage);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });
  };
  
  const goToJobDetail = (uuid: string) => {
    navigate(`/jobs/${uuid}`);
  };
  
  const goToCreateJob = () => {
    navigate('/jobs/create');
  };
  
  // Format lương với đơn vị tiền tệ
  const formatSalary = (job: JobItem) => {
    if (job.salaryType === 'fixed') {
      return `${job.salaryFixed?.toLocaleString() || 0} ${job.currency}`;
    } else if (job.salaryType === 'monthly') {
      return `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0} ${job.currency}/tháng`;
    } else if (job.salaryType === 'daily') {
      return `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0} ${job.currency}/ngày`;
    } else if (job.salaryType === 'hourly') {
      return `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0} ${job.currency}/giờ`;
    }
    return 'Thương lượng';
  };

  // Mapping cho hiển thị của JobType
  const jobTypeDisplay: Record<string, string> = {
    'parttime': 'Bán thời gian',
    'remote': 'Làm việc từ xa',
    'freelance': 'Freelance',
    'fulltime': 'Toàn thời gian'
  };

  // Mapping màu cho JobType tags
  const jobTypeColors: Record<string, string> = {
    'parttime': 'green',
    'remote': 'purple',
    'freelance': 'magenta',
    'fulltime': 'blue'
  };

  // Hiển thị thông tin lọc đang áp dụng
  const getActiveFiltersInfo = () => {
    const filters = [];
    
    if (searchParams.keyword) {
      filters.push(`Từ khóa: "${searchParams.keyword}"`);
    }
    
    if (searchParams.jobType) {
      filters.push(`Loại công việc: ${jobTypeDisplay[searchParams.jobType] || searchParams.jobType}`);
    }
    
    if (searchParams.salaryType) {
      const salaryTypeMap: Record<string, string> = {
        'fixed': 'Cố định',
        'monthly': 'Theo tháng',
        'daily': 'Theo ngày',
        'hourly': 'Theo giờ'
      };
      filters.push(`Loại lương: ${salaryTypeMap[searchParams.salaryType] || searchParams.salaryType}`);
    }
    
    if (searchParams.salaryMin) {
      filters.push(`Lương tối thiểu: ${searchParams.salaryMin.toLocaleString()}`);
    }
    
    if (searchParams.salaryMax) {
      filters.push(`Lương tối đa: ${searchParams.salaryMax.toLocaleString()}`);
    }
    
    return filters;
  };

  const activeFilters = getActiveFiltersInfo();

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header with gradient background */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', 
        padding: '40px 0',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '24px' }}>
            Tìm kiếm công việc
          </Title>
          
          <Card style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bodyStyle={{ padding: '20px' }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={24} md={16} lg={18}>
                <Input
                  size="large"
                  placeholder="Tìm kiếm công việc..."
                  prefix={<SearchOutlined />}
                  value={searchParams.keyword || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                  onPressEnter={handleSearch}
                  style={{ borderRadius: '6px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={4} lg={3} style={{ marginTop: { xs: '12px', md: '0' } }}>
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  onClick={handleSearch}
                  style={{ borderRadius: '6px' }}
                >
                  Tìm kiếm
                </Button>
              </Col>
              <Col xs={24} sm={12} md={4} lg={3} style={{ marginTop: { xs: '12px', md: '0' } }}>
                <Button 
                  size="large" 
                  block
                  icon={<FilterOutlined />}
                  onClick={() => setIsFilterOpen(true)}
                  style={{ borderRadius: '6px' }}
                >
                  Bộ lọc
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Active filters section */}
        {hasFilters && (
          <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <Text strong>Bộ lọc đang áp dụng:</Text>
              </Space>
              
              <div style={{ marginTop: '8px' }}>
                {activeFilters.map((filter, index) => (
                  <Tag 
                    key={index} 
                    color="blue" 
                    style={{ margin: '4px', padding: '4px 8px' }}
                  >
                    {filter}
                  </Tag>
                ))}
                
                <Button 
                  type="link" 
                  size="small" 
                  onClick={handleFilterReset}
                  style={{ marginLeft: '8px' }}
                >
                  Xóa tất cả
                </Button>
              </div>
            </Space>
          </Card>
        )}

        {/* Results summary with Create Job button */}
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Danh sách công việc</Title>
            {!loading && totalItems > 0 && (
              <Text type="secondary">
                Hiển thị {(currentPage - 1) * searchParams.pageSize + 1} - {Math.min(currentPage * searchParams.pageSize, totalItems)} trong tổng số {totalItems} công việc
              </Text>
            )}
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={goToCreateJob}
              style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: '6px' }}
            >
              Thêm công việc mới
            </Button>
          </Col>
        </Row>

        {/* Job list */}
        {loading ? (
          <Card style={{ borderRadius: '8px', textAlign: 'center', padding: '60px 0' }}>
            <Space direction="vertical" size="large" align="center">
              <Spin size="large" />
              <Text type="secondary">Đang tải danh sách công việc...</Text>
            </Space>
          </Card>
        ) : jobs.length === 0 ? (
          <Card style={{ borderRadius: '8px', textAlign: 'center', padding: '40px 0' }}>
            <Empty 
              description="Không tìm thấy công việc phù hợp" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button type="primary" onClick={handleFilterReset} style={{ marginTop: '16px', borderRadius: '6px' }}>
              Xóa bộ lọc
            </Button>
          </Card>
        ) : (
          <div>
            {jobs.map((job) => (
              <Card 
                key={job.uuid} 
                style={{ 
                  marginBottom: '16px', 
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '20px' }}
                onClick={() => goToJobDetail(job.uuid)}
                hoverable
              >
                <Row justify="space-between" align="top" gutter={[16, 16]}>
                  <Col xs={24} sm={16}>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div>
                        <Space size={12} style={{ marginBottom: '8px' }}>
                          <Title level={4} style={{ margin: 0 }}>{job.title}</Title>
                          <Tag color={jobTypeColors[job.jobType] || 'blue'}>
                            {jobTypeDisplay[job.jobType] || job.jobType}
                          </Tag>
                        </Space>
                        <Space align="center">
                          <Avatar 
                            size="small" 
                            src={job.company?.logo} 
                            style={{ 
                              backgroundColor: !job.company?.logo ? '#1890ff' : undefined,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {!job.company?.logo && job.company?.name.charAt(0)}
                          </Avatar>
                          <Text strong>{job.company?.name}</Text>
                        </Space>
                      </div>
                      
                      <Paragraph 
                        ellipsis={{ rows: 2 }}
                        style={{ color: '#666', marginBottom: '8px' }}
                      >
                        {job.description}
                      </Paragraph>
                      
                      {job.listSkill && job.listSkill.length > 0 && (
                        <Space align="center" wrap>
                          <TagsOutlined style={{ color: '#1890ff' }} />
                          <Text strong style={{ marginRight: '8px' }}>Kỹ năng:</Text>
                          {job.listSkill.slice(0, 5).map((jobSkill) => (
                            <Tag 
                              key={jobSkill.uuid} 
                              color="default" 
                              style={{ 
                                marginBottom: '4px', 
                                borderRadius: '4px',
                                backgroundColor: '#f0f7ff',
                                borderColor: '#d6e4ff'
                              }}
                            >
                              {jobSkill.skill.name}
                            </Tag>
                          ))}
                          {job.listSkill.length > 5 && (
                            <Tag color="default">+{job.listSkill.length - 5}</Tag>
                          )}
                        </Space>
                      )}
                    </Space>
                  </Col>
                  
                  <Col xs={24} sm={8}>
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <Card 
                        style={{ 
                          backgroundColor: '#f9f9f9', 
                          border: 'none',
                          borderRadius: '8px'
                        }} 
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          <div>
                            <DollarOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                            <Text strong style={{ color: '#52c41a' }}>{formatSalary(job)}</Text>
                          </div>
                          
                          {job.schedule && (
                            <div>
                              <CalendarOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                              <Text>{job.schedule?.length} ngày/tuần</Text>
                            </div>
                          )}
                          
                          {job.location && (
                            <div>
                              <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                              <Text>{job.location}</Text>
                            </div>
                          )}
                        </Space>
                      </Card>
                      
                      <Button 
                        type="primary" 
                        size="middle" 
                        block
                        style={{ borderRadius: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToJobDetail(job.uuid);
                        }}
                      >
                        Xem chi tiết <RightOutlined />
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination - Hiển thị rõ ràng hơn */}
        {!loading && totalPages > 0 && (
          <Card style={{ marginTop: '24px', textAlign: 'center', borderRadius: '8px' }}>
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={searchParams.pageSize}
              onChange={handlePageChange}
              showSizeChanger={true}
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} công việc`}
              pageSizeOptions={['10', '20', '50']}
              style={{ margin: '16px 0' }}
            />
          </Card>
        )}
      </div>

      {/* Filter Drawer */}
      <Drawer
        title={<Title level={4}>Bộ lọc tìm kiếm</Title>}
        placement="right"
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        width={320}
        bodyStyle={{ padding: '12px 24px' }}
        headerStyle={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '12px 0' }}>
            <Button onClick={handleFilterReset}>Xóa bộ lọc</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Áp dụng
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterFinish}
          initialValues={{
            jobType: searchParams.jobType || '',
            salaryType: searchParams.salaryType || '',
            salaryMin: searchParams.salaryMin,
            salaryMax: searchParams.salaryMax,
            pageSize: searchParams.pageSize || 10,
          }}
        >
          <Form.Item name="jobType" label="Loại công việc">
            <Select placeholder="Tất cả">
              <Option value="">Tất cả</Option>
              <Option value="fulltime">Toàn thời gian</Option>
              <Option value="parttime">Bán thời gian</Option>
              <Option value="remote">Làm việc từ xa</Option>
              <Option value="freelance">Freelance</Option>
            </Select>
          </Form.Item>

          <Form.Item name="salaryType" label="Loại lương">
            <Select placeholder="Tất cả">
              <Option value="">Tất cả</Option>
              <Option value="fixed">Cố định</Option>
              <Option value="monthly">Theo tháng</Option>
              <Option value="daily">Theo ngày</Option>
              <Option value="hourly">Theo giờ</Option>
            </Select>
          </Form.Item>

          <Form.Item name="salaryMin" label="Lương tối thiểu">
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Lương tối thiểu"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
            />
          </Form.Item>

          <Form.Item name="salaryMax" label="Lương tối đa">
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Lương tối đa"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
            />
          </Form.Item>

          <Form.Item name="pageSize" label="Hiển thị">
            <Select>
              <Option value={10}>10 mỗi trang</Option>
              <Option value={20}>20 mỗi trang</Option>
              <Option value={50}>50 mỗi trang</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default JobsPage;