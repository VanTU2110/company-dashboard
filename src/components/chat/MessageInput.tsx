import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface MessageInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  loading = false, 
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ 
      padding: '12px', 
      background: '#fff', 
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Input.TextArea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ 
          resize: 'none',
          borderRadius: '8px'
        }}
        disabled={disabled || loading}
        onKeyDown={handleKeyPress}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        loading={loading}
        disabled={disabled || !message.trim()}
        style={{ 
          marginLeft: '8px',
          borderRadius: '8px',
          height: '38px',
          width: '38px',
          padding: 0
        }}
      />
    </div>
  );
};

export default MessageInput;