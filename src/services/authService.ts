import api from "./api";

import { RegisterCompanyInput, LoginInput, LoginResponse } from '../types/auth';
import { ApiResponse } from '../types/common';

// Đăng kí công ty
export const registerCompany = async (
  data: RegisterCompanyInput
): Promise<ApiResponse<null>> => {
  const res = await api.post('/auth/register-company', data);
  return res.data;
};

// Đăng nhập công ty
export const loginCompany = async (
  data: LoginInput
): Promise<ApiResponse<LoginResponse>> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};