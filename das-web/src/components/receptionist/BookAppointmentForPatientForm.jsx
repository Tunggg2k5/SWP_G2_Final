import { CalendarPlus, Search } from "lucide-react";
import { todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

export default function BookAppointmentForPatientForm({
  booking,
  checkedPatient,
  date,
  genderOptions,
  newPatient,
  onBookingChange,
  onCheckPatient,
  onDateChange,
  onNewPatientChange,
  onPatientSearchChange,
  onSubmit,
  patientLookupStatus,
  patientSearch,
  services,
  slotOptions
}) {
  const hasAccount = patientLookupStatus === "found" && checkedPatient;
  const needsNewAccount = patientLookupStatus === "not_found";
  const canShowPatientInfo = hasAccount || needsNewAccount;

  return (
    <section className="panel receptionist-booking-panel">
      <div className="section-title receptionist-booking-title">
        <CalendarPlus size={20} />
        <div>
          <h2>Đặt lịch hộ bệnh nhân</h2>
          <p>Nhập số điện thoại và kiểm tra tài khoản trước khi đặt lịch.</p>
        </div>
      </div>

      <form className="stack receptionist-booking-form" onSubmit={onSubmit}>
        <div className="reception-phone-check">
          <label className="field">
            <span>Số điện thoại</span>
            <div className="input-with-icon">
              <Search size={17} />
              <input
                type="tel"
                value={patientSearch}
                onChange={(event) => onPatientSearchChange(event.target.value)}
                placeholder="Nhập số điện thoại bệnh nhân"
              />
            </div>
          </label>
          <button className="button secondary" type="button" onClick={onCheckPatient}>
            Kiểm tra tài khoản
          </button>
        </div>

        {canShowPatientInfo ? (
          <div className="form-grid reception-patient-grid">
            <label className="field">
              <span>Họ tên</span>
              <input
                value={hasAccount ? checkedPatient.fullName || "" : newPatient.fullName}
                onChange={(event) => onNewPatientChange({ fullName: event.target.value })}
                readOnly={hasAccount}
                required
              />
            </label>
            <label className="field">
              <span>Số điện thoại</span>
              <input
                type="tel"
                value={hasAccount ? checkedPatient.phone || "" : newPatient.phone}
                readOnly
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={hasAccount ? checkedPatient.email || "" : newPatient.email || ""}
                onChange={(event) => onNewPatientChange({ email: event.target.value })}
                readOnly={hasAccount}
              />
            </label>
            <label className="field">
              <span>Giới tính</span>
              <select
                value={hasAccount ? checkedPatient.gender || "unknown" : newPatient.gender}
                onChange={(event) => onNewPatientChange({ gender: event.target.value })}
                disabled={hasAccount}
                required
              >
                {genderOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="empty-state compact">
            <strong>Chưa kiểm tra tài khoản</strong>
            <span>Nhập số điện thoại rồi bấm kiểm tra tài khoản để tiếp tục đặt lịch.</span>
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
