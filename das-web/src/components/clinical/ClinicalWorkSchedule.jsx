import { Stethoscope } from "lucide-react";
import EmptyState from "../EmptyState.jsx";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, formatDateTime, todayInput } from "../../utils/format.js";

export default function ClinicalWorkSchedule({
  appointments,
  canEditAppointment,
  clinicalColumns,
  clinicalQueues,
  date,
  isLockedAppointment,
  loading,
  onDateChange,
  onSelectTreatment,
  onSetRoomStatus,
  onUpdateStatus,
  rooms,
  user
}) {
  const visibleRooms = rooms || [];

  return (
    <section className="panel reception-schedule-panel clinical-schedule-panel">
      <div className="section-title">
        <Stethoscope size={20} />
        <h2>Lịch khám trong ngày</h2>
      </div>

      <div className="clinical-schedule-toolbar">
        <div className="clinical-room-strip">
          {visibleRooms.length ? (
            visibleRooms.map((room) => {
              const roomInUse = room.status === "in_use" || appointments.some(
                (appointment) => appointment.status === "in_treatment" && (appointment.room?._id || appointment.room) === room._id
              );

              return (
                <div className="room-chip clinical-room-status-chip" key={room._id}>
                  <span>{room.name} / {room.assignedDentist?.fullName || "Chưa gán bác sĩ"}</span>
                  <StatusBadge value={roomInUse ? "in_use" : room.status} />
                  {user?.role === "nurse" && (
                    <span className="room-chip-actions">
                      <button
                        className="button tiny secondary"
                        disabled={roomInUse}
                        title={roomInUse ? "Phòng đang có bệnh nhân đang khám nên không thể đổi trạng thái." : undefined}
                        type="button"
                        onClick={() => onSetRoomStatus(room._id, room.status === "available" ? "unavailable" : "available")}
                      >
                        {roomInUse ? "Đang dùng" : room.status === "available" ? "Chưa sẵn sàng" : "Sẵn sàng"}
                      </button>
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <span className="room-chip muted">Chưa có phòng được phân công</span>
          )}
        </div>

        <label className="field inline-field">
          <span>Ngày</span>
          <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
        </label>
      </div>

      {loading ? (
        <EmptyState title="Đang tải lịch khám" text="Hệ thống đang lấy dữ liệu mới nhất." />
      ) : appointments.length && clinicalColumns.length ? (
        <div
          className="clinical-queue-columns"
          style={{ gridTemplateColumns: `repeat(${clinicalQueues.length}, minmax(270px, 1fr))` }}
        >
          {clinicalQueues.map(({ column, appointments: columnAppointments }) => (
            <section className="clinical-queue-column" key={column._id}>
              <div className="clinical-queue-head">
                <strong>{column.fullName}</strong>
                <span>{column.roomName || "Đang trực"}</span>
              </div>

              <div className="clinical-queue-list">
                {columnAppointments.length ? (
                  columnAppointments.map((appointment) => {
                    const isTodayAppointment = clinicDateInput(appointment.startAt) === todayInput();
                    const canStartTreatment = isTodayAppointment && appointment.status === "checked_in";
                    const queueNumber = appointment.queueNumber ? String(appointment.queueNumber).padStart(3, "0") : "";

                    return (
                      <article className={`schedule-cell-card ${isLockedAppointment(appointment) ? "locked" : ""}`} key={appointment._id}>
                        <div>
                          <div className="schedule-card-heading">
                            {queueNumber && <span className="queue-number-badge">STT {queueNumber}</span>}
                            <strong>{[appointment.patient?.fullName || "Bệnh nhân", appointment.patient?.phone].filter(Boolean).join(" - ")}</strong>
                          </div>
                          <span>{appointment.service?.name || "Dịch vụ"} / {appointment.room?.name || "Phòng khám"}</span>
                          <small>Giờ khám: {formatDateTime(appointment.startAt)}</small>
                        </div>

                        <StatusBadge value={appointment.status} />

                        <div className="row-actions schedule-status-actions">
                          {canEditAppointment(user, appointment) && (
                            <>
                              {user?.role === "nurse" && appointment.status === "checked_in" && (
                                <button
                                  className="button small secondary"
                                  disabled={!canStartTreatment}
                                  title={!canStartTreatment ? "Chỉ chuyển sang đang khám trong ngày diễn ra lịch khám." : undefined}
                                  type="button"
                                  onClick={() => onUpdateStatus(appointment, "in_treatment")}
                                >
                                  Đang khám
                                </button>
                              )}
                              {user?.role === "nurse" && appointment.status === "in_treatment" && (
                                <button className="button small primary" type="button" onClick={() => onUpdateStatus(appointment, "completed")}>
                                  Hoàn tất
                                </button>
                              )}
                              <button className="button small" type="button" onClick={() => onSelectTreatment(appointment)}>
                                Hồ sơ điều trị
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="schedule-empty-cell">Chưa có bệnh nhân</div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có lịch khám" text="Lịch được ghi nhận có mặt hoặc xếp trong ngày sẽ hiển thị tại đây." />
      )}
    </section>
  );
}
