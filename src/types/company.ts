import { Location } from "./location";
export interface CompanyDetail {
    userUuid: string;
    uuid: string;
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    tp: Location; // Thành phố
    qh: Location; // Quận/huyện
    xa: Location; // Xã/phường
  }
  export interface CreateCompanyInput {
    userUuid: string;
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    matp: string;
    maqh: string;
    xaid: string;
  }
  
  export interface UpdateCompanyInput {
    userUuid: string;
    name?: string;
    description?: string;
    phoneNumber?: string;
    matp?: string;
    maqh?: string;
    xaid?: string;
  }
  export interface getCompanyDetail{
    userUuid: string;
  }