import { Schedule } from "../types/job"; // nếu bạn đã tách type riêng

// Hàm format thời gian: "12:00:00" -> "12h00"
const formatTime = (time: string): string => {
  const [hour, minute] = time.split(':');
  return `${hour}h${minute}`;
};

// Bản đồ ngày trong tuần
const dayMap: Record<string, string> = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "Chủ nhật",
};

// Format 1 item lịch
const formatScheduleItem = (schedule: Schedule): string => {
  const day = dayMap[schedule.dayOfWeek.toLowerCase()] || schedule.dayOfWeek;
  const time = `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
  return `${day}: ${time}`;
};

// Format toàn bộ lịch
export const formatScheduleList = (schedules: Schedule[]): string[] => {
  return schedules.map(formatScheduleItem);
};
