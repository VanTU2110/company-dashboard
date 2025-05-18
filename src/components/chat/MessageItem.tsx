import { Avatar, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Message } from '../../types/message';
import React from 'react';

const { Text } = Typography;

export interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  renderContent: (content: string) => React.ReactNode;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser,
  renderContent
}) => {
  const formattedTime = new Date(message.sendAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: isCurrentUser ? 'row-reverse' : 'row',
      margin: '8px 0',
      alignItems: 'flex-start',
      maxWidth: '100%'
    }}>
      <Avatar 
        icon={<UserOutlined />} 
        size="default"
        style={{ 
          backgroundColor: isCurrentUser ? '#1890ff' : '#f56a00',
          marginRight: isCurrentUser ? 0 : '12px',
          marginLeft: isCurrentUser ? '12px' : 0,
          flexShrink: 0
        }} 
      />
      
      <div style={{ maxWidth: '80%' }}>
        <div style={{ 
          background: isCurrentUser ? '#1890ff' : '#f0f0f0',
          color: isCurrentUser ? 'white' : 'rgba(0, 0, 0, 0.85)',
          padding: '12px 16px',
          borderRadius: isCurrentUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          display: 'inline-block',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          lineHeight: 1.5
        }}>
          {renderContent(message.content)}
        </div>
        
        <div style={{ 
          marginTop: '4px',
          textAlign: isCurrentUser ? 'right' : 'left',
          padding: '0 8px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formattedTime}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;