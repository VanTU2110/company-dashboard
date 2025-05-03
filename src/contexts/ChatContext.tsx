import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { Message } from '../types/message';

interface ChatContextProps {
  messages: Map<string, Message[]>;
  activeConversation: string | null;
  isConnected: boolean;
  connectionError: string | null;
  setActiveConversation: (conversationId: string | null) => void;
  setConversationMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  reconnect: () => Promise<void>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  hubUrl: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, hubUrl }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use a ref to track active conversation to avoid dependency issues
  const activeConversationRef = useRef<string | null>(null);
  
  // Update the ref whenever activeConversation changes
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Function to establish SignalR connection
  const setupConnection = useCallback(async () => {
    console.log('Setting up SignalR connection to:', hubUrl);
    try {
      // Close existing connection if any
      if (connection) {
        console.log('Stopping existing connection...');
        await connection.stop();
      }

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          // Add access token if needed
          // accessTokenFactory: () => localStorage.getItem('token') || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000]) // Retry intervals in milliseconds
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up message receiving handler - this won't change
      newConnection.on('ReceiveMessage', (message: Message) => {
        if (message.conversationUuid) {
          console.log('Received message for conversation:', message.conversationUuid);
          setMessages(prevMessages => {
            const newMessages = new Map(prevMessages);
            const conversationMessages = newMessages.get(message.conversationUuid) || [];
            newMessages.set(message.conversationUuid, [...conversationMessages, message]);
            return newMessages;
          });
        }
      });

      // Handle connection status changes
      newConnection.onclose(error => {
        console.log('SignalR connection closed', error);
        setIsConnected(false);
        if (error) {
          setConnectionError(`Connection closed with error: ${error}`);
        } else {
          setConnectionError('Connection closed');
        }
      });

      newConnection.onreconnecting(error => {
        console.log('SignalR reconnecting', error);
        setIsConnected(false);
        setConnectionError('Attempting to reconnect...');
      });

      newConnection.onreconnected(connectionId => {
        console.log('SignalR reconnected', connectionId);
        setIsConnected(true);
        setConnectionError(null);
        
        // Use the ref to get the current active conversation
        const currentActiveConversation = activeConversationRef.current;
        
        // Rejoin active conversation if any
        if (currentActiveConversation) {
          console.log('Rejoining conversation after reconnect:', currentActiveConversation);
          newConnection.invoke('JoinConversation', currentActiveConversation)
            .catch(err => console.error('Error rejoining conversation:', err));
        }
      });

      // Start the connection
      console.log('Starting SignalR connection...');
      await newConnection.start();
      console.log('SignalR Connected successfully');
      setIsConnected(true);
      setConnectionError(null);
      setConnection(newConnection);

      // Use the ref to get the current active conversation
      const currentActiveConversation = activeConversationRef.current;
      
      // Join active conversation if any
      if (currentActiveConversation) {
        console.log('Joining conversation after connect:', currentActiveConversation);
        await newConnection.invoke('JoinConversation', currentActiveConversation);
      }

      return newConnection;
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      setIsConnected(false);
      setConnectionError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [hubUrl]); // Remove dependencies that can trigger unnecessary reconnects

  // Initialize connection when component mounts
  useEffect(() => {
    setupConnection();
    
    // Cleanup function
    return () => {
      if (connection) {
        connection.stop().catch(err => console.error('Error stopping connection:', err));
      }
    };
  }, [hubUrl]); // Only reconnect if hubUrl changes

  // Handle active conversation changes
  useEffect(() => {
    if (!connection || !isConnected || !activeConversation) return;
    
    console.log('Joining conversation from effect:', activeConversation);
    // Join new conversation
    connection.invoke('JoinConversation', activeConversation)
      .catch(err => console.error('Error joining conversation:', err));
      
  }, [activeConversation, connection, isConnected]);

  // Function to manually reconnect
  const reconnect = async () => {
    console.log('Manually reconnecting...');
    await setupConnection();
  };

  // Function to set conversation messages
  const setConversationMessages = (conversationId: string, messageList: Message[]) => {
    setMessages(prevMessages => {
      const newMessages = new Map(prevMessages);
      newMessages.set(conversationId, messageList);
      return newMessages;
    });
  };

  // Function to add a message to a conversation
  const addMessage = (conversationId: string, message: Message) => {
    setMessages(prevMessages => {
      const newMessages = new Map(prevMessages);
      const conversationMessages = newMessages.get(conversationId) || [];
      newMessages.set(conversationId, [...conversationMessages, message]);
      return newMessages;
    });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    messages,
    activeConversation,
    isConnected,
    connectionError,
    setActiveConversation,
    setConversationMessages,
    addMessage,
    reconnect
  }), [
    messages,
    activeConversation,
    isConnected,
    connectionError,
    setActiveConversation,
    setConversationMessages,
    addMessage,
    reconnect
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};