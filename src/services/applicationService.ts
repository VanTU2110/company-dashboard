import api from "./api";

import { GetListByJobResponse,GetListByJobParams, UpdateStatusParams,UpdateStatusResponse,AddNoteParams,CancelApplyParams } from "../types/application";

export const getListByJob = async (params: GetListByJobParams):Promise<GetListByJobResponse> => {
    const res = await api.post('/Application/get-list-by-job', params);
    return res.data;
}
export const updateStatus = async (params: UpdateStatusParams):Promise<UpdateStatusResponse> => {
    const res = await api.post('/Application/update-status', params);
    return res.data;
}
export const addNote = async (params: AddNoteParams):Promise<UpdateStatusResponse> => {
    const res = await api.post('/Application/add-note-to-application', params);
    return res.data;
}
export const cancelApply = async (params: CancelApplyParams):Promise<UpdateStatusResponse> => {
    const res = await api.post('/Application/cancel-apply', params);
    return res.data;
}
