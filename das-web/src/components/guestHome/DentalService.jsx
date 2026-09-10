import { Sparkles } from "lucide-react";
import { Typography, Row, Col, Tag, Flex } from "antd";
import DentalServiceCard from "./DentalServiceCard.jsx";

const { Title, Paragraph } = Typography;

export default function DentalService({ services }) {
  return (
    <section style={{ padding: "80px 20px", background: "#fff" }} id="services">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
          <Tag color="blue" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Sparkles size={16} />
            Dịch vụ của chúng tôi
          </Tag>
          <Title level={2} style={{ marginBottom: 16 }}>Chăm Sóc Toàn Diện Cho Nụ Cười Của Bạn</Title>
          <Paragraph style={{ color: "#475569", fontSize: 16 }}>
            Từ kiểm tra định kỳ đến các giải pháp thẩm mỹ nha khoa, SmileCare đồng hành cùng bạn trong từng bước điều trị.
          </Paragraph>
        </Flex>

        <Row gutter={[24, 24]}>
          {services.map((service) => (
            <Col xs={24} sm={12} lg={6} key={service._id || service.name}>
              <DentalServiceCard service={service} />
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
