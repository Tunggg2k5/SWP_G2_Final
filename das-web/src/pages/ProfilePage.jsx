import { BellOutlined, LockOutlined, UserOutlined, CameraOutlined, SaveOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Descriptions, Input, List, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import Feedback from "../components/Feedback.jsx";
import { useAuth } from "../redux/AuthContext.jsx";
import { api, getErrorMessage } from "../utils/api.js";
import { firstError, validateName, validatePassword, validatePhone } from "../utils/validation.js";

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
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-6">
      <Feedback error={error} message={message} />

      <Card title={<><UserOutlined className="text-primary-600 mr-2" /> Hồ sơ cá nhân</>} className="shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar 
            size={96} 
            src={profile.avatarUrl} 
            icon={!profile.avatarUrl && <UserOutlined />} 
            className="bg-slate-100 text-slate-400 border-2 border-slate-200"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-slate-900 m-0">{profile.fullName || user?.fullName}</h3>
            <Tag color="blue" className="mt-2">
              {user?.role === "patient" ? "Bệnh nhân" : user?.role === "dentist" ? "Bác sĩ" : user?.role}
            </Tag>
          </div>
        </div>

        <form className="space-y-4" onSubmit={saveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Họ tên</span>
              <Input value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)} required maxLength={120} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
              <Input type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} required maxLength={13} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Avatar URL</span>
            <Input prefix={<CameraOutlined className="text-slate-400" />} value={profile.avatarUrl} onChange={(e) => updateProfile("avatarUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Ghi chú hồ sơ</span>
            <Input.TextArea value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} rows={3} maxLength={1000} />
          </div>
          <div className="pt-2">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} className="w-full sm:w-auto">
              Lưu hồ sơ
            </Button>
          </div>
        </form>
      </Card>

      <Card title={<><LockOutlined className="text-amber-600 mr-2" /> Đổi mật khẩu</>} className="shadow-sm">
        <form className="space-y-4 max-w-sm" onSubmit={changePassword}>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</span>
            <Input.Password
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Mật khẩu mới</span>
            <Input.Password
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <div className="pt-2">
            <Button htmlType="submit" className="w-full sm:w-auto">Đổi mật khẩu</Button>
          </div>
        </form>
      </Card>

      <Card title={<><BellOutlined className="text-primary-600 mr-2" /> Thông báo</>} className="shadow-sm">
        {notifications.length ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3 last:mb-0">
                <List.Item.Meta
                  title={<strong className="text-slate-900">{notification.title}</strong>}
                  description={<span className="text-slate-700">{notification.message}</span>}
                />
              </List.Item>
            )}
          />
        ) : (
          <EmptyState title="Không có thông báo" text="Bạn hiện không có thông báo nào mới." />
        )}
      </Card>
    </div>
  );
}
