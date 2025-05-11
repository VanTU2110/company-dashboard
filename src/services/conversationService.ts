import api from './api';
import { ConversationListResponse,ConversationResponse,ConversationCreateRequest } from '../types/conversations';
export const getConversations = async (companyUuid: string): Promise<ConversationListResponse> => {
    try {
        const response = await api.post('Conversation/list-by-company', { companyUuid });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};
export const createConversation = async (data: ConversationCreateRequest): Promise<ConversationResponse> => {
    try {
        const response = await api.post('Conversation/create', data);
        return response.data;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
}
