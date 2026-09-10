import { BellOutlined, LockOutlined, UserOutlined, CameraOutlined, SaveOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Input, List, Space, Tag, Typography, Row, Col, Flex } from "antd";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import Feedback from "../components/Feedback.jsx";
import { useAuth } from "../redux/AuthContext.jsx";
import { api, getErrorMessage } from "../utils/api.js";
import { firstError, validateName, validatePassword, validatePhone } from "../utils/validation.js";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
    bio: user?.bio || ""
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/notifications")
      .then((res) => setNotifications(res.data.notifications))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = firstError(validateName(profile.fullName), validatePhone(profile.phone));
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!window.confirm("Xác nhận lưu thay đổi hồ sơ cá nhân?")) return;

    try {
      const res = await api.patch("/auth/me", profile);
      localStorage.setItem("das_user", JSON.stringify(res.data.user));
      setMessage("Đã cập nhật hồ sơ cá nhân.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = firstError(
      passwords.currentPassword ? "" : "Mật khẩu hiện tại là bắt buộc.",
      validatePassword(passwords.newPassword)
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!window.confirm("Xác nhận đổi mật khẩu tài khoản?")) return;

    try {
      await api.patch("/auth/change-password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Đã đổi mật khẩu. Vui lòng dùng mật khẩu mới ở lần đăng nhập tiếp theo.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "24px 16px" }}>
      <Space direction="vertical" size="large" style={{ display: "flex" }}>
        <Feedback error={error} message={message} />

        <Card 
          title={
            <Space>
              <UserOutlined style={{ color: "#2563eb" }} /> 
              <span>Hồ sơ cá nhân</span>
            </Space>
          } 
          style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <Flex align="center" gap="large" style={{ marginBottom: 32 }} wrap="wrap">
            <Avatar 
              size={96} 
              src={profile.avatarUrl} 
              icon={!profile.avatarUrl && <UserOutlined />} 
              style={{ backgroundColor: "#f1f5f9", color: "#94a3b8", border: "2px solid #e2e8f0" }}
            />
            <div>
              <Title level={3} style={{ margin: 0, color: "#0f172a" }}>{profile.fullName || user?.fullName}</Title>
              <Tag color="blue" style={{ marginTop: 8 }}>
                {user?.role === "patient" ? "Bệnh nhân" : user?.role === "dentist" ? "Bác sĩ" : user?.role}
              </Tag>
            </div>
          </Flex>

          <form onSubmit={saveProfile}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong style={{ color: "#334155" }}>Họ tên</Text>
                    <Input value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)} required maxLength={120} />
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong style={{ color: "#334155" }}>Số điện thoại</Text>
                    <Input type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} required maxLength={13} />
                  </Space>
                </Col>
              </Row>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Avatar URL</Text>
                <Input prefix={<CameraOutlined style={{ color: "#94a3b8" }} />} value={profile.avatarUrl} onChange={(e) => updateProfile("avatarUrl", e.target.value)} placeholder="https://..." />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Ghi chú hồ sơ</Text>
                <Input.TextArea value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} rows={3} maxLength={1000} />
              </Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Lưu hồ sơ
              </Button>
            </Space>
          </form>
        </Card>

        <Card 
          title={
            <Space>
              <LockOutlined style={{ color: "#d97706" }} /> 
              <span>Đổi mật khẩu</span>
            </Space>
          } 
          style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <form onSubmit={changePassword} style={{ maxWidth: 384 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Mật khẩu hiện tại</Text>
                <Input.Password
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Mật khẩu mới</Text>
                <Input.Password
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  minLength={8}
                  maxLength={72}
                />
              </Space>
              <Button htmlType="submit">Đổi mật khẩu</Button>
            </Space>
          </form>
        </Card>

        <Card 
          title={
            <Space>
              <BellOutlined style={{ color: "#2563eb" }} /> 
              <span>Thông báo</span>
            </Space>
          } 
          style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          {notifications.length ? (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item style={{ backgroundColor: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #f1f5f9", marginBottom: 12 }}>
                  <List.Item.Meta
                    title={<strong style={{ color: "#0f172a" }}>{notification.title}</strong>}
                    description={<span style={{ color: "#334155" }}>{notification.message}</span>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <EmptyState title="Không có thông báo" text="Bạn hiện không có thông báo nào mới." />
          )}
        </Card>
      </Space>
    </div>
  );
}
