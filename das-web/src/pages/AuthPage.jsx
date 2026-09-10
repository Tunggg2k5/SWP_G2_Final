import { Activity } from "lucide-react";
import { Row, Col, Flex, Typography } from "antd";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";

const { Title, Paragraph } = Typography;

export default function AuthPage({ mode }) {
  return (
    <Row style={{ minHeight: "100vh" }}>
      <Col xs={0} lg={10} style={{
        background: "linear-gradient(135deg, #0284c7, #0d9488)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        padding: 48,
        textAlign: "center"
      }}>
        <div style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32
        }}>
          <Activity size={56} color="#fff" />
        </div>
        <Title level={1} style={{ color: "#fff", margin: "0 0 16px", fontWeight: 800 }}>SmileCare</Title>
        <Paragraph style={{ color: "#e0f2fe", fontSize: 18, maxWidth: 400, lineHeight: 1.6 }}>
          Hệ thống quản lý phòng khám nha khoa hiện đại, tận tâm và chuyên nghiệp.
        </Paragraph>
      </Col>

      <Col xs={24} lg={14} style={{ background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {mode === "register" ? <RegisterForm /> : mode === "forgot" ? <ForgotPasswordForm /> : <LoginForm />}
        </div>
      </Col>
    </Row>
  );
}
