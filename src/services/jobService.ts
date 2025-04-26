import api from "./api";
import { GetJobListParams, JobListResponse, InsertJob,UpdateJob, JobDetailResponse } from "../types/job";

export const getListPageJob = async (params: GetJobListParams):Promise<JobListResponse> => {
    const res = await api.post('/Job/get-list-page-job', params);
    return res.data;
}
export const insertJob = async (data: InsertJob):Promise<JobListResponse> => {
    console.log('Payload sent to API:', data);
    const res = await api.post('/Job/create-job', data);
    return res.data;
}
export const updateJob = async (data: UpdateJob):Promise<JobListResponse> => {
    const res = await api.post('/Job/update-job', data);
    return res.data;
}
export const detailJob = async (uuid: string):Promise<JobDetailResponse> => {
    const res = await api.post('/Job/detail-job', { uuid });
    return res.data;
}