import React from 'react';
import { List, Avatar, Badge, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AvatarProps } from 'antd/lib/avatar';

const { Text } = Typography;

// Interface for conversation data
interface Conversation {
  uuid: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participants?: Array<{
    uuid: string;
    name: string;
    avatar?: string;
  }>;
}

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  // Format the time display
  const formatTime = (isoString?: string): string => {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Today
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Yesterday
    else if (diffDays === 1) {
      return 'Yesterday';
    }
    // Within last 7 days
    else if (diffDays < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    }
    // Older than 7 days
    else {
      return date.toLocaleDateString();
    }
  };

  // Decide what avatar to display
  const renderAvatar = () => {
    const participants = conversation.participants || [];
    
    if (participants.length === 0) {
      // No participants, show default avatar
      return <Avatar icon={<UserOutlined />} />;
    }
    else if (participants.length === 1) {
      // Single participant
      const user = participants[0];
      return (
        <Avatar 
          src={user.avatar} 
          icon={!user.avatar ? <UserOutlined /> : undefined}
        >
          {!user.avatar && user.name ? user.name.charAt(0).toUpperCase() : null}
        </Avatar>
      );
    }
    else {
      // Group conversation
      // For a cleaner UI, we'll show at most 2 participants in a group avatar
      const avatarCount = Math.min(participants.length, 2);
      const avatarProps: AvatarProps[] = participants.slice(0, avatarCount).map((user) => ({
        src: user.avatar,
        icon: !user.avatar ? <UserOutlined /> : undefined,
        children: !user.avatar && user.name ? user.name.charAt(0).toUpperCase() : null,
      }));

      return (
        <Avatar.Group maxCount={2} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
          {avatarProps.map((props, idx) => (
            <Avatar key={idx} {...props} />
          ))}
        </Avatar.Group>
      );
    }
  };

  // Truncate text if too long
  const truncateText = (text?: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <List.Item 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '8px',
        transition: 'background-color 0.3s',
        backgroundColor: conversation.unreadCount ? '#f0f7ff' : 'transparent',
        marginBottom: '8px',
      }}
      className="conversation-item-hover"
    >
      <List.Item.Meta
        avatar={renderAvatar()}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong={conversation.unreadCount ? true : false}>
              {conversation.title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(conversation.lastMessageTime)}
            </Text>
          </div>
        }
        description={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '13px',
                maxWidth: '70%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: conversation.unreadCount ? 'bold' : 'normal',
                color: conversation.unreadCount ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)',
              }}
            >
              {truncateText(conversation.lastMessage)}
            </Text>
            {conversation.unreadCount ? (
              <Badge count={conversation.unreadCount} style={{ marginLeft: '8px' }} />
            ) : null}
          </div>
        }
      />
    </List.Item>
  );
};

export default ConversationItem;