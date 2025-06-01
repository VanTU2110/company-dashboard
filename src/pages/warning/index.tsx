import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { getPageListWarning } from '../../services/warningService';
import { Warning, ListWarningResponse } from '../../types/warning';
import { Table, Modal, Card, Tag, Button, Spin, Empty, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ListWarning: React.FC = () => {
  const { companyData } = useCompany();
  const [loading, setLoading] = useState<boolean>(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const fetchWarnings = async (params: {
    page: number;
    pageSize: number;
    targetUuid: string;
  }) => {
    try {
      setLoading(true);
      const response: ListWarningResponse = await getPageListWarning(params);
      if (response.data) {
        setWarnings(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data?.pagination?.totalCount || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyData?.uuid) {
      fetchWarnings({
        page: pagination.page,
        pageSize: pagination.pageSize,
        targetUuid: companyData.uuid,
      });
    }
  }, [companyData?.uuid, pagination.page, pagination.pageSize]);

  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const showDetailModal = (warning: Warning) => {
    setSelectedWarning(warning);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWarning(null);
  };

  const columns: ColumnsType<Warning> = [
    {
      title: 'Target Type',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (text: string) => (
        <Tag color={text === 'COMPANY' ? 'blue' : 'purple'}>{text}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'messages',
      key: 'messages',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 300 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<InfoCircleOutlined />}
          onClick={() => showDetailModal(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card
        className="shadow-md"
        title={
          <div className="flex items-center">
            <ExclamationCircleOutlined className="mr-2 text-xl text-yellow-500" />
            <Title level={4} className="m-0">
              Danh sách cảnh báo
            </Title>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={warnings}
            rowKey="uuid"
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} warnings`,
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  description="No warnings found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            className="rounded-lg overflow-hidden"
          />
        </Spin>
      </Card>

      <Modal
        title="Warning Details"
        open={modalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
        width={700}
        centered
      >
        {selectedWarning && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Target Type:</Text>
                <div>
                  <Tag color={selectedWarning.targetType === 'COMPANY' ? 'blue' : 'purple'}>
                    {selectedWarning.targetType}
                  </Tag>
                </div>
              </div>
              <div>
                <Text strong>Target UUID:</Text>
                <div>
                  <Text code>{selectedWarning.targetUuid}</Text>
                </div>
              </div>
            </div>

            <div>
              <Text strong>Created At:</Text>
              <div>
                {dayjs(selectedWarning.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </div>
            </div>

            <div>
              <Text strong>Message:</Text>
              <Card className="mt-2 bg-gray-50">
                <Text>{selectedWarning.messages}</Text>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListWarning;