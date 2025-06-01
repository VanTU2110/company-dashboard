export interface SendMessageParams {
    conversationUuid: string;
    content: string;
    senderUuid: string;
}
export interface Message {
    uuid: string;
    content: string;
    senderUuid: string;
    sendAt: string; // ISO date string
    conversationUuid: string;
}
export interface SendMessageResponse {
    data: Message;
    error: {
        code: string;
        message: string;
    };
}
export interface MessageResponse {
    data: Message[];
    error: {
        code: string;
        message: string;
    };
}
export interface SendMassMessageParams {
  companyUuid: string;
  studentUuid: string[]; // Danh sách UUID của sinh viên
  content: string;
}
export interface SendMassMessageResponse {
  data: Message[];
  error: {
    code: string;
    message: string;
  };
}