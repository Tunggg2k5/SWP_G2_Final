import { CalendarDays, DoorOpen } from "lucide-react";
import { useState } from "react";
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
    <section className="panel reception-schedule-panel">
      <div className="section-title">
        <CalendarDays size={20} />
        <h2>Lịch khám theo thứ tự có mặt</h2>
      </div>

      <div className="reception-room-status-grid">
        {rooms.map((room) => (
          <article className="reception-room-status-card" key={room._id}>
            <DoorOpen size={20} />
            <div>
              <strong>{room.name}</strong>
              <span>{room.assignedDentist?.fullName || "Chưa có bác sĩ phụ trách"}</span>
            </div>
            <StatusBadge value={room.status} />
          </article>
        ))}
      </div>

      <div className="toolbar-row">
        <label className="field inline-field">
          <span>Ngày</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="mini-list slot-toggle-list">
        {allSlotOptions.map((slot) => (
          <div className="mini-row slot-toggle-row" key={slot._id || slot.slotId}>
            <span>{slot.label}</span>
            <div className="row-actions">
              <StatusBadge value={slot.isClosed ? "closed" : "active"} />
              <button className="button small secondary" type="button" onClick={() => onToggleSlot?.(slot)}>
                {slot.isClosed ? "Mở giờ" : "Đóng giờ"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <EmptyState title="Đang tải lịch khám" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : dentistColumns.length ? (
        <div className="reception-slot-board">
          <div
            className="reception-slot-grid reception-slot-grid-head"
            style={{ gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(270px, 1fr))` }}
          >
            <div className="reception-slot-corner">Khung giờ</div>
            {dentistColumns.map((dentist) => (
              <div className="reception-dentist-head" key={dentist._id}>
                <strong>{dentist.fullName}</strong>
                <span>{dentist.roomName || "Chưa gán phòng"}</span>
              </div>
            ))}
          </div>

          {queueSlots.map(({ slot, dentistQueues }) => (
            <div
              className="reception-slot-grid reception-slot-grid-row"
              style={{ gridTemplateColumns: `130px repeat(${dentistColumns.length}, minmax(270px, 1fr))` }}
              key={slot.slotId}
            >
              <div className="reception-slot-label">
                <strong>{slot.slotName}</strong>
                <span>{slot.timeLabel}</span>
              </div>
              {dentistQueues.map(({ dentist, appointments }) => (
                <div className="reception-dentist-queue" key={`${slot.slotId}-${dentist._id}`}>
                  {appointments.length ? (
                    appointments.map((appointment) => {
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
                        <article className={`schedule-cell-card ${locked ? "locked" : ""}`} key={appointment._id}>
                          <div>
                            <div className="schedule-card-heading">
                              {queueNumber && <span className="queue-number-badge">STT {queueNumber}</span>}
                              <strong>{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
                            </div>
                            <span>{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng"}</span>
                            <span>Giờ khám: {formatTime(appointment.startAt)}</span>
                            {appointment.checkedInAt && <span>Có mặt: {formatTime(appointment.checkedInAt)}</span>}
                            <StatusBadge value={appointment.status} />
                            {locked && <small>Lịch đã hủy hoặc bị từ chối, không thể đổi trạng thái.</small>}
                            {isFutureAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                              <small>Chỉ ghi nhận có mặt trong ngày diễn ra lịch khám.</small>
                            )}
                            {isPastAppointment && ["scheduled", "confirmed"].includes(appointment.status) && (
                              <small>Lịch khám đã qua ngày nên không thể cập nhật có mặt hoặc vắng mặt.</small>
                            )}
                          </div>

                          <div className="row-actions schedule-status-actions">
                            {canEditSchedule && (
                              <button
                                className="button small secondary"
                                type="button"
                                onClick={() => setEditingAppointmentId(isEditingSchedule ? "" : appointment._id)}
                              >
                                {isEditingSchedule ? "Đóng đổi lịch" : "Đổi lịch"}
                              </button>
                            )}
                            <button
                              className="button small"
                              disabled={!canCheckIn}
                              onClick={() => onCheckInAppointment(appointment)}
                              type="button"
                            >
                              Có mặt
                            </button>
                            <button
                              className="button small danger"
                              disabled={!canMarkNoShow}
                              onClick={() => onMarkNoShow(appointment)}
                              type="button"
                            >
                              Vắng mặt
                            </button>
                          </div>

                          {canEditSchedule && isEditingSchedule && (
                            <div className="clinical-edit-panel">
                              <div className="clinical-edit-grid">
                                <label className="field">
                                  <span>Ngày khám</span>
                                  <input
                                    type="date"
                                    min={todayInput()}
                                    max={maxBookingDate()}
                                    value={manualForm.date}
                                    onChange={(event) => {
                                      const nextDate = event.target.value;
                                      const nextSlotOptions = filterOpenSlotsForDate(slots, slotClosures, nextDate);
                                      const nextSlot = nextSlotOptions[0];
                                      updateManualSchedule?.(appointment, {
                                        date: nextDate,
                                        time: nextSlot?.value || "",
                                        arrivalTime: nextSlot?.value || ""
                                      });
                                    }}
                                  />
                                </label>
                                <label className="field">
                                  <span>Dịch vụ</span>
                                  <select
                                    aria-label="Dịch vụ"
                                    value={manualForm.serviceId}
                                    onChange={(event) => updateManualSchedule?.(appointment, { serviceId: event.target.value })}
                                  >
                                    {services.map((service) => (
                                      <option value={service._id} key={service._id}>
                                        {service.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="field">
                                  <span>Slot</span>
                                  <select
                                    value={manualTime}
                                    onChange={(event) => {
                                      const nextSlot = rowSlotOptions.find((slotOption) => slotOption.value === event.target.value);
                                      updateManualSchedule?.(appointment, {
                                        time: event.target.value,
                                        arrivalTime: nextSlot?.value || ""
                                      });
                                    }}
                                  >
                                    {rowSlotOptions.length ? (
                                      rowSlotOptions.map((slotOption) => (
                                        <option value={slotOption.value} key={slotOption.value}>
                                          {slotOption.label}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="">Chưa có khung giờ đang mở</option>
                                    )}
                                  </select>
                                </label>
                                <label className="field">
                                  <span>Giờ đến</span>
                                  <input
                                    aria-label="Giờ đến"
                                    type="time"
                                    step="60"
                                    min={selectedSlot?.value || ""}
                                    max={selectedSlot?.endTime ? previousMinuteTime(selectedSlot.endTime) : ""}
                                    value={arrivalTime}
                                    onChange={(event) => updateManualSchedule?.(appointment, { arrivalTime: event.target.value })}
                                    disabled={!selectedSlot}
                                  />
                                </label>
                                <label className="field wide">
                                  <span>Bác sĩ</span>
                                  <select
                                    aria-label="Bác sĩ"
                                    value={manualForm.roomId}
                                    onChange={(event) => updateManualSchedule?.(appointment, { roomId: event.target.value })}
                                  >
                                    {rooms.filter((room) => room.assignedDentist?._id).map((room) => (
                                      <option value={room._id} key={room._id}>
                                        {room.assignedDentist.fullName}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              <button
                                className="button small primary"
                                type="button"
                                onClick={() => {
                                  scheduleReceptionAppointment?.(appointment);
                                  setEditingAppointmentId("");
                                }}
                              >
                                Cập nhật lịch
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <span className="schedule-empty-cell">Chưa có bệnh nhân</span>
                  )}
                </div>
              ))}
            </div>
          ))}
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
