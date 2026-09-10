import { CalendarSearch, CalendarClock } from "lucide-react";
import { Select, DatePicker, Radio } from "antd";
import dayjs from "dayjs";

export default function AppointmentBookingForm({
  bootstrapLoading,
  date,
  dentistId,
  dentistOptions,
  embedded,
  maxDate,
  minDate,
  note,
  onChange,
  onSubmit,
  serviceId,
  services,
  slotOptions,
  submitting,
  time,
  user
}) {
  return (
    <section className="card-base p-6 md:p-8 w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary-500">
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
          <CalendarSearch size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Đặt lịch khám</h2>
          <p className="text-slate-500 mt-1">Miễn phí chụp phim, tư vấn và thăm khám khi đặt hẹn trước.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Họ và tên</span>
            <input className="input-base bg-slate-50 text-slate-600 cursor-not-allowed" value={user?.fullName || ""} disabled />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
            <input className="input-base bg-slate-50 text-slate-600 cursor-not-allowed" value={user?.phone || ""} disabled />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Dịch vụ quan tâm <span className="text-rose-500">*</span></span>
            <Select 
              value={serviceId} 
              onChange={(value) => onChange({ serviceId: value })} 
              disabled={bootstrapLoading}
              options={services.map(s => ({ value: s._id, label: s.name }))}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Bác sĩ</span>
            <Select 
              value={dentistId} 
              onChange={(value) => onChange({ dentistId: value })} 
              disabled={bootstrapLoading}
              options={[
                { value: "random", label: "Để nha khoa sắp xếp" },
                ...dentistOptions.map(d => ({ value: d._id, label: d.fullName }))
              ]}
            />
          </label>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
            <CalendarClock size={20} className="text-primary-500" />
            <h3>Thời gian khám</h3>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Ngày khám <span className="text-rose-500">*</span></span>
            <DatePicker 
              value={date ? dayjs(date) : null} 
              onChange={(d, ds) => onChange({ date: ds })}
              disabledDate={(current) => current && (current < dayjs(minDate) || current > dayjs(maxDate))}
              format="YYYY-MM-DD"
              allowClear={false}
              className="w-full"
            />
          </label>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-sm font-medium text-slate-700">Khung giờ <span className="text-rose-500">*</span></legend>
            <div className="mt-1">
              {slotOptions.length ? (
                <Radio.Group
                  value={time}
                  onChange={(e) => onChange({ time: e.target.value })}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
                >
                  {slotOptions.map((option) => (
                    <Radio.Button 
                      key={option.value} 
                      value={option.value}
                      className="text-center rounded-xl"
                    >
                      {option.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              ) : (
                <div className="col-span-full text-center py-4 text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-xl">
                  Chưa có khung giờ đang mở cho ngày này
                </div>
              )}
            </div>
          </fieldset>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Ghi chú thêm</span>
          <textarea
            className="input-base min-h-[80px] resize-y"
            value={note}
            onChange={(event) => onChange({ note: event.target.value })}
            placeholder="Triệu chứng bạn đang gặp phải hoặc yêu cầu thêm..."
            maxLength={1000}
          />
        </label>

        <div className="pt-4 border-t border-slate-100">
          <button
            className="btn-gradient w-full py-3.5 text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={submitting || bootstrapLoading || !slotOptions.length}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              "Xác nhận đặt lịch"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
