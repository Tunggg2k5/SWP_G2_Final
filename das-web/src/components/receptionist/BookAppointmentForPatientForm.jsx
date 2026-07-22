import { CalendarPlus } from "lucide-react";
import { todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

export default function BookAppointmentForPatientForm({
  booking,
  date,
  genderOptions,
  newPatient,
  onBookingChange,
  onDateChange,
  onNewPatientChange,
  onSubmit,
  patientSearch,
  selectablePatients,
  services,
  setPatientSearch,
  slotOptions
}) {
  const hasSelectedPatient = Boolean(booking.patientId);

  return (
    <section className="panel receptionist-booking-panel">
      <div className="section-title receptionist-booking-title">
        <CalendarPlus size={20} />
        <div>
          <h2>Đặt lịch hộ bệnh nhân</h2>
          <p>Kiểm tra số điện thoại trước. Nếu chưa có tài khoản, hệ thống sẽ tạo tài khoản bệnh nhân khi đặt lịch.</p>
        </div>
      </div>

      <form className="stack receptionist-booking-form" onSubmit={onSubmit}>
        <div className="form-grid reception-patient-grid">
          <label className="field">
            <span>Kiểm tra tên hoặc số điện thoại</span>
            <input
              value={patientSearch}
              onChange={(event) => {
                setPatientSearch(event.target.value);
                onBookingChange({ patientId: "" });
              }}
              placeholder="Nhập tên hoặc số điện thoại"
            />
          </label>

          <label className="field">
            <span>Tài khoản bệnh nhân</span>
            <select value={booking.patientId} onChange={(event) => onBookingChange({ patientId: event.target.value })}>
              <option value="">Chưa có tài khoản, tạo tài khoản mới</option>
              {selectablePatients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName} - {patient.phone}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!hasSelectedPatient && (
          <div className="form-grid reception-patient-grid">
            <label className="field">
              <span>Họ tên</span>
              <input value={newPatient.fullName} onChange={(event) => onNewPatientChange({ fullName: event.target.value })} required />
            </label>
            <label className="field">
              <span>Số điện thoại</span>
              <input type="tel" value={newPatient.phone} onChange={(event) => onNewPatientChange({ phone: event.target.value })} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={newPatient.email || ""} onChange={(event) => onNewPatientChange({ email: event.target.value })} />
            </label>
            <label className="field">
              <span>Giới tính</span>
              <select value={newPatient.gender} onChange={(event) => onNewPatientChange({ gender: event.target.value })} required>
                {genderOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="form-grid reception-booking-details">
          <label className="field">
            <span>Dịch vụ</span>
            <select value={booking.serviceId} onChange={(event) => onBookingChange({ serviceId: event.target.value })} required>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Ngày</span>
            <input
              type="date"
              value={date}
              min={todayInput()}
              max={maxBookingDate()}
              onChange={(event) => onDateChange(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Khung giờ khám</span>
            <select value={booking.time} onChange={(event) => onBookingChange({ time: event.target.value })} required>
              {slotOptions.length ? (
                slotOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="">Chưa có khung giờ đang mở</option>
              )}
            </select>
          </label>
          <label className="field reception-booking-note">
            <span>Ghi chú</span>
            <input value={booking.note} onChange={(event) => onBookingChange({ note: event.target.value })} maxLength={1000} />
          </label>
        </div>

        <button className="button primary booking-submit-final" disabled={!slotOptions.length}>Đặt lịch hộ</button>
      </form>
    </section>
  );
}
