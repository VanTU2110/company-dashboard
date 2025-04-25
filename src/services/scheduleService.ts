import api from "./api";

import { ScheduleCreateInput } from "../types/schedule";

export const createSchedule = async (data: ScheduleCreateInput) => {
    const response = await api.post("/JobSchedule/insert-job-schedule", data);
    return response.data;
  };