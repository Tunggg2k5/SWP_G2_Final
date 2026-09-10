import {
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Collapse, Typography } from "antd";

const { Title, Paragraph } = Typography;

import Feedback from "../../components/Feedback.jsx";
import ClinicInformation from "../../components/guestHome/ClinicInformation.jsx";
import ConsultationForm from "../../components/guestHome/ConsultationForm.jsx";
import DentalService from "../../components/guestHome/DentalService.jsx";
import DentistProfile from "../../components/guestHome/DentistProfile.jsx";
import ReviewList from "../../components/guestHome/ReviewList.jsx";
import { formatPriceText } from "../../utils/format.js";
import { usePublicBootstrap } from "../../utils/usePublicBootstrap.js";

const serviceToneCycle = ["implant", "cosmetic", "ortho", "general"];

function stripServiceDurationText(description) {
  return (description ?? "")
    .replace(/,?\s*thời lượng(?: dự kiến)?\s*\d+\s*phút\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function newestFirst(items) {
  return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getServiceCards(services) {
  return newestFirst(services).map((service, index) => ({
    _id: service._id,
    name: service.name,
    price: service.price,
    priceText: formatPriceText(service.price),
    description: stripServiceDurationText(service.description) || "Thông tin dịch vụ đang được cập nhật.",
    accent: serviceToneCycle[index % serviceToneCycle.length]
  }));
}

function getReviewCards(reviews) {
  return newestFirst(reviews)
    .slice(0, 8)
    .map((review) => ({
      _id: review._id,
      name: review.patient?.fullName || "Khách hàng SmileCare",
      service: review.service?.name || "Dịch vụ nha khoa",
      text: review.comment || "",
      rating: Math.min(Math.max(Number(review.rating || 5), 1), 5)
    }));
}

export default function PublicHome() {
  const { services, dentists, rooms, reviews, clinic } = usePublicBootstrap();
  const faqs = clinic.faqs || [];
  const hotline = clinic.hotline || clinic.receptionist?.phone || "";
  const hotlineHref = hotline ? `tel:${hotline.replace(/\s/g, "")}` : "#consultation";
  const dentistCards = useMemo(() => newestFirst(dentists), [dentists]);
  const dentistSlides = useMemo(() => dentistCards.map((dentist) => [dentist]), [dentistCards]);
  const reviewCards = useMemo(() => getReviewCards(reviews), [reviews]);
  const serviceCards = useMemo(() => getServiceCards(services), [services]);
  const roomCount = rooms.length;
  const [openFaq, setOpenFaq] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Feedback error={error} message={message} onClear={() => { setError(""); setMessage(""); }} />

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <a className="text-2xl font-bold text-gradient" href="#home" aria-label="SmileCare">
            SmileCare
          </a>

          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-700" aria-label="Điều hướng khách">
            <a href="#home" className="hover:text-primary-600 transition-colors">Trang chủ</a>
            <a href="#services" className="hover:text-primary-600 transition-colors">Dịch vụ</a>
            <a href="#about" className="hover:text-primary-600 transition-colors">Giới thiệu</a>
          </nav>

          <div className="flex items-center gap-4">
            <a className="hidden md:flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800 transition-colors" href={hotlineHref}>
              <PhoneCall size={18} />
              <span>{hotline || "Liên hệ lễ tân"}</span>
            </a>
            <Link className="btn-gradient text-white px-5 py-2 rounded-xl" to="/login">
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-[85vh] bg-gradient-to-br from-primary-800 via-primary-700 to-teal-600 relative overflow-hidden flex items-center" id="home">
          {/* Decorative shapes */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-400 opacity-10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-20">
            <div className="space-y-8 text-white">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                <ShieldCheck size={16} />
                Nha khoa uy tín hàng đầu
              </span>
              <Title level={1} className="font-extrabold leading-tight text-white mb-6" style={{ fontSize: '3.5rem', color: 'white' }}>
                <span className="block">Nụ Cười Rạng Rỡ,</span>
                <span className="block text-teal-200">Tự Tin Tỏa Sáng</span>
              </Title>
              <p className="text-lg md:text-xl text-primary-100 max-w-lg leading-relaxed">
                SmileCare mang đến giải pháp chăm sóc răng miệng toàn diện với công nghệ hiện đại và đội ngũ bác sĩ giàu kinh nghiệm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a className="btn-gradient text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-all text-center" href="#consultation">
                  Đặt lịch ngay
                  <ChevronRight size={18} />
                </a>
                <a className="px-8 py-3 rounded-xl flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold transition-all text-center" href="#services">
                  Tư vấn miễn phí
                  <ChevronRight size={18} />
                </a>
              </div>
            </div>

            <div className="hidden lg:flex justify-center relative" aria-label="Hình ảnh phòng khám SmileCare">
              <div className="w-full max-w-md aspect-square rounded-full bg-gradient-to-tr from-white/10 to-white/30 backdrop-blur-md p-4 relative">
                <div className="w-full h-full rounded-full bg-primary-900/40 border-4 border-white/20 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white text-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Thăm khám nhẹ nhàng</p>
                    <p className="text-sm text-slate-500">100% không đau</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DentalService services={serviceCards} />

        <ClinicInformation address={clinic.address} dentistCount={dentistCards.length} roomCount={roomCount} />

        <DentistProfile dentistSlides={dentistSlides} />

        {faqs.length > 0 && <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-2 text-amber-600 bg-amber-100 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles size={16} />
                Tư vấn nhanh
              </span>
              <Title level={2} className="text-slate-900 m-0">Giải Đáp Thắc Mắc Về Sức Khỏe Răng Miệng</Title>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="rounded-2xl overflow-hidden aspect-video lg:aspect-square bg-slate-200 shadow-inner">
                <img src="https://images.unsplash.com/photo-1598256989800-fea5ce5146f2?auto=format&fit=crop&q=80" alt="Tư vấn nha khoa" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <Collapse 
                  accordion 
                  ghost
                  expandIconPosition="end"
                  items={faqs.map((item, index) => ({
                    key: index,
                    label: <span className="text-lg font-semibold text-slate-800">{item.question}</span>,
                    children: <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4 m-0">{item.answer}</p>
                  }))}
                  className="bg-white rounded-2xl shadow-sm p-4 card-base"
                />
              </div>
            </div>
          </div>
        </section>}

        <ReviewList reviews={reviewCards} />

        <ConsultationForm
          onError={setError}
          onMessage={setMessage}
          services={services}
        />
      </main>

      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2 space-y-6">
              <strong className="text-3xl font-bold tracking-tight">Smile<span className="text-teal-400">Care</span></strong>
              <p className="text-slate-400 max-w-sm leading-relaxed">Nha khoa SmileCare - Đồng hành cùng nụ cười Việt với dịch vụ chăm sóc răng miệng chất lượng cao.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-6">Về SmileCare</h3>
              <div className="flex flex-col gap-3 text-slate-400">
                <a href="#about" className="hover:text-teal-400 transition-colors">Giới thiệu</a>
                <a href="#about" className="hover:text-teal-400 transition-colors">Đội ngũ bác sĩ</a>
                <a href="#about" className="hover:text-teal-400 transition-colors">Cơ sở vật chất</a>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Đăng nhập</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-6">Hỗ trợ</h3>
              <div className="flex flex-col gap-3 text-slate-400">
                <a href="#consultation" className="hover:text-teal-400 transition-colors">Câu hỏi thường gặp</a>
                <Link to="/register" className="hover:text-teal-400 transition-colors">Tạo tài khoản</Link>
                <Link to="/booking" className="hover:text-teal-400 transition-colors">Hướng dẫn đặt lịch</Link>
                <a href={hotlineHref} className="hover:text-teal-400 transition-colors font-semibold text-white">{hotline || "Liên hệ lễ tân"}</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>© 2026 SmileCare. Tất cả quyền được bảo lưu.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
