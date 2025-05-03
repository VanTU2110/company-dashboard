import React from 'react';
import { Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Message } from '../../types/message';

const { Text } = Typography;

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser }) => {
  // Format the time to a readable format
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
          maxWidth: '70%',
        }}
      >
        {!isCurrentUser && (
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              marginRight: '8px',
              alignSelf: 'flex-end',
              marginBottom: '4px'
            }} 
          />
        )}
        
        <div>
          <div
            style={{
              background: isCurrentUser ? '#1890ff' : '#f0f0f0',
              color: isCurrentUser ? '#fff' : 'rgba(0, 0, 0, 0.85)',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              maxWidth: '100%',
              wordWrap: 'break-word',
              borderBottomLeftRadius: !isCurrentUser ? '4px' : '12px',
              borderBottomRightRadius: isCurrentUser ? '4px' : '12px',
            }}
          >
            {message.content}
          </div>
          
          <div 
            style={{ 
              textAlign: isCurrentUser ? 'right' : 'left',
              marginTop: '4px'
            }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(message.sendAt)}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;