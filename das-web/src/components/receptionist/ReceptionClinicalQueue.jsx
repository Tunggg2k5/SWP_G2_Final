import { CalendarDays, DoorOpen } from "lucide-react";
import { useState } from "react";
import { Card, Button, DatePicker, Select, Popconfirm, Tag } from "antd";
import dayjs from "dayjs";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatTime, getAppointmentSlot, todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

export default function ReceptionClinicalQueue({
  allSlotOptions = [],
  date,
  dentistColumns,
  isLockedScheduleAppointment,
  loading,
  manualSchedules = {},
  onCheckInAppointment,
  onMarkNoShow,
  onToggleSlot,
  queueSlots,
  rooms,
  scheduleReceptionAppointment,
  services,
  setDate,
  slots = [],
  slotClosures = [],
  updateManualSchedule
}) {
  const [editingAppointmentId, setEditingAppointmentId] = useState("");

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-slate-800">Lịch khám theo thứ tự có mặt</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card key={room._id} className="shadow-sm" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-start gap-3">
              <DoorOpen size={24} className="text-primary-500 shrink-0 mt-1" />
              <div className="flex-1">
                <strong className="block text-slate-800">{room.name}</strong>
                <span className="text-sm text-slate-500 block mb-2">{room.assignedDentist?.fullName || "Chưa có bác sĩ phụ trách"}</span>
                <StatusBadge value={room.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Ngày</span>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(d, dateString) => setDate(dateString)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allSlotOptions.map((slot) => (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm" key={slot._id || slot.slotId}>
            <span className="text-sm font-medium text-slate-700">{slot.label}</span>
            <StatusBadge value={slot.isClosed ? "closed" : "active"} />
            <Popconfirm
              title={slot.isClosed ? `Mở lại ${slot.label} trong ngày ${date}?` : `Đóng ${slot.label} trong ngày ${date}?`}
              onConfirm={() => onToggleSlot?.(slot)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button size="small" type={slot.isClosed ? "default" : "dashed"} danger={!slot.isClosed} className={slot.isClosed ? "text-emerald-600 border-emerald-300 bg-emerald-50 hover:bg-emerald-100" : ""}>
                {slot.isClosed ? "Mở giờ" : "Đóng giờ"}
              </Button>
            </Popconfirm>
          </div>
        ))}
      </div>

      {loading ? (
        <EmptyState title="Đang tải lịch khám" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : dentistColumns.length ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div
              className="grid border-b border-slate-200 bg-slate-50"
              style={{ gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(300px, 1fr))` }}
            >
              <div className="p-4 font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center">Khung giờ</div>
              {dentistColumns.map((dentist) => (
                <div className="p-4 text-center border-r border-slate-200 last:border-0" key={dentist._id}>
                  <strong className="block text-slate-800">{dentist.fullName}</strong>
                  <span className="text-sm text-slate-500">{dentist.roomName || "Chưa gán phòng"}</span>
                </div>
              ))}
            </div>

            {queueSlots.map(({ slot, dentistQueues }) => (
              <div
                className="grid border-b border-slate-200 last:border-0"
                style={{ gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(300px, 1fr))` }}
                key={slot.slotId}
              >
                <div className="p-4 border-r border-slate-200 flex flex-col items-center justify-center bg-slate-50/50">
                  <strong className="text-primary-700 bg-primary-50 px-3 py-1 rounded-lg block text-center mb-1">{slot.slotName}</strong>
                  <span className="text-xs text-slate-500">{slot.timeLabel}</span>
                </div>
                {dentistQueues.map(({ dentist, appointments }) => (
                  <div className="p-3 border-r border-slate-200 last:border-0 bg-slate-50/30" key={`${slot.slotId}-${dentist._id}`}>
                    {appointments.length ? (
                      <div className="space-y-3">
                        {appointments.map((appointment) => {
                          const locked = isLockedScheduleAppointment(appointment);
                          const appointmentDate = clinicDateInput(appointment.startAt);
                          const today = todayInput();
                          const isTodayAppointment = appointmentDate === today;
                          const isFutureAppointment = appointmentDate > today;
                          const isPastAppointment = appointmentDate < today;
                          const canCheckIn = !locked && isTodayAppointment && ["scheduled", "confirmed"].includes(appointment.status);
                          const canMarkNoShow = !locked && isTodayAppointment && ["scheduled", "confirmed"].includes(appointment.status);
                          const canEditSchedule = appointment.status === "scheduled";
                          const isEditingSchedule = editingAppointmentId === appointment._id;
                          const queueNumber = appointment.queueNumber;
                          const manualForm = manualSchedules[appointment._id] || defaultManualSchedule(appointment, rooms, services, slots, slotClosures);
                          const rowSlotOptions = filterOpenSlotsForDate(slots, slotClosures, manualForm.date);
                          const manualTime = rowSlotOptions.some((slotOption) => slotOption.value === manualForm.time) ? manualForm.time : rowSlotOptions[0]?.value || "";
                          const selectedSlot = rowSlotOptions.find((slotOption) => slotOption.value === manualTime) || rowSlotOptions[0];
                          const arrivalTime = isArrivalTimeInsideSlot(manualForm.arrivalTime, selectedSlot) ? manualForm.arrivalTime : selectedSlot?.value || "";

                          return (
                            <Card className={`shadow-sm ${locked ? "opacity-60 bg-slate-50" : ""}`} styles={{ body: { padding: '12px' } }} key={appointment._id}>
                              <div className="mb-3">
                                <div className="flex items-start gap-2 mb-2">
                                  {queueNumber && <span className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">STT {queueNumber}</span>}
                                  <strong className="text-slate-800 text-sm">{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
                                </div>
                                <div className="text-xs text-slate-600 space-y-1 mb-2">
                                  <div>{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng"}</div>
                                  <div>Giờ khám: {formatTime(appointment.startAt)}</div>
                                  {appointment.checkedInAt && <div>Có mặt: {formatTime(appointment.checkedInAt)}</div>}
                                </div>
                                <StatusBadge value={appointment.status} />
                                {locked && <p className="text-xs text-rose-500 mt-2">Lịch đã hủy hoặc bị từ chối, không thể đổi trạng thái.</p>}
                                {isFutureAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                                  <p className="text-xs text-amber-600 mt-2">Chỉ ghi nhận có mặt trong ngày diễn ra lịch khám.</p>
                                )}
                                {isPastAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                                  <p className="text-xs text-rose-500 mt-2">Lịch khám đã qua ngày nên không thể cập nhật có mặt hoặc vắng mặt.</p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                {canEditSchedule && (
                                  <Button
                                    size="small"
                                    className="w-full"
                                    onClick={() => setEditingAppointmentId(isEditingSchedule ? "" : appointment._id)}
                                  >
                                    {isEditingSchedule ? "Đóng đổi lịch" : "Đổi lịch"}
                                  </Button>
                                )}
                                <div className="flex w-full gap-2">
                                  <Popconfirm
                                    title="Xác nhận bệnh nhân đã có mặt tại quầy?"
                                    onConfirm={() => onCheckInAppointment(appointment)}
                                    disabled={!canCheckIn}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                  >
                                    <Button size="small" type="primary" disabled={!canCheckIn} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                                      Có mặt
                                    </Button>
                                  </Popconfirm>
                                  <Popconfirm
                                    title="Xác nhận bệnh nhân vắng mặt trong lịch khám này?"
                                    onConfirm={() => onMarkNoShow(appointment)}
                                    disabled={!canMarkNoShow}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                  >
                                    <Button size="small" danger disabled={!canMarkNoShow} className="flex-1">
                                      Vắng mặt
                                    </Button>
                                  </Popconfirm>
                                </div>
                              </div>

                              {canEditSchedule && isEditingSchedule && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="space-y-1">
                                      <span className="text-xs font-medium text-slate-700">Ngày khám</span>
                                      <DatePicker
                                        value={manualForm.date ? dayjs(manualForm.date) : null}
                                        onChange={(d, dateString) => {
                                          const nextDate = dateString;
                                          const nextSlotOptions = filterOpenSlotsForDate(slots, slotClosures, nextDate);
                                          const nextSlot = nextSlotOptions[0];
                                          updateManualSchedule?.(appointment, {
                                            date: nextDate,
                                            time: nextSlot?.value || "",
                                            arrivalTime: nextSlot?.value || ""
                                          });
                                        }}
                                        format="YYYY-MM-DD"
                                        minDate={dayjs(todayInput())}
                                        maxDate={dayjs(maxBookingDate())}
                                        allowClear={false}
                                        className="w-full text-xs"
                                        size="small"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-xs font-medium text-slate-700">Dịch vụ</span>
                                      <Select
                                        value={manualForm.serviceId}
                                        onChange={(val) => updateManualSchedule?.(appointment, { serviceId: val })}
                                        className="w-full text-xs"
                                        size="small"
                                        options={services.map(s => ({ value: s._id, label: s.name }))}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="space-y-1 flex-1">
                                        <span className="text-xs font-medium text-slate-700">Slot</span>
                                        <Select
                                          value={manualTime}
                                          onChange={(val) => {
                                            const nextSlot = rowSlotOptions.find((slotOption) => slotOption.value === val);
                                            updateManualSchedule?.(appointment, {
                                              time: val,
                                              arrivalTime: nextSlot?.value || ""
                                            });
                                          }}
                                          className="w-full text-xs"
                                          size="small"
                                          options={rowSlotOptions.length ? rowSlotOptions.map(s => ({ value: s.value, label: s.label })) : [{ value: "", label: "Đã đóng" }]}
                                        />
                                      </div>
                                      <div className="space-y-1 flex-1">
                                        <span className="text-xs font-medium text-slate-700">Giờ đến</span>
                                        <input
                                          type="time"
                                          step="60"
                                          min={selectedSlot?.value || ""}
                                          max={selectedSlot?.endTime ? previousMinuteTime(selectedSlot.endTime) : ""}
                                          value={arrivalTime}
                                          className="input-base px-2 py-0 text-xs w-full h-[24px]"
                                          onChange={(event) => updateManualSchedule?.(appointment, { arrivalTime: event.target.value })}
                                          disabled={!selectedSlot}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-xs font-medium text-slate-700">Bác sĩ</span>
                                      <Select
                                        value={manualForm.roomId}
                                        onChange={(val) => updateManualSchedule?.(appointment, { roomId: val })}
                                        className="w-full text-xs"
                                        size="small"
                                        options={rooms.filter(r => r.assignedDentist?._id).map(r => ({ value: r._id, label: r.assignedDentist.fullName }))}
                                      />
                                    </div>
                                  </div>
                                  <Popconfirm
                                    title="Xác nhận đổi lịch?"
                                    onConfirm={() => {
                                      scheduleReceptionAppointment?.(appointment);
                                      setEditingAppointmentId("");
                                    }}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                  >
                                    <Button type="primary" size="small" className="w-full mt-2 bg-primary-600 hover:bg-primary-500">
                                      Cập nhật lịch
                                    </Button>
                                  </Popconfirm>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full min-h-[60px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                        <span className="text-sm text-slate-400">Trống</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="Chưa có bác sĩ trong hàng đợi" text="Bảng này sẽ hiển thị khi có bác sĩ hoặc phòng khám được gán trong dữ liệu hệ thống." />
      )}
    </section>
  );
}

function defaultManualSchedule(appointment, rooms, services, slots = [], slotClosures = []) {
  const startAt = appointment.startAt ? new Date(appointment.startAt) : new Date();
  const appointmentDate = Number.isNaN(startAt.getTime()) ? "" : clinicDateInput(startAt);
  const date = appointmentDate && appointmentDate >= todayInput() ? appointmentDate : todayInput();
  const slotOptions = filterOpenSlotsForDate(slots, slotClosures, date);
  const currentSlotValue = Number.isNaN(startAt.getTime()) ? "" : getAppointmentSlot(startAt, slotOptions).value;
  const slot = slotOptions.find((option) => option.value === currentSlotValue) || slotOptions[0];

  return {
    date,
    serviceId: appointment.service?._id || services[0]?._id || "",
    time: Number.isNaN(startAt.getTime())
      ? slotOptions[0]?.value || ""
      : slotOptions.some((option) => option.value === currentSlotValue)
        ? currentSlotValue
        : slotOptions[0]?.value || currentSlotValue,
    arrivalTime: isArrivalTimeInsideSlot(currentSlotValue, slot) ? currentSlotValue : slot?.value || "",
    roomId: appointment.room?._id || rooms[0]?._id || ""
  };
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
