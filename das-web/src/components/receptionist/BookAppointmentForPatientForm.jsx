import { Select, Input, Button, Card, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { CalendarPlus } from "lucide-react";
import dayjs from "dayjs";
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
    <Card className="max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
          <CalendarPlus size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Đặt lịch hộ bệnh nhân</h2>
          <p className="text-sm text-slate-500">Nhập số điện thoại và kiểm tra tài khoản trước khi đặt lịch.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
            <Input
              type="tel"
              prefix={<SearchOutlined className="text-slate-400" />}
              value={patientSearch}
              onChange={(event) => onPatientSearchChange(event.target.value)}
              placeholder="Nhập số điện thoại bệnh nhân"
              size="large"
            />
          </div>
          <Button
            type="primary"
            size="large"
            onClick={onCheckPatient}
            className="bg-primary-600 hover:bg-primary-500"
          >
            Kiểm tra tài khoản
          </Button>
        </div>

        {canShowPatientInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Họ tên</span>
              <Input
                value={hasAccount ? checkedPatient.fullName || "" : newPatient.fullName}
                onChange={(event) => onNewPatientChange({ fullName: event.target.value })}
                readOnly={hasAccount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
              <Input
                type="tel"
                value={hasAccount ? checkedPatient.phone || "" : newPatient.phone}
                readOnly
                required
                className="bg-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input
                type="email"
                value={hasAccount ? checkedPatient.email || "" : newPatient.email || ""}
                onChange={(event) => onNewPatientChange({ email: event.target.value })}
                readOnly={hasAccount}
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Giới tính</span>
              <Select
                value={hasAccount ? checkedPatient.gender || "unknown" : newPatient.gender}
                onChange={(val) => onNewPatientChange({ gender: val })}
                disabled={hasAccount}
                options={genderOptions}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Dịch vụ</span>
            <Select
              value={booking.serviceId}
              onChange={(val) => onBookingChange({ serviceId: val })}
              options={services.map(s => ({ value: s._id, label: s.name }))}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Ngày</span>
            <DatePicker
              value={date ? dayjs(date) : null}
              onChange={(d, ds) => onDateChange(ds)}
              format="YYYY-MM-DD"
              minDate={dayjs(todayInput())}
              maxDate={dayjs(maxBookingDate())}
              className="w-full"
              allowClear={false}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Khung giờ khám</span>
            <Select
              value={booking.time}
              onChange={(val) => onBookingChange({ time: val })}
              options={slotOptions.length ? slotOptions : [{ value: "", label: "Chưa có khung giờ đang mở" }]}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Ghi chú</span>
            <Input
              value={booking.note}
              onChange={(event) => onBookingChange({ note: event.target.value })}
              maxLength={1000}
            />
          </div>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full mt-4 bg-primary-600 hover:bg-primary-500"
          disabled={!slotOptions.length}
        >
          Đặt lịch hộ
        </Button>
      </form>
    </Card>
  );
}
