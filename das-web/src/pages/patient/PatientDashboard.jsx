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
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px 16px" }}>
      <Feedback error={error} message={message} onClear={() => { setError(""); setMessage(""); }} />

      <main style={{ width: "100%", marginTop: 24 }}>
        <Tabs
          activeKey={activeFeature}
          onChange={openPatientFeature}
          items={tabItems}
          type="card"
          renderTabBar={() => null}
        />
      </main>
    </div>
  );
}

import { Row, Col, Card, Typography, Flex, Button } from "antd";
const { Title, Text, Paragraph } = Typography;

function PatientHome({ onNavigate, onServices }) {
  return (
    <Card
      bordered={false}
      style={{ position: "relative", overflow: "hidden", borderRadius: 24, backgroundColor: "#0f172a", color: "#fff", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      bodyStyle={{ padding: 0 }}
      id="home"
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, #134e4a, #065f46, #115e59)", opacity: 0.9 }}></div>
      
      <div style={{ position: "relative", padding: "48px 32px", maxWidth: 768 }}>
        <Title style={{ color: "#fff", fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
          Chăm sóc nụ cười của bạn với <span style={{ color: "#6ee7b7" }}>SmileCare</span>
        </Title>
        <Paragraph style={{ color: "#d1fae5", fontSize: 18, marginBottom: 32, maxWidth: 672 }}>
          Quản lý lịch khám, theo dõi hồ sơ điều trị và thanh toán dễ dàng tại một nơi duy nhất.
        </Paragraph>

        <Flex wrap gap={16}>
          <Button 
            type="primary" 
            size="large" 
            icon={<Calendar size={20} />} 
            onClick={() => onNavigate("booking")}
            style={{ backgroundColor: "#fff", color: "#065f46", fontWeight: 700, borderRadius: 12, height: 48, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          >
            Đặt lịch ngay
          </Button>
          <Button 
            ghost 
            size="large" 
            icon={<Clock size={20} />} 
            onClick={() => onNavigate("appointments")}
            style={{ fontWeight: 600, borderRadius: 12, height: 48, borderColor: "rgba(255,255,255,0.4)" }}
          >
            Lịch hẹn của tôi
          </Button>
          <Button 
            type="text" 
            size="large" 
            onClick={onServices}
            style={{ color: "#a7f3d0", fontWeight: 500 }}
          >
            Xem dịch vụ <ChevronRight size={16} style={{ marginLeft: 4 }} />
          </Button>
        </Flex>
      </div>

      <div style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.1)", backdropFilter: "blur(4px)", padding: 24 }}>
        <Row gutter={[24, 24]} style={{ textAlign: "center" }}>
          <Col xs={12} md={6}>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>100%</Title>
            <Text style={{ color: "#a7f3d0", fontWeight: 500 }}>Bác sĩ chuyên khoa</Text>
          </Col>
          <Col xs={12} md={6}>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>4.9/5</Title>
            <Text style={{ color: "#a7f3d0", fontWeight: 500 }}>Đánh giá hài lòng</Text>
          </Col>
          <Col xs={12} md={6}>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>24/7</Title>
            <Text style={{ color: "#a7f3d0", fontWeight: 500 }}>Hỗ trợ khách hàng</Text>
          </Col>
          <Col xs={12} md={6}>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>5K+</Title>
            <Text style={{ color: "#a7f3d0", fontWeight: 500 }}>Nụ cười rạng rỡ</Text>
          </Col>
        </Row>
      </div>
    </Card>
  );
}

function PatientServices({ services }) {
  const tones = [
    "linear-gradient(to right, #3b82f6, #06b6d4)",
    "linear-gradient(to right, #10b981, #14b8a6)",
    "linear-gradient(to right, #8b5cf6, #a855f7)",
    "linear-gradient(to right, #f43f5e, #ec4899)",
    "linear-gradient(to right, #f59e0b, #f97316)"
  ];

  return (
    <div style={{ marginTop: 48 }} id="services">
      <Flex vertical align="center" gap={16} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>Dịch vụ SmileCare</Title>
        <div style={{ width: 64, height: 6, backgroundColor: "#10b981", borderRadius: 4 }}></div>
      </Flex>

      <Row gutter={[24, 24]}>
        {services.map((service, index) => (
          <Col xs={24} md={12} lg={8} key={service._id}>
            <Card 
              bordered={false} 
              style={{ height: "100%", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div style={{ height: 8, width: "100%", background: tones[index % tones.length] }}></div>
              <Flex vertical style={{ padding: 24, flexGrow: 1 }}>
                <Flex align="center" justify="center" style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#f8fafc", color: "#94a3b8", marginBottom: 16 }}>
                  <Stethoscope size={24} />
                </Flex>
                <Title level={4} style={{ marginBottom: 8 }}>{service.name}</Title>
                <Text strong style={{ color: "#059669", fontSize: 18, marginBottom: 12 }}>{formatPriceText(service.price)}</Text>
                <Text type="secondary" style={{ flexGrow: 1 }}>{service.description || "Thông tin dịch vụ đang được cập nhật."}</Text>
              </Flex>
            </Card>
          </Col>
        ))}
        {!services.length && (
          <Col span={24}>
            <div style={{ padding: 48, textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
              Chưa có dịch vụ đang hoạt động.
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}

function canModifyAppointment(appointment) {
  return changeablePatientStatuses.has(appointment.status) && new Date(appointment.startAt) > new Date();
}
