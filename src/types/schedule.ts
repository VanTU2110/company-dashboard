export interface ScheduleCreateInput {
    job_Uuid: string;
    day_of_week: string;   // VD: "Monday", "Tuesday", hoặc "2", "3" tuỳ theo BE
    start_time: string;    // "HH:mm"
    end_time: string;      // "HH:mm"
  }
  