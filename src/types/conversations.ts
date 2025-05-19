export interface Student{
    uuid: string;
    name: string;
}
export interface Company{
    uuid: string;
    name: string;
}
export interface Conversation {
    student: Student;
    company: Company;
    createdAt: string;
    uuid: string;
}
export interface ConversationListResponse {
    data: Conversation[];
    error: {
        code: string;
        message: string;
    };
}
export interface ConversationResponse {
    data: Conversation;
    error: {
        code: string;
        message: string;
    };
}
export interface ConversationCreateRequest {
    studentUuid: string;
    companyUuid: string;
}