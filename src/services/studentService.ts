import api from './api';
import { DetailStudentResponse, ListStudentResponse, SuggestStudentParams } from '../types/student';
export const getStudentDetail = async (uuid: string): Promise<DetailStudentResponse> => {
    const res = await api.post('/Student/detail-student-by-studentuuid', { uuid });
    return res.data;
}
export const getStudentSuggest = async(params:SuggestStudentParams):Promise<ListStudentResponse> =>{
    const res = await api.post<ListStudentResponse>('/Student/suggest-students-for-job',params);
    return res.data;
}