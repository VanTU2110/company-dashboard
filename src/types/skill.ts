import { Pagination } from "./job";

export interface SkillItem {
uuid: string;
name: string;
}
export interface SkillListResponse {
    data: {
        items: SkillItem[];
        pagination: Pagination;
    }
    error: {
        code: string;
        message: string;
      };
    }
export interface JobSkillCreateInput {
  jobUuid: string;
  skillUuid: string;
}
export interface GetPageSkillParams {
    pageSize: number;
    page: number;  
    keyword?: string;
}
export interface JobSkillDetail {
  data: {
    jobUuid: string;
    Skill:SkillItem[];
    uuid : string;
  }
  error: {
    code: string;
    message: string;
  };
}
