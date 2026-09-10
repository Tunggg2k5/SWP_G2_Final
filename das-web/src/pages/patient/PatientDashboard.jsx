import { Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Stethoscope, Clock, ChevronRight } from "lucide-react";
import Feedback from "../../components/Feedback.jsx";
import PatientAppointmentList from "../../components/patient/PatientAppointmentList.jsx";
import PatientInvoiceList from "../../components/patient/PatientInvoiceList.jsx";
import PatientTreatmentRecords from "../../components/patient/PatientTreatmentRecords.jsx";
import { api, getErrorMessage } from "../../utils/api.js";
import { clinicDateInput, filterOpenSlotsForDate, formatPriceText, getAppointmentSlot, normalizeAppointmentSlots, todayInput } from "../../utils/format.js";
import { usePublicBootstrap } from "../../utils/usePublicBootstrap.js";
import BookingPage, { maxBookingDate, toClinicIso } from "../BookingPage.jsx";

const changeablePatientStatuses = new Set(["pending", "scheduled"]);
const patientFeatures = new Set(["home", "booking", "appointments", "history", "invoices", "records"]);

export default function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState("home");
  const [appointments, setAppointments] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [rescheduleForms, setRescheduleForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { services, dentists, rooms, slots, slotClosures } = usePublicBootstrap();
  const allSlotOptions = useMemo(() => normalizeAppointmentSlots(slots), [slots]);

  const dentistOptions = useMemo(() => {
    const roomDentists = rooms.map((room) => room.assignedDentist).filter(Boolean);
    return Array.from(new Map([...roomDentists, ...dentists].map((dentist) => [dentist._id, dentist])).values());
  }, [dentists, rooms]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/patient/dashboard");
      setAppointments(res.data.appointments || []);
      setAppointmentHistory(res.data.appointmentHistory || []);
      setRecords(res.data.records || []);
      setInvoices(res.data.invoices || []);
      const loadedReviews = res.data.reviews || [];
      setReviews(loadedReviews);
      setReviewForms((current) => {
        const next = { ...current };
        loadedReviews.forEach((review) => {
          const appointmentId = review.appointment?._id || review.appointment;
          if (!appointmentId) return;
          next[appointmentId] = {
            rating: Number(review.rating || 5),
            comment: review.comment || ""
          };
        });
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [activeFeature]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab") || "home";
    const nextFeature = patientFeatures.has(tab) ? tab : "home";
    setActiveFeature(nextFeature);

    if (nextFeature === "home" && (tab === "services" || location.hash === "#services")) {
      const scrollToServices = () => {
        const target = document.getElementById("services");
        if (!target) return;

        let scrollContainer = target.parentElement;
        while (scrollContainer && scrollContainer !== document.body) {
          const overflowY = window.getComputedStyle(scrollContainer).overflowY;
          if (/(auto|scroll|overlay)/.test(overflowY) && scrollContainer.scrollHeight > scrollContainer.clientHeight) break;
          scrollContainer = scrollContainer.parentElement;
        }

        if (!scrollContainer || scrollContainer === document.body) {
          const offsetTop = target.getBoundingClientRect().top + window.scrollY - 92;
          window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
          return;
        }

        const containerTop = scrollContainer.getBoundingClientRect().top;
        const offsetTop = target.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop - 92;
        scrollContainer.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
      };

      const firstTimer = window.setTimeout(scrollToServices, 100);
      const secondTimer = window.setTimeout(scrollToServices, 420);
      return () => {
        window.clearTimeout(firstTimer);
        window.clearTimeout(secondTimer);
      };
    }

    if (nextFeature === "home") {
      const timer = window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      return () => window.clearTimeout(timer);
    }
  }, [location.hash, location.search]);

  function updateReviewForm(appointmentId, values) {
    setReviewForms((current) => ({
      ...current,
      [appointmentId]: {
        rating: 5,
        comment: "",
        ...(current[appointmentId] || {}),
        ...values
      }
    }));
  }

  function openPatientFeature(featureId) {
    setActiveFeature(featureId);
    navigate(`/dashboard?tab=${featureId}`, { replace: false });
  }

  function scrollToPatientServices() {
    setActiveFeature("home");
    navigate("/dashboard?tab=home#services", { replace: false });
    window.setTimeout(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function updateRescheduleForm(appointment, values) {
    setRescheduleForms((current) => {
      const previous = current[appointment._id] || {};
      const date = values.date || previous.date || clinicDateInput(appointment.startAt) || todayInput();
      const dateSlots = filterOpenSlotsForDate(slots, slotClosures, date);
      const requestedTime = values.time || previous.time || getAppointmentSlot(appointment.startAt, dateSlots)?.value || "";
      const time = dateSlots.some((slot) => slot.value === requestedTime) ? requestedTime : dateSlots[0]?.value || "";

      return {
        ...current,
        [appointment._id]: {
          dentistId: appointment.dentist?._id || dentistOptions[0]?._id || "",
          ...previous,
          ...values,
          date,
          time
        }
      };
    });
  }

  async function submitReview(event, appointmentId) {
    event.preventDefault();
    const review = reviewForms[appointmentId] || { rating: 5, comment: "" };
    if (!window.confirm("Xác nhận gửi đánh giá cho lịch khám này?")) return;

    try {
      await api.post("/patient/reviews", { ...review, appointmentId });
      setMessage("Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm.");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function cancelAppointment(appointment, reason) {
    if (!canModifyAppointment(appointment)) {
      setError("Lịch hẹn này không còn trong trạng thái được hủy hoặc đổi lịch.");
      return;
    }
    if (!reason?.trim()) {
      setError("Vui lòng chọn hoặc nhập lý do hủy lịch.");
      return;
    }

    try {
      await api.patch(`/appointments/${appointment._id}/cancel`, { reason });
      setMessage("Đã gửi yêu cầu hủy lịch hẹn.");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function rescheduleAppointment(appointment) {
    if (!canModifyAppointment(appointment)) {
      setError("Lịch hẹn này không còn trong trạng thái được đổi lịch.");
      return false;
    }

    const form = rescheduleForms[appointment._id] || {};
    const formSlotOptions = filterOpenSlotsForDate(slots, slotClosures, form.date);
    if (!form.date || !form.time || !form.dentistId) {
      setError("Chọn đầy đủ ngày, khung giờ và bác sĩ trước khi đổi lịch.");
      return false;
    }
    if (!formSlotOptions.some((option) => option.value === form.time)) {
      setError("Khung giờ này đã đóng trong ngày bạn chọn.");
      return false;
    }
    if (form.date > maxBookingDate()) {
      setError("Bạn chỉ được đổi lịch trong vòng 1 tháng tính từ hôm nay.");
      return false;
    }

    const wantsReceptionArrangement = form.dentistId === "reception";
    const room = wantsReceptionArrangement ? null : rooms.find((item) => item.assignedDentist?._id === form.dentistId) || rooms.find((item) => item.assignedDentist);
    if (!wantsReceptionArrangement && !room) {
      setError("Chưa có phòng khám được gán bác sĩ. Vui lòng liên hệ lễ tân.");
      return false;
    }

    const slot = formSlotOptions.find((option) => option.value === form.time);
    if (!window.confirm(`Xác nhận đổi lịch sang ngày ${form.date}, ${slot?.label || form.time}?`)) return false;

    try {
      await api.patch(`/appointments/${appointment._id}/reschedule`, {
        serviceId: appointment.service?._id,
        date: form.date,
        startAt: toClinicIso(form.date, form.time),
        roomId: room?._id
      });
      setMessage("Đã gửi yêu cầu đổi lịch. Lễ tân sẽ xác nhận lại lịch hẹn của bạn.");
      setRescheduleForms((current) => {
        const next = { ...current };
        delete next[appointment._id];
        return next;
      });
      load();
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  }

  const reviewByAppointment = new Map(
    reviews
      .map((review) => [review.appointment?._id || review.appointment, review])
      .filter(([appointmentId]) => appointmentId)
  );

  const tabItems = [
    {
      key: "home",
      label: "Trang chủ",
      children: (
        <div className="space-y-12">
          <PatientHome onNavigate={openPatientFeature} onServices={scrollToPatientServices} />
          <PatientServices services={services} />
        </div>
      )
    },
    {
      key: "booking",
      label: "Đặt lịch",
      children: <BookingPage embedded />
    },
    {
      key: "appointments",
      label: "Lịch hẹn",
      children: (
        <PatientAppointmentList
          appointments={appointments}
          appointmentHistory={appointmentHistory}
          canModifyAppointment={canModifyAppointment}
          cancelAppointment={cancelAppointment}
          dentistOptions={dentistOptions}
          loading={loading}
          rescheduleAppointment={rescheduleAppointment}
          rescheduleForms={rescheduleForms}
          slotClosures={slotClosures}
          slotOptions={allSlotOptions}
          updateRescheduleForm={updateRescheduleForm}
        />
      )
    },
    {
      key: "history",
      label: "Lịch sử hẹn",
      children: (
        <PatientAppointmentList
          appointments={appointments}
          appointmentHistory={appointmentHistory}
          canModifyAppointment={canModifyAppointment}
          cancelAppointment={cancelAppointment}
          dentistOptions={dentistOptions}
          historyOnly
          loading={loading}
          rescheduleAppointment={rescheduleAppointment}
          rescheduleForms={rescheduleForms}
          slotClosures={slotClosures}
          slotOptions={allSlotOptions}
          updateRescheduleForm={updateRescheduleForm}
        />
      )
    },
    {
      key: "invoices",
      label: "Hóa đơn",
      children: (
        <PatientInvoiceList
          invoices={invoices}
          loading={loading}
          reviewByAppointment={reviewByAppointment}
          reviewForms={reviewForms}
          submitReview={submitReview}
          updateReviewForm={updateReviewForm}
        />
      )
    },
    {
      key: "records",
      label: "Hồ sơ",
      children: <PatientTreatmentRecords loading={loading} records={records} />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <Feedback error={error} message={message} onClear={() => { setError(""); setMessage(""); }} />

      <main className="w-full">
        <Tabs
          activeKey={activeFeature}
          onChange={openPatientFeature}
          items={tabItems}
          type="card"
          renderTabBar={() => null}
          className="patient-dashboard-tabs"
        />
      </main>
    </div>
  );
}

function PatientHome({ onNavigate, onServices }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl" id="home">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      <div className="relative p-8 md:p-12 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          Chăm sóc nụ cười của bạn với <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200">SmileCare</span>
        </h1>
        <p className="text-primary-100 text-lg mb-8 max-w-2xl leading-relaxed">
          Quản lý lịch khám, theo dõi hồ sơ điều trị và thanh toán dễ dàng tại một nơi duy nhất.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            className="bg-white text-primary-800 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            type="button"
            onClick={() => onNavigate("booking")}
          >
            <Calendar size={20} />
            Đặt lịch ngay
          </button>
          <button
            className="glass hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
            type="button"
            onClick={() => onNavigate("appointments")}
          >
            <Clock size={20} />
            Lịch hẹn của tôi
          </button>
          <button
            className="text-primary-200 hover:text-white font-medium px-4 py-3 rounded-xl transition-colors flex items-center gap-1"
            type="button"
            onClick={onServices}
          >
            Xem dịch vụ <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/10 backdrop-blur-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-primary-200 text-sm font-medium">Bác sĩ chuyên khoa</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-primary-200 text-sm font-medium">Đánh giá hài lòng</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-primary-200 text-sm font-medium">Hỗ trợ khách hàng</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">5K+</div>
            <div className="text-primary-200 text-sm font-medium">Nụ cười rạng rỡ</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PatientServices({ services }) {
  const tones = [
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500"
  ];

  return (
    <section className="space-y-8" id="services">
      <div className="flex flex-col items-center text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Dịch vụ SmileCare</h2>
        <div className="w-16 h-1.5 bg-primary-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <article className="card-base card-hover overflow-hidden group flex flex-col" key={service._id}>
            <div className={`h-2 w-full bg-gradient-to-r ${tones[index % tones.length]}`}></div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{service.name}</h3>
              <div className="text-lg font-bold text-emerald-600 mb-3">{formatPriceText(service.price)}</div>
              <p className="text-slate-600 text-sm leading-relaxed flex-grow">{service.description || "Thông tin dịch vụ đang được cập nhật."}</p>
            </div>
          </article>
        ))}
        {!services.length && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Chưa có dịch vụ đang hoạt động.
          </div>
        )}
      </div>
    </section>
  );
}

function canModifyAppointment(appointment) {
  return changeablePatientStatuses.has(appointment.status) && new Date(appointment.startAt) > new Date();
}
