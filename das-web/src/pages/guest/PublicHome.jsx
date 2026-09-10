import {
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Activity
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Row, Col, Button, Collapse, Tag, Flex } from "antd";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Feedback error={error} message={message} onClear={() => { setError(""); setMessage(""); }} />

      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          height: 70,
          padding: "0 40px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Flex align="center" gap={10}>
          <div style={{
            background: "linear-gradient(135deg, #0284c7, #0369a1)",
            padding: 8,
            borderRadius: 10,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Activity size={20} />
          </div>
          <a href="#home" style={{ textDecoration: "none", fontSize: 22, fontWeight: 800, color: "#0284c7" }}>
            SmileCare
          </a>
        </Flex>

        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#home" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>Trang chủ</a>
          <a href="#services" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>Dịch vụ</a>
          <a href="#about" style={{ textDecoration: "none", color: "#475569", fontWeight: 500, fontSize: 15 }}>Giới thiệu</a>
        </nav>

        <Flex align="center" gap={16}>
          {hotline && (
            <a href={hotlineHref} style={{ textDecoration: "none", color: "#0284c7", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <PhoneCall size={18} />
              <span>{hotline}</span>
            </a>
          )}
          <Link to="/login">
            <Button type="primary" size="large" style={{ borderRadius: 8, fontWeight: 600, padding: "0 24px" }}>
              Đăng nhập
            </Button>
          </Link>
        </Flex>
      </Header>

      <Content>
        {/* Hero Section */}
        <section style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "80px 20px" }} id="home">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <Tag color="blue" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                  <ShieldCheck size={16} />
                  Nha khoa uy tín hàng đầu
                </Tag>
                <Title level={1} style={{ fontSize: "3.2rem", fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px" }}>
                  Nụ Cười Rạng Rỡ, <br />
                  <span style={{ color: "#0284c7" }}>Tự Tin Tỏa Sáng</span>
                </Title>
                <Paragraph style={{ fontSize: 18, color: "#64748b", lineHeight: 1.7, marginBottom: 32 }}>
                  SmileCare mang đến giải pháp chăm sóc răng miệng toàn diện với công nghệ hiện đại và đội ngũ bác sĩ giàu kinh nghiệm.
                </Paragraph>
                <Flex gap={16} wrap="wrap">
                  <a href="#consultation">
                    <Button type="primary" size="large" icon={<ChevronRight size={18} />} iconPosition="end" style={{ height: 48, borderRadius: 8, padding: "0 28px", fontWeight: 600 }}>
                      Đăng ký tư vấn miễn phí
                    </Button>
                  </a>
                  <a href="#services">
                    <Button size="large" icon={<ChevronRight size={18} />} iconPosition="end" style={{ height: 48, borderRadius: 8, padding: "0 28px", fontWeight: 600 }}>
                      Khám phá dịch vụ
                    </Button>
                  </a>
                </Flex>
              </Col>

              <Col xs={24} lg={12}>
                <div style={{ position: "relative" }}>
                  <img
                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Phòng khám nha khoa hiện đại"
                    style={{ width: "100%", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.08)", aspectRatio: "4/3", objectCover: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: -20,
                    left: -20,
                    background: "#fff",
                    padding: "16px 24px",
                    borderRadius: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>100%</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>Bác sĩ chuyên khoa</div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        <DentalService services={serviceCards} />

        <ClinicInformation address={clinic.address} dentistCount={dentistCards.length} roomCount={roomCount} />

        <DentistProfile dentistSlides={dentistSlides} />

        {faqs.length > 0 && (
          <section style={{ padding: "80px 20px", background: "#f8fafc" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
                <Tag color="gold" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Sparkles size={16} />
                  Tư vấn nhanh
                </Tag>
                <Title level={2} style={{ margin: 0 }}>Giải Đáp Thắc Mắc Về Sức Khỏe Răng Miệng</Title>
              </Flex>

              <Row gutter={[48, 48]} align="middle">
                <Col xs={24} lg={12}>
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRazgHjrZSwfGVLIdmVD_YV5WAuor-NRqzsb53jMC05rQ&s=10"
                    alt="Tư vấn nha khoa"
                    style={{ width: "100%", borderRadius: 20, objectCover: "cover", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <Collapse
                    accordion
                    ghost
                    expandIconPosition="end"
                    items={faqs.map((item, index) => ({
                      key: index,
                      label: <span style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>{item.question}</span>,
                      children: <Paragraph style={{ color: "#475569", lineHeight: 1.7, margin: 0, paddingTop: 8 }}>{item.answer}</Paragraph>
                    }))}
                    style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  />
                </Col>
              </Row>
            </div>
          </section>
        )}

        <ReviewList reviews={reviewCards} />

        <ConsultationForm
          onError={setError}
          onMessage={setMessage}
          services={services}
        />
      </Content>

      <Footer style={{ background: "#0f172a", color: "#94a3b8", padding: "64px 40px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <Title level={3} style={{ color: "#fff", marginBottom: 16 }}>Smile<span style={{ color: "#38bdf8" }}>Care</span></Title>
              <Paragraph style={{ color: "#94a3b8", maxWidth: 400, lineHeight: 1.7 }}>
                Nha khoa SmileCare - Đồng hành cùng nụ cười Việt với dịch vụ chăm sóc răng miệng chất lượng cao, công nghệ chuẩn y khoa quốc tế.
              </Paragraph>
            </Col>

            <Col xs={12} md={6}>
              <Text strong style={{ color: "#fff", fontSize: 16, display: "block", marginBottom: 16 }}>Về SmileCare</Text>
              <Flex vertical gap={12}>
                <a href="#about" style={{ color: "#94a3b8", textDecoration: "none" }}>Giới thiệu</a>
                <a href="#about" style={{ color: "#94a3b8", textDecoration: "none" }}>Đội ngũ bác sĩ</a>
                <a href="#services" style={{ color: "#94a3b8", textDecoration: "none" }}>Cơ sở vật chất</a>
                <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none" }}>Đăng nhập</Link>
              </Flex>
            </Col>

            <Col xs={12} md={6}>
              <Text strong style={{ color: "#fff", fontSize: 16, display: "block", marginBottom: 16 }}>Hỗ trợ</Text>
              <Flex vertical gap={12}>
                <a href="#consultation" style={{ color: "#94a3b8", textDecoration: "none" }}>Câu hỏi thường gặp</a>
                <Link to="/register" style={{ color: "#94a3b8", textDecoration: "none" }}>Tạo tài khoản</Link>
                <Link to="/booking" style={{ color: "#94a3b8", textDecoration: "none" }}>Hướng dẫn đặt lịch</Link>
                <a href={hotlineHref} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>{hotline || "1900 8888"}</a>
              </Flex>
            </Col>
          </Row>

          <div style={{ borderTop: "1px solid #1e293b", marginTop: 48, paddingTop: 24, textAlign: "center", fontSize: 14 }}>
            © 2026 SmileCare. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </Footer>
    </Layout>
  );
}
