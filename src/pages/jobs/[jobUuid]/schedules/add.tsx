import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSchedule } from "../../../../services/scheduleService";
import { ScheduleCreateInput } from "../../../../types/schedule";
import { toast } from "react-toastify";
import { CalendarDays, Clock, Eye } from "lucide-react";

const WEEKDAY_LABELS: Record<string, string> = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "Chủ nhật",
};

export default function AddSchedulePage() {
  const { jobUuid } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Omit<ScheduleCreateInput, "job_Uuid">>({
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission triggered");
    
    if (!jobUuid) {
      console.log("Job UUID missing");
      return toast.error("Không tìm thấy Job ID!");
    }

    const start = new Date(`1970-01-01T${formData.start_time}:00`);
    const end = new Date(`1970-01-01T${formData.end_time}:00`);

    if (end <= start) {
      console.log("Invalid time range");
      return toast.error("Giờ kết thúc phải sau giờ bắt đầu");
    }

    const data: ScheduleCreateInput = {
      ...formData,
      job_Uuid: jobUuid,
    };

    console.log("Preparing to call API with data:", data);
    
    try {
      console.log("Calling createSchedule API");
      const response = await createSchedule(data);
      console.log("API call successful:", response);
      toast.success("Tạo lịch thành công!");
      navigate(`/jobs/${jobUuid}`);
    } catch (err) {
      console.error("API call failed:", err);
      toast.error("Lỗi khi tạo lịch.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-6 space-y-8">
      {/* FORM NHẬP */}
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Thêm lịch làm việc
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thứ trong tuần</label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn thứ --</option>
              {Object.entries(WEEKDAY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            onClick={() => console.log("Button clicked")}
          >
            <Clock className="inline-block w-5 h-5 mr-2 -mt-1" />
            Tạo lịch
          </button>
        </form>
      </div>

      {/* PREVIEW */}
      {(formData.day_of_week && formData.start_time && formData.end_time) && (
        <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 shadow flex items-start gap-4">
          <Eye className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Xem trước lịch làm việc:</h3>
            <p className="text-gray-700">
              <strong>Thứ:</strong> {WEEKDAY_LABELS[formData.day_of_week]}<br />
              <strong>Giờ:</strong> {formData.start_time} - {formData.end_time}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}