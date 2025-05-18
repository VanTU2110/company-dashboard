import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Spin, 
  Empty, 
  Button, 
  Avatar, 
  Alert, 
  Space,
  Card,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  InfoCircleOutlined, 
  ReloadOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';

import { getMessages, sendMessage } from '../../services/chatService';
import { Message } from '../../types/message';
import { useChat } from '../../contexts/ChatContext';
import { useCompany } from '../../contexts/CompanyContext';
import MessageItem from '../../components/chat/MessageItem';
import MessageInput from '../../components/chat/MessageInput';

const { Content, Header } = Layout;
const { Title, Text } = Typography;

const Chat: React.FC = () => {
  const { conversationUuid } = useParams<{ conversationUuid: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("Chat");
  const messageEndRef = useRef<null | HTMLDivElement>(null);
  const fetchedRef = useRef<Set<string>>(new Set());
  
  const { companyData } = useCompany();
  
  const { 
    messages,
    setConversationMessages,
    addMessage,
    setActiveConversation,
    isConnected,
    connectionError,
    reconnect,
    connection
  } = useChat();
  
  const currentMessages = conversationUuid ? 
    messages.get(conversationUuid) || [] : [];

  const fetchMessages = useCallback(async (convId: string) => {
    if (fetchedRef.current.has(convId)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await getMessages(convId);
      
      if (response.data) {
        setConversationMessages(convId, response.data);
        setConversationTitle(`Conversation #${convId.substring(0, 8)}`);
        fetchedRef.current.add(convId);
      } else if (response.error) {
        console.error(`Error: ${response.error.message}`);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [setConversationMessages]);

  useEffect(() => {
    if (!conversationUuid) return;
    
    setActiveConversation(conversationUuid);
    
    if (!fetchedRef.current.has(conversationUuid)) {
      fetchMessages(conversationUuid);
    } else {
      setLoading(false);
    }
    
    return () => {
      setActiveConversation(null);
    };
  }, [conversationUuid, fetchMessages, setActiveConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content || !conversationUuid || !companyData?.uuid) return;
    
    try {
      setSending(true);
      
      const tempMessage: Message = {
        uuid: `temp-${Date.now()}`,
        conversationUuid,
        content,
        senderUuid: companyData.uuid,
        sendAt: new Date().toISOString(),
      };
      
      addMessage(conversationUuid, tempMessage);
      
      if (connection && isConnected) {
        try {
          await connection.invoke("SendMessageToConversation", conversationUuid, companyData.uuid, content);
        } catch (signalRError) {
          console.error(`SignalR error: ${signalRError}`);
        }
      }
      
      const messageParams = {
        conversationUuid,
        content,
        senderUuid: companyData.uuid,
      };
      
      const response = await sendMessage(messageParams);
      
      if (response.data) {
        setConversationMessages(
          conversationUuid, 
          currentMessages
            .filter(msg => msg.uuid !== tempMessage.uuid)
            .concat([response.data])
        );
      } else if (response.error) {
        console.error(`Error: ${response.error.message}`);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const renderMessageContent = (content: string) => {
  // Check if content contains JOB_INVITE tags
  if (content.includes('[JOB_INVITE') && content.includes('[/JOB_INVITE]')) {
    // Extract parts before the job invite tag
    const beforeTag = content.split('[JOB_INVITE')[0].trim();
    
    // Extract the job invite tag content
    const tagContent = content.substring(
      content.indexOf('[JOB_INVITE') + '[JOB_INVITE'.length,
      content.indexOf('[/JOB_INVITE]')
    ).trim();
    
    // Extract parts after the job invite tag
    const afterTag = content.split('[/JOB_INVITE]')[1]?.trim() || '';
    
    // Parse job details from tag content
    const details: Record<string, string> = {};
    const keyValuePairs = tagContent.match(/(\w+)=("[^"]*"|[^\s]*)/g) || [];
    
    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        details[key] = value.replace(/"/g, '');
      }
    });
    
    return (
      <div>
        {beforeTag && <Text>{beforeTag}</Text>}
        
        <Card
          style={{
            margin: '12px 0',
            borderLeft: '4px solid #1890ff',
            backgroundColor: '#f0f8ff'
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={5} style={{ margin: '0 0 8px 0' }}>
                {details.title || 'Vị trí công việc'}
              </Title>
              
              <Space size={[8, 16]} wrap>
                {details.salary && (
                  <Tag icon={<DollarOutlined />} color="blue">
                    {details.salary}
                  </Tag>
                )}
              </Space>
            </div>
            
            {details.uuid && (
              <Link to={`/jobs/${details.uuid}`}>
                <Button type="primary">Xem chi tiết</Button>
              </Link>
            )}
          </div>
        </Card>

        {afterTag && <Text>{afterTag}</Text>}
      </div>
    );
  }
  
  // Regular text message
  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      lineHeight: 1.5
    }}>
      {content}
    </div>
  );
}
  const isCurrentUser = useCallback((senderUuid: string) => 
    senderUuid === companyData?.uuid, [companyData?.uuid]);

  const handleBack = () => {
    navigate('/conversations');
  };
  
  const handleReconnect = async () => {
    try {
      await reconnect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  };

  if (!conversationUuid) {
    return (
      <Layout style={{ height: '100vh' }}>
        <Content style={{ padding: '20px' }}>
          <Empty description="No conversation selected" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px',
        height: '64px',
        lineHeight: '64px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginRight: '12px' }}
          />
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
          <Title level={5} style={{ margin: 0 }}>{conversationTitle}</Title>
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
            {isConnected ? (
              <Text type="success" style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ marginRight: '4px' }} /> Connected
              </Text>
            ) : (
              <Text type="danger" style={{ display: 'flex', alignItems: 'center' }}>
                <DisconnectOutlined style={{ marginRight: '4px' }} /> Disconnected
              </Text>
            )}
          </div>
        </div>
        <Space>
          {!isConnected && (
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleReconnect}
              loading={loading}
            >
              Reconnect
            </Button>
          )}
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            title="Conversation Details"
          />
        </Space>
      </Header>
      
      <Content style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0',
        background: '#f5f5f5',
        flex: 1,
        overflow: 'hidden'
      }}>
        {connectionError && !isConnected && (
          <Alert
            message="Connection Error"
            description={
              <div>
                <p>{connectionError}</p>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<ReloadOutlined />} 
                  onClick={handleReconnect}
                >
                  Try Again
                </Button>
              </div>
            }
            type="error"
            showIcon
            style={{ margin: '8px' }}
          />
        )}
      
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <Spin size="large" />
            </div>
          ) : currentMessages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              textAlign: 'center',
              padding: '0 20px'
            }}>
              <Empty 
                description="No messages yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Text type="secondary" style={{ marginTop: '8px' }}>
                Be the first to send a message!
              </Text>
            </div>
          ) : (
            <>
              {currentMessages.map((msg) => (
                <MessageItem 
                  key={msg.uuid} 
                  message={msg} 
                  isCurrentUser={isCurrentUser(msg.senderUuid)}
                  renderContent={renderMessageContent}
                />
              ))}
            </>
          )}
          <div ref={messageEndRef} />
        </div>
        
        <MessageInput 
          onSend={handleSendMessage} 
          loading={sending}
          disabled={!isConnected}
          placeholder={!isConnected ? "Reconnect to send messages" : "Type your message..."}
        />
      </Content>
    </Layout>
  );
};

export default Chat;