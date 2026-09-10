import { useState } from "react";
import StatusBadge from "../StatusBadge.jsx";
import { clinicDateInput, filterOpenSlotsForDate, formatDateTime, formatSlotWithDate, getAppointmentSlot, todayInput } from "../../utils/format.js";
import RescheduleAppointmentModal from "./RescheduleAppointmentModal.jsx";
import { Calendar, Clock, User, FileText } from "lucide-react";

const cancelReasons = [
  "Bận việc cá nhân",
  "Muốn đổi sang thời gian khác",
  "Đã hết triệu chứng",
  "Đặt nhầm lịch",
  "Lý do khác"
];

const arrangedStatuses = new Set(["scheduled", "confirmed", "checked_in", "in_treatment", "completed"]);

export default function PatientAppointmentCard({
  appointment,
  canModifyAppointment,
  cancelAppointment,
  dentistOptions,
  rescheduleAppointment,
  rescheduleForm,
  slotClosures = [],
  slotOptions = [],
  updateRescheduleForm
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [customCancelReason, setCustomCancelReason] = useState("");
  const canModify = canModifyAppointment(appointment);
  const currentRescheduleForm = rescheduleForm || {
    date: clinicDateInput(appointment.startAt) || todayInput(),
    time: "",
    dentistId: appointment.dentist?._id || dentistOptions[0]?._id || ""
  };
  const currentSlotOptions = filterOpenSlotsForDate(slotOptions, slotClosures, currentRescheduleForm.date);
  const effectiveRescheduleForm = {
    ...currentRescheduleForm,
    time: currentRescheduleForm.time || getAppointmentSlot(appointment.startAt, currentSlotOptions)?.value || currentSlotOptions[0]?.value || ""
  };
  const isArranged = arrangedStatuses.has(appointment.status);
  const scheduleText = isArranged
    ? `Giờ đến: ${formatDateTime(appointment.checkedInAt || appointment.startAt)}`
    : `Khung giờ đã đặt: ${formatSlotWithDate(appointment.startAt, appointment.slot?.startTime ? appointment.slot : slotOptions)}`;

  function openRescheduleForm() {
    updateRescheduleForm(appointment, {});
    setCancelOpen(false);
    setRescheduleOpen(true);
  }

  async function submitReschedule() {
    const success = await rescheduleAppointment(appointment);
    if (success) setRescheduleOpen(false);
  }

  async function submitCancel() {
    const reason = cancelReason === "Lý do khác" ? customCancelReason : cancelReason;
    await cancelAppointment(appointment, reason);
    setCancelOpen(false);
  }

  return (
    <article className="card-base card-hover p-5 space-y-4" key={appointment._id}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-bold text-lg text-slate-900">{appointment.service?.name}</h4>
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mt-1">
            {isArranged ? <Clock size={16} /> : <Calendar size={16} />}
            <span>{scheduleText}</span>
          </div>
        </div>
        <StatusBadge value={appointment.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-lg">
        <div className="flex gap-2">
          <User size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">Bác sĩ phụ trách</span>
            <span className="font-medium text-slate-800">{appointment.dentist?.fullName || "Lễ tân sắp xếp"}</span>
          </div>
        </div>

        {appointment.patientNote && (
          <div className="flex gap-2">
            <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">Ghi chú của bạn</span>
              <span className="font-medium text-slate-800">{appointment.patientNote}</span>
            </div>
          </div>
        )}

        {appointment.status === "cancelled" && appointment.cancellationReason && (
          <div className="flex gap-2 sm:col-span-2">
            <FileText size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-rose-500 text-xs font-medium">Lý do hủy</span>
              <span className="text-slate-800">{appointment.cancellationReason}</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex flex-col items-end">
        {canModify ? (
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              onClick={() => {
                setCancelOpen((value) => !value);
                setRescheduleOpen(false);
              }}
            >
              Hủy lịch
            </button>
            {!rescheduleOpen && (
              <button className="btn-gradient px-4 py-2 text-sm" type="button" onClick={openRescheduleForm}>
                Đổi lịch
              </button>
            )}

            {cancelOpen && (
              <div className="w-full mt-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100 space-y-3 animate-fade-in-up">
                <h5 className="font-semibold text-rose-900 text-sm">Xác nhận hủy lịch</h5>
                <select className="input-base bg-white w-full" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}>
                  {cancelReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                {cancelReason === "Lý do khác" && (
                  <input
                    className="input-base bg-white w-full"
                    value={customCancelReason}
                    onChange={(event) => setCustomCancelReason(event.target.value)}
                    placeholder="Nhập lý do hủy"
                    maxLength={1000}
                  />
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" type="button" onClick={() => setCancelOpen(false)}>
                    Đóng
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 shadow-sm rounded-lg transition-colors" type="button" onClick={submitCancel}>
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-full">Lịch này không thể thay đổi thêm.</span>
        )}
      </div>

      {rescheduleOpen && (
        <RescheduleAppointmentModal
          dentistOptions={dentistOptions}
          form={effectiveRescheduleForm}
          onCancel={() => setRescheduleOpen(false)}
          onChange={(next) => updateRescheduleForm(appointment, next)}
          onSubmit={submitReschedule}
          slotOptions={currentSlotOptions}
        />
      )}
    </article>
  );
}
