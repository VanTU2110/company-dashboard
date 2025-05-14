import api from "./api";

import { ScheduleCreateInput } from "../types/schedule";
import { deleteResponse } from "../types/deleteResponse";

export const createSchedule = async (data: ScheduleCreateInput) => {
    const response = await api.post("/JobSchedule/insert-job-schedule", data);
    return response.data;
  };
  export const deleteSchedule = async(uuid:string):Promise<deleteResponse> =>{
    try {
      const response = await api.post<deleteResponse>(`/JobSchedule/delete-schedule`,{uuid});
      return response.data
    } catch (error) {
      console.error("Error delete schedule")
      throw error;
      
    }
  }