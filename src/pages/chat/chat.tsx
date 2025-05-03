import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Empty, Button, Avatar, Alert, Space } from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  InfoCircleOutlined, 
  ReloadOutlined,
  DisconnectOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

// Import services, contexts and components
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
  const fetchedRef = useRef<Set<string>>(new Set()); // Track fetched conversations
  
  // Get companyUuid from CompanyContext to use as senderUuid
  const { companyData } = useCompany();
  
  const { 
    messages,
    setConversationMessages,
    addMessage,
    setActiveConversation,
    isConnected,
    connectionError,
    reconnect
  } = useChat();
  
  // Memoize current messages to prevent unnecessary re-renders
  const currentMessages = conversationUuid ? 
    messages.get(conversationUuid) || [] : [];

  // Memoize the fetch messages function
  const fetchMessages = useCallback(async (convId: string) => {
    // Check if we already fetched this conversation's messages
    if (fetchedRef.current.has(convId)) {
      console.log(`Messages for conversation ${convId} already fetched, skipping`);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching messages for conversation ${convId}`);
      const response = await getMessages(convId);
      
      if (response.data) {
        setConversationMessages(convId, response.data);
        
        // Set conversation title - in a real app, fetch this from your API
        setConversationTitle(`Conversation #${convId.substring(0, 8)}`);
        
        // Mark this conversation as fetched
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

  // Handle active conversation changes - only runs when conversation UUID changes
  useEffect(() => {
    if (!conversationUuid) return;
    
    console.log(`Setting active conversation to ${conversationUuid}`);
    setActiveConversation(conversationUuid);
    
    // Only fetch if we haven't fetched this conversation before
    if (!fetchedRef.current.has(conversationUuid)) {
      fetchMessages(conversationUuid);
    } else {
      // If already fetched, just ensure loading is false
      setLoading(false);
    }
    
    return () => {
      // Clean up when component unmounts or conversation changes
      console.log('Cleaning up, setting active conversation to null');
      setActiveConversation(null);
    };
  }, [conversationUuid, fetchMessages, setActiveConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]); // Only depend on message count, not the whole array

  const handleSendMessage = async (content: string) => {
    if (!content || !conversationUuid || !companyData?.uuid) return;
    
    try {
      setSending(true);
      const messageParams = {
        conversationUuid,
        content,
        senderUuid: companyData.uuid,
      };
      
      const response = await sendMessage(messageParams);
      
      if (response.data) {
        addMessage(conversationUuid, response.data);
      } else if (response.error) {
        console.error(`Error: ${response.error.message}`);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

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