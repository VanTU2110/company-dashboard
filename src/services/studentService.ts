import api from './api';
import { DetailStudentResponse } from '../types/student';
export const getStudentDetail = async (uuid: string): Promise<DetailStudentResponse> => {
    const res = await api.post('/Student/detail-student-by-studentuuid', { uuid });
    return res.data;
}