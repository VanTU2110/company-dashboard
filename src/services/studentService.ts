import api from './api';
import { DetailStudentResponse } from '../types/student';
export const getStudentDetail = async (studentUuid: string): Promise<DetailStudentResponse> => {
    const res = await api.post('/Student/detail-student', { studentUuid });
    return res.data;
}