import api from "./api";
import { listCVResponse } from "../types/cv";
export const getListCV = async (studentUuid:string):Promise<listCVResponse> =>{
    try {
        const response = await api.post<listCVResponse>(`CV/get-list-cv-student`,{studentUuid});
        return response.data;
    } catch (error) {
        console.error("Error getting list CV", error);
        throw error;
    }
}