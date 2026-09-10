import { Modal, Select, Radio, DatePicker } from "antd";
import dayjs from "dayjs";
import { todayInput } from "../../utils/format.js";
import { maxBookingDate } from "../../pages/BookingPage.jsx";

export default function RescheduleAppointmentModal({
  dentistOptions,
  form,
  onCancel,
  onChange,
  onSubmit,
  slotOptions
}) {
  return (
    <Modal
      title="Đổi lịch khám"
      open={true}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Xác nhận đổi"
      cancelText="Đóng"
      okButtonProps={{ disabled: !slotOptions.length }}
    >
      <div className="space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Ngày khám mới</span>
          <DatePicker
            value={form.date ? dayjs(form.date) : null}
            onChange={(date, dateString) => onChange({ date: dateString })}
            disabledDate={(current) => {
              return current && (current < dayjs(todayInput()) || current > dayjs(maxBookingDate()));
            }}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Bác sĩ</span>
          <Select
            value={form.dentistId}
            onChange={(value) => onChange({ dentistId: value })}
            options={[
              { value: "reception", label: "Lễ tân sắp xếp" },
              ...dentistOptions.map((dentist) => ({ value: dentist._id, label: dentist.fullName }))
            ]}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Khung giờ</span>
          <div className="mt-1">
            {slotOptions.length ? (
              <Radio.Group 
                value={form.time} 
                onChange={(e) => onChange({ time: e.target.value })}
                className="grid grid-cols-3 gap-2"
              >
                {slotOptions.map((option) => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    className="text-center rounded-lg"
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              <div className="text-center py-3 text-sm text-slate-500 bg-slate-50 rounded-lg">
                Chưa có khung giờ đang mở
              </div>
            )}
          </div>
        </label>
      </div>
    </Modal>
  );
}
