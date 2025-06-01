import api from './api';
import { SendMessageParams, MessageResponse,SendMessageResponse,SendMassMessageParams,SendMassMessageResponse } from '../types/message';

export const sendMessage = async (params: SendMessageParams): Promise<SendMessageResponse> => {
    try {
        const response = await api.post('Chat/send-message', params);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
export const getMessages = async (conversationUuid: string): Promise<MessageResponse> => {
    try {
        const response = await api.post('Chat/get-messages', { conversationUuid });
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}
export const sendMassMessage = async (params: SendMassMessageParams): Promise<SendMassMessageResponse> => {
    try {
        const response = await api.post('Chat/send-mass', params);
        return response.data;
    } catch (error) {
        console.error('Error sending mass message:', error);
        throw error;
    }
}