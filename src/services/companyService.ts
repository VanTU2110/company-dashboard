import api from "./api";

import {
    CompanyDetail,
    CreateCompanyInput,
    UpdateCompanyInput,
  } from '../types/company';
import { ApiResponse } from "../types/common";
  // Lấy thông tin chi tiết công ty
  export const getCompanyDetail = async (): Promise<ApiResponse<CompanyDetail>> => {
    const userUuid = localStorage.getItem('useruuid');
    if (!userUuid) throw new Error("Không tìm thấy userUuid trong localStorage");
  
    const res = await api.post('/Companies/detail-company', { uuid: userUuid }); // 👈 đổi tên field thành uuid
    return res.data;
  };
  
  
  // Tạo công ty mới
  export const createCompany = async (data: CreateCompanyInput): Promise<ApiResponse<CompanyDetail>> => {
    const res = await api.post('/Companies/create-company', data);
    return res.data;
  };
  
  // Cập nhật thông tin công ty
  export const updateCompany = async (data: UpdateCompanyInput): Promise<ApiResponse<CompanyDetail>> => {
    const res = await api.post('/Companies/update-company', data);
    return res.data;
  };
  