import { CalendarDays, CheckCircle2, Clock, MapPin, UsersRound } from "lucide-react";
import { Card, Typography, Row, Col, Flex, Tag } from "antd";

const { Title, Text } = Typography;

export default function ClinicInformation({ address, dentistCount, roomCount }) {
  return (
    <section style={{ padding: "64px 20px", background: "#0284c7", color: "#fff", position: "relative" }} id="about">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex vertical align="center" style={{ textAlign: "center", marginBottom: 48 }}>
          <Tag color="cyan" style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <CheckCircle2 size={16} />
            Về SmileCare
          </Tag>
          <Title level={2} style={{ color: "#fff", marginBottom: 16 }}>Không gian điều trị hiện đại, lịch hẹn rõ ràng</Title>
          <Flex align="center" gap={8} style={{ color: "#e0f2fe", fontSize: 15 }}>
            <Clock size={18} />
            <span>Hằng tuần, 8h-11h30 và 14h-17h30</span>
          </Flex>
        </Flex>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card style={{ textAlign: "center", height: "100%", borderRadius: 16, border: "none" }} styles={{ body: { display: "flex", flexDirection: "column", alignItems: "center", padding: 28 } }}>
              <div style={{ width: 64, height: 64, background: "#f0f9ff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <MapPin size={32} color="#0284c7" />
              </div>
              <strong style={{ fontSize: 18, color: "#1e293b", marginBottom: 8, display: "block" }}>Vị trí trung tâm</strong>
              <Text type="secondary">{address || "Địa chỉ phòng khám đang được cập nhật."}</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card style={{ textAlign: "center", height: "100%", borderRadius: 16, border: "none" }} styles={{ body: { display: "flex", flexDirection: "column", alignItems: "center", padding: 28 } }}>
              <div style={{ width: 64, height: 64, background: "#f0f9ff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <CalendarDays size={32} color="#0284c7" />
              </div>
              <strong style={{ fontSize: 18, color: "#1e293b", marginBottom: 8, display: "block" }}>{roomCount ? `${roomCount} phòng` : "Chưa có"} điều trị</strong>
              <Text type="secondary">Trang thiết bị hiện đại, vô trùng.</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card style={{ textAlign: "center", height: "100%", borderRadius: 16, border: "none" }} styles={{ body: { display: "flex", flexDirection: "column", alignItems: "center", padding: 28 } }}>
              <div style={{ width: 64, height: 64, background: "#f0f9ff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <UsersRound size={32} color="#0284c7" />
              </div>
              <strong style={{ fontSize: 18, color: "#1e293b", marginBottom: 8, display: "block" }}>{dentistCount} Bác sĩ</strong>
              <Text type="secondary">Giàu kinh nghiệm, tận tâm.</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
}
