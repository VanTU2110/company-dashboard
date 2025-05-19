import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Button, Typography, Input, Row, Col, Tooltip, message } from 'antd';
import { SearchOutlined, ReloadOutlined, MessageOutlined } from '@ant-design/icons';
import { getConversations  } from '../../services/conversationService';
import { Conversation } from '../../types/conversations';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCompany } from '../../contexts/CompanyContext';

const { Title } = Typography;

const ConversationsPage: React.FC = () => {
  const { companyData } = useCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const navigate = useNavigate();

  const fetchConversations = async () => {
    if (!companyData?.uuid) {
      message.error('Company data not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getConversations(companyData.uuid);
      
      if (response.error && response.error.code !== "success") {
        message.error(`Error: ${response.error.message}`);
        return;
      }
      
      setConversations(response.data || []);
    } catch (error) {
      message.error('Failed to fetch conversations. Please try again later.');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyData?.uuid) {
      fetchConversations();
    }
  }, [companyData]);

  const handleViewConversation = (conversationUuid: string) => {
    navigate(`/conversations/${conversationUuid}`);
  };

  const handleRefresh = () => {
    fetchConversations();
  };

  // Filter conversations based on search text
  const filteredConversations = conversations.filter(conversation => 
    conversation.student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    conversation.uuid.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_: any, record: Conversation) => (
        <div>
          <div><strong>{record.student.name}</strong></div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            ID: {record.student.uuid.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Conversation, b: Conversation) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Conversation) => (
        <Button 
          type="primary" 
          icon={<MessageOutlined />} 
          onClick={() => handleViewConversation(record.uuid)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Conversations</Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Search conversations"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredConversations}
          columns={columns}
          rowKey="uuid"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} conversations`,
          }}
        />
      </Space>
    </Card>
  );
};

export default ConversationsPage;