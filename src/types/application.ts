import { Pagination } from "./job";

export interface Application {
    studentUuid: string;
    jobUuid: string;
    status: 'cancelled' | 'pending' | 'approved' | 'rejected'; // Thêm các trạng thái khác nếu cần
    coverLetter: string | null;
    note: string | null;
    appliedAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    uuid: string;
  }
  export interface GetListByJobResponse {
    data: {
      items: Application[];
      pagination: Pagination;
    };
    error: {
      code: string; 
      message: string;
    };
  }
  export interface GetListByJobParams {
    jobUuid: string;
    pageSize: number;
    page: number;
  }
  export interface UpdateStatusParams {
    uuid: string;
    status: string; 
    }