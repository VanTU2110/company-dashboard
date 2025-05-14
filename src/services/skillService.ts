import api from "./api";

import { SkillListResponse,GetPageSkillParams,JobSkillCreateInput,JobSkillDetail } from "../types/skill";
import { deleteResponse } from "../types/deleteResponse";
import { data } from "react-router-dom";

export const getPageListSkill = async (params: GetPageSkillParams):Promise<SkillListResponse> => {
  try {
    const response = await api.post<SkillListResponse>(`/Skill/get-list-page-skill`, {
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
}

export const createJobSkill = async (data: JobSkillCreateInput):Promise<JobSkillDetail> => {
    try {
        const response = await api.post<JobSkillDetail>(`/JobSkill/create-job-skill`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating job skill:", error);
        throw error;
    }
}
export const deleteJobSKill = async(uuid:string):Promise<deleteResponse> =>{
  try {
    const response = await api.post<deleteResponse>(`/JobSkill/delete-jobskill`,{uuid})
    return response.data;
  } catch (error) {
    console.error("Error delete job skill:", error);
    throw error;
  }
}