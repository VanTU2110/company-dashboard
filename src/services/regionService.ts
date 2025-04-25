import api from './api';
import { ApiResponse } from '../types/common';
import { Location } from '../types/location';
import {
  RegionInputKeyword,
  RegionInputDistrict,
  RegionInputCommune
} from '../types/region';

export const getProvinces = async (data: RegionInputKeyword): Promise<Location[]> => {
  const res = await api.post<ApiResponse<Location[]>>('/Regions/get-list-page-provinsie', data);
  return res.data.data;
};

export const getDistricts = async (data: RegionInputDistrict): Promise<Location[]> => {
  const res = await api.post<ApiResponse<Location[]>>('/Regions/get-list-page-district-by-provinsie', data);
  return res.data.data;
};

export const getCommunes = async (data: RegionInputCommune): Promise<Location[]> => {
  const res = await api.post<ApiResponse<Location[]>>('/Regions/get-list-page-commune-by-district', data);
  return res.data.data;
};
