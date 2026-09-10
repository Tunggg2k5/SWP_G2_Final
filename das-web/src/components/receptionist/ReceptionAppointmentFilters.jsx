import { DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ReceptionAppointmentFilters({
  appointmentSearch,
  date,
  setAppointmentSearch,
  setDate,
  showDate = true
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {showDate && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Ngày</span>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(d, dateString) => setDate(dateString)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </div>
      )}
      <div className="flex items-center gap-2 grow max-w-md">
        <span className="text-sm font-medium text-slate-700">Tìm nhanh</span>
        <Input
          prefix={<SearchOutlined className="text-slate-400" />}
          value={appointmentSearch}
          onChange={(e) => setAppointmentSearch(e.target.value)}
          placeholder="Tên, SĐT, dịch vụ hoặc bác sĩ"
          className="w-full"
        />
      </div>
    </div>
  );
}
