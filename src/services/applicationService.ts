import api from "./api";

import { GetListByJobResponse,GetListByJobParams } from "../types/application";

export const getListByJob = async (params: GetListByJobParams):Promise<GetListByJobResponse> => {
    const res = await api.post('/Application/get-list-by-job', params);
    return res.data;
}
