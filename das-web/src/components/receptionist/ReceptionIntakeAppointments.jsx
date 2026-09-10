import { ClipboardList } from "lucide-react";
import { Button, Select, DatePicker, List, Card, Popconfirm } from "antd";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatDateTime, formatSlotWithDate, getAppointmentSlot, todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";
import ReceptionAppointmentFilters from "./ReceptionAppointmentFilters.jsx";
import dayjs from "dayjs";

export default function ReceptionIntakeAppointments({
  appointmentSearch,
  appointments,
  date,
  loading,
  onRejectAppointment,
  manualSchedules,
  rooms,
  scheduleReceptionAppointment,
  setAppointmentSearch,
  setDate,
  slots = [],
  slotClosures = [],
  slotOptions,
  updateManualSchedule
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-slate-800">Lịch hẹn chờ xác nhận</h2>
      </div>

      <ReceptionAppointmentFilters
        date={date}
        setDate={setDate}
        appointmentSearch={appointmentSearch}
        setAppointmentSearch={setAppointmentSearch}
        showDate
      />

      <List
        loading={loading}
        dataSource={appointments}
        locale={{ emptyText: <EmptyState title="Không có lịch hẹn" text="Lịch hẹn mới sẽ xuất hiện tại đây khi có dữ liệu trong hệ thống." /> }}
        renderItem={(appointment) => {
          const appointmentDate = clinicDateInput(appointment.startAt);
          const defaultDate = appointmentDate && appointmentDate >= todayInput() ? appointmentDate : todayInput();
          const manualForm = manualSchedules[appointment._id] || {
            date: defaultDate,
            time: appointment.startAt ? getAppointmentSlot(appointment.startAt, slotOptions).value : slotOptions[0]?.value || "",
            roomId: appointment.room?._id || rooms[0]?._id || ""
          };
          const rowSlotOptions = filterOpenSlotsForDate(slots, slotClosures, manualForm.date);
          const manualTime = rowSlotOptions.some((slot) => slot.value === manualForm.time) ? manualForm.time : rowSlotOptions[0]?.value || "";
          const selectedSlot = rowSlotOptions.find((slot) => slot.value === manualTime) || rowSlotOptions[0];
          const arrivalTime = isArrivalTimeInsideSlot(manualForm.arrivalTime, selectedSlot)
            ? manualForm.arrivalTime
            : selectedSlot?.value || "";

          return (
            <List.Item className="!p-0 !border-0 mb-4 block">
              <Card className="w-full shadow-sm" styles={{ body: { padding: '20px' } }}>
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between sm:justify-start sm:gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800">{appointment.patient?.fullName || "Bệnh nhân"}</h4>
                        <p className="text-slate-600 text-sm">{appointment.patient?.phone || "Chưa có SĐT"}</p>
                      </div>
                      <StatusBadge value={appointment.status} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="text-slate-800 col-span-full">{appointment.service?.name || "Dịch vụ nha khoa"}</strong>
                      <span>Khung giờ khách chọn: {formatSlotWithDate(appointment.startAt, appointment.slot?.startTime ? appointment.slot : slotOptions)}</span>
                      <span>Khách gửi lúc: {formatDateTime(appointment.createdAt)}</span>
                      <span>Bác sĩ: {appointment.dentist?.fullName || "Lễ tân sắp xếp"}</span>
                      <span>Kênh: {appointment.channel === "online" ? "Online" : "Tại quầy"}</span>
                    </div>
                    {appointment.patientNote && <span className="text-sm text-amber-600 block bg-amber-50 p-2 rounded">Ghi chú: {appointment.patientNote}</span>}
                  </div>

                  <div className="w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                      <DatePicker
                        value={manualForm.date ? dayjs(manualForm.date) : null}
                        onChange={(d, dateString) => {
                          const nextDate = dateString;
                          const nextSlotOptions = filterOpenSlotsForDate(slots, slotClosures, nextDate);
                          const nextSlot = nextSlotOptions[0];
                          updateManualSchedule(appointment, {
                            date: nextDate,
                            time: nextSlot?.value || "",
                            arrivalTime: nextSlot?.value || ""
                          });
                        }}
                        format="YYYY-MM-DD"
                        minDate={dayjs(todayInput())}
                        maxDate={dayjs(maxBookingDate())}
                        allowClear={false}
                        className="w-full"
                      />
                      <Select
                        value={manualTime}
                        onChange={(val) => {
                          const nextSlot = rowSlotOptions.find((slot) => slot.value === val);
                          updateManualSchedule(appointment, {
                            time: val,
                            arrivalTime: nextSlot?.value || ""
                          });
                        }}
                        className="w-full"
                        options={rowSlotOptions.length ? rowSlotOptions.map(s => ({ value: s.value, label: s.label })) : [{ value: "", label: "Đã đóng" }]}
                      />
                      <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                        <span className="text-xs text-slate-500 whitespace-nowrap">Giờ đến:</span>
                        <input
                          type="time"
                          step="60"
                          min={selectedSlot?.value || ""}
                          max={selectedSlot?.endTime ? previousMinuteTime(selectedSlot.endTime) : ""}
                          value={arrivalTime}
                          className="input-base px-2 py-1 text-sm w-full"
                          onChange={(event) => updateManualSchedule(appointment, { arrivalTime: event.target.value })}
                          disabled={!selectedSlot}
                          title={selectedSlot ? `Chọn từ ${selectedSlot.value} đến trước ${selectedSlot.endTime}` : "Chọn khung giờ trước"}
                        />
                      </div>
                      <Select
                        value={manualForm.roomId}
                        onChange={(val) => updateManualSchedule(appointment, { roomId: val })}
                        className="w-full col-span-2 sm:col-span-1"
                        options={rooms.filter(r => r.assignedDentist?._id).map(r => ({ value: r._id, label: r.assignedDentist.fullName }))}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <Popconfirm
                        title="Xác nhận từ chối lịch hẹn này?"
                        onConfirm={() => onRejectAppointment(appointment)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                      >
                        <Button danger className="flex-1">
                          Từ chối
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="Xác nhận lịch khám?"
                        onConfirm={() => scheduleReceptionAppointment(appointment)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                      >
                        <Button type="primary" className="flex-1 bg-primary-600 hover:bg-primary-500">
                          Xác nhận
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </section>
  );
}

function isArrivalTimeInsideSlot(arrivalTime, slot) {
  if (!arrivalTime || !slot?.value || !slot?.endTime) return false;
  return arrivalTime >= slot.value && arrivalTime < slot.endTime;
}

function previousMinuteTime(value) {
  const [hour, minute] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "";
  const total = Math.max(hour * 60 + minute - 1, 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
