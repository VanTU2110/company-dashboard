export interface Company {
    code: string;
    name: string;
    uuid: string;
  }
  
  export interface Schedule {
    jobUuid: string;
    dayOfWeek: string;
    startTime: string; // "HH:mm:ss"
    endTime: string;   // "HH:mm:ss"
    uuid: string;
  }
  
  export interface Skill {
    name: string;
    uuid: string;
  }
  
  export interface JobSkill {
    jobUuid: string;
    skill: Skill;
    uuid: string;
  }
  
  export interface JobItem {
    company: Company;
    tittle: string;
    description: string;
    jobType: 'fulltime' | 'parttime' | 'internship' | string; // bạn có thể thay `string` bằng enum cụ thể nếu biết hết các loại
    salaryType: 'fixed' | 'range' | string;
    salaryMin: number;
    salaryMax: number;
    salaryFixed: number;
    currency: string;
    requirements: string;
    created: string; // ISO date string
    updated: string | null;
    schedule: Schedule[];
    listSkill: JobSkill[];
    uuid: string;
  }
  
  export interface Pagination {
    totalCount: number;
    totalPage: number;
  }
  
  export interface JobListResponse {
    data: {
      items: JobItem[];
      pagination: Pagination;
    };
    error: {
      code: string;
      message: string;
    };
  }
  
  export interface InsertJob {
    title: string;
    description: string;
    jobType: 'remote' | 'parttime' | 'internship' | string; // bạn có thể thay `string` bằng enum cụ thể nếu biết hết các loại
    salaryType: 'fixed' | 'monthly' | 'daily'|'hourly'| string;
    salaryMin?: number;
    salaryMax?: number;
    salaryFixed?: number;
    currency: string;
    requirements: string;
    companyUuid: string;
  }
  export interface UpdateJob {
    uuid: string; // Job UUID cần cập nhật
    title?: string;
    description?: string;
    jobType: 'remote' | 'parttime' | 'internship' | string; // bạn có thể thay `string` bằng enum cụ thể nếu biết hết các loại
    salaryType: 'fixed' | 'monthly' | 'daily'|'hourly'| string;
    salaryMin?: number;
    salaryMax?: number;
    salaryFixed?: number;
    currency?: string;
    requirements?: string;
    companyUuid?: string;
  }
  export interface GetJobListParams {
    pageSize: number;
    page: number;
    companyUuid?: string;
    keyword?: string;
    status?: number;
    jobType?: string;
    salaryType?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryFixed?: number;
  }
  export interface JobDetailResponse {
    data: JobItem; // Không có mảng items mà trả về trực tiếp object JobItem
    error: {
      code: string;
      message: string;
    };
  }