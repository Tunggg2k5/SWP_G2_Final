import { CalendarClock, Filter, X } from "lucide-react";
import { useMemo, useState } from "react";
import { List } from "antd";
import EmptyState from "../EmptyState.jsx";
import PatientAppointmentCard from "./PatientAppointmentCard.jsx";
import { clinicDateInput, compareAppointmentsNewestFirst } from "../../utils/format.js";

export default function PatientAppointmentList({
  appointments,
  appointmentHistory = [],
  canModifyAppointment,
  cancelAppointment,
  dentistOptions,
  historyOnly = false,
  loading,
  rescheduleAppointment,
  rescheduleForms,
  slotClosures = [],
  slotOptions,
  updateRescheduleForm
}) {
  const [filterDate, setFilterDate] = useState("");
  const source = historyOnly ? appointmentHistory : appointments;
  const visibleAppointments = useMemo(() => {
    return source
      .filter((appointment) => !filterDate || clinicDateInput(appointment.startAt) === filterDate)
      .sort(compareAppointmentsNewestFirst);
  }, [source, filterDate]);

  return (
    <section className="space-y-4" id="appointments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarClock className="text-primary-500" size={24} />
          <h2 className="text-xl font-bold">{historyOnly ? "Lịch sử lịch hẹn" : "Lịch hẹn của tôi"}</h2>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-2 text-slate-500 border-r border-slate-100">
            <Filter size={16} />
            <span className="text-sm font-medium hidden sm:inline">Lọc ngày</span>
          </div>
          <input
            type="date"
            className="border-0 bg-transparent text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer px-2"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
          {filterDate && (
            <button
              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              type="button"
              onClick={() => setFilterDate("")}
              title="Xóa bộ lọc"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card-base p-8">
          <EmptyState title="Đang tải lịch hẹn" text="Hệ thống đang lấy dữ liệu mới nhất." />
        </div>
      ) : visibleAppointments.length ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={visibleAppointments}
          renderItem={(appointment) => (
            <List.Item key={appointment._id}>
              <PatientAppointmentCard
                appointment={appointment}
                canModifyAppointment={canModifyAppointment}
                cancelAppointment={cancelAppointment}
                dentistOptions={dentistOptions}
                rescheduleAppointment={rescheduleAppointment}
                rescheduleForm={rescheduleForms[appointment._id]}
                slotClosures={slotClosures}
                slotOptions={slotOptions}
                updateRescheduleForm={updateRescheduleForm}
              />
            </List.Item>
          )}
        />
      ) : (
        <div className="card-base p-8">
          <EmptyState
            title={historyOnly ? "Chưa có lịch sử lịch hẹn" : "Chưa có lịch hẹn"}
            text={filterDate ? "Không có lịch hẹn trong ngày đang lọc." : historyOnly ? "Các lịch đã hoàn tất, bị từ chối, hủy hoặc vắng mặt sẽ hiển thị tại đây." : "Bạn có thể đặt lịch mới tại màn Đặt lịch."}
          />
        </div>
      )}
    </section>
  );
}
