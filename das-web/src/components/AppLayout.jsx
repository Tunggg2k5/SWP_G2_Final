import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarPlus,
  ClipboardPenLine,
  ClipboardList,
  DoorOpen,
  FileText,
  Home,
  Menu,
  PhoneCall,
  ReceiptText,
  Settings2,
  Star,
  Stethoscope,
  UsersRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Feedback from "../components/Feedback.jsx";
import { useAuth } from "../redux/AuthContext.jsx";
import { api, getErrorMessage } from "../utils/api.js";
import { clinicDateInput, todayInput } from "../utils/format.js";
import { canUsePublicLookup, isClinicalRole, roleLabels } from "../utils/roles.js";
import { firstError, validateEmail, validateName, validatePassword, validatePhone } from "../utils/validation.js";
import ChangeUserPassword from "./user/ChangeUserPassword.jsx";
import EditUserProfile from "./user/EditUserProfile.jsx";
import LogoutButton from "./user/LogoutButton.jsx";
import NotificationPanel from "./user/NotificationPanel.jsx";
import ProfileDropdown from "./user/ProfileDropdown.jsx";
import { Layout, Drawer, Popover, Dropdown, Badge, Avatar } from "antd";

const { Header, Content } = Layout;

const receptionistTabs = [
  { id: "appointments", label: "Lịch hẹn", icon: ClipboardList },
  { id: "schedule", label: "Lịch khám", icon: CalendarDays },
  { id: "payments", label: "Hóa đơn", icon: ReceiptText },
  { id: "booking", label: "Đặt lịch hộ", icon: CalendarPlus },
  { id: "consultations", label: "Tư vấn", icon: PhoneCall }
];

const adminTabs = [
  { id: "stats", label: "Thống kê", icon: BarChart3 },
  { id: "users", label: "Tài khoản", icon: UsersRound },
  { id: "services", label: "Dịch vụ", icon: Settings2 },
  { id: "rooms", label: "Phòng khám", icon: DoorOpen },
  { id: "reviews", label: "Đánh giá", icon: Star }
];

const dentistTabs = [
  { id: "schedule", label: "Lịch khám", icon: Stethoscope },
  { id: "treatment", label: "Hồ sơ điều trị", icon: ClipboardPenLine }
];

const nurseTabs = [
  { id: "schedule", label: "Lịch khám", icon: Stethoscope },
  { id: "treatment", label: "Hồ sơ điều trị", icon: ClipboardPenLine },
  { id: "performedServices", label: "Dịch vụ đã thực hiện", icon: ReceiptText }
];

function navForRole(role) {
  if (role === "patient") {
    return [
      { id: "home", to: "/dashboard?tab=home", label: "Trang chủ", icon: Home, isTab: true },
      { id: "booking", to: "/dashboard?tab=booking", label: "Đặt lịch", icon: CalendarPlus, isTab: true },
      { id: "appointments", to: "/dashboard?tab=appointments", label: "Lịch hẹn", icon: CalendarDays, isTab: true },
      { id: "history", to: "/dashboard?tab=history", label: "Lịch sử lịch hẹn", icon: ClipboardList, isTab: true },
      { id: "records", to: "/dashboard?tab=records", label: "Hồ sơ điều trị", icon: FileText, isTab: true },
      { id: "invoices", to: "/dashboard?tab=invoices", label: "Hóa đơn", icon: ReceiptText, isTab: true }
    ];
  }
  if (role === "receptionist") return receptionistTabs.map((item) => ({ ...item, to: `/dashboard?tab=${item.id}`, isTab: true }));
  if (role === "admin") return adminTabs.map((item) => ({ ...item, to: `/dashboard?tab=${item.id}`, isTab: true }));
  if (role === "dentist") return dentistTabs.map((item) => ({ ...item, to: `/dashboard?tab=${item.id}`, isTab: true }));
  if (role === "nurse") return nurseTabs.map((item) => ({ ...item, to: `/dashboard?tab=${item.id}`, isTab: true }));

  if (!role || canUsePublicLookup(role)) return [];

  return [{ to: "/dashboard", label: "Trang chủ", icon: Home }];
}

export default function AppLayout() {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = navForRole(user?.role);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "", phone: "", gender: "unknown", address: "", bio: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [feedback, setFeedback] = useState({ message: "", error: "" });
  const [navBadges, setNavBadges] = useState({});
  const fileInputRef = useRef(null);

  const defaultTab = user?.role === "patient" ? "home" : user?.role === "admin" ? "stats" : isClinicalRole(user?.role) ? "schedule" : "appointments";
  const activeTab = new URLSearchParams(location.search).get("tab") || defaultTab;
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const userInitial = useMemo(() => user?.fullName?.trim()?.[0]?.toUpperCase() || "D", [user?.fullName]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "unknown",
      address: user.address || "",
      bio: user.bio || ""
    });
    loadNotifications();
    loadNavBadges(user.role);
  }, [user?._id, user?.fullName, user?.email, user?.phone, user?.gender, user?.address, user?.bio]);

  useEffect(() => {
    if (!user) return undefined;
    const refresh = window.setInterval(() => loadNavBadges(user.role), 60000);
    function refreshBadges() {
      loadNavBadges(user.role);
      loadNotifications();
    }
    window.addEventListener("das:refresh-badges", refreshBadges);
    return () => {
      window.clearInterval(refresh);
      window.removeEventListener("das:refresh-badges", refreshBadges);
    };
  }, [user?._id, user?.role]);

  useEffect(() => {
    setShowNotifications(false);
    setShowAccountMenu(false);
    setProfileOpen(false);
    setPasswordOpen(false);
    setMobileMenuOpen(false);
  }, [user?._id, location.pathname, location.search]);

  if (location.pathname === "/" || location.pathname === "/dat-lich-hen") {
    return <Outlet />;
  }

  async function loadNotifications() {
    try {
      const res = await api.get("/auth/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      setNotifications([]);
    }
  }

  function clearFeedback() {
    setFeedback({ message: "", error: "" });
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function scrollPageToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProfile(event) {
    if (event && event.preventDefault) event.preventDefault();
    const validationError = firstError(
      validateName(profileForm.fullName),
      profileForm.email ? validateEmail(profileForm.email) : "",
      validatePhone(profileForm.phone)
    );
    if (validationError) {
      setFeedback({ message: "", error: validationError });
      return;
    }

    try {
      const res = await api.patch("/auth/me", profileForm);
      updateUser(res.data.user);
      setProfileOpen(false);
      setShowAccountMenu(false);
      setFeedback({ message: "Đã cập nhật thông tin cá nhân.", error: "" });
    } catch (error) {
      setFeedback({ message: "", error: getErrorMessage(error) });
    }
  }

  async function changePassword(event) {
    if (event && event.preventDefault) event.preventDefault();

    const validationError = validatePassword(passwordForm.newPassword);

    if (validationError) {
      setFeedback({
        message: "",
        error: validationError
      });
      return;
    }

    try {
      await api.patch("/auth/change-password", passwordForm);

      setPasswordForm({
        currentPassword: "",
        newPassword: ""
      });

      setPasswordOpen(false);
      setShowAccountMenu(false);

      setFeedback({
        message: "Đã đổi mật khẩu. Vui lòng dùng mật khẩu mới ở lần đăng nhập tiếp theo.",
        error: ""
      });
    } catch (error) {
      setFeedback({
        message: "",
        error: getErrorMessage(error)
      });
    }
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const avatarUrl = await fileToCompressedAvatar(file);
      const res = await api.patch("/auth/me", { avatarUrl });
      updateUser(res.data.user);
      setShowAccountMenu(false);
      setFeedback({ message: "Đã cập nhật ảnh đại diện.", error: "" });
    } catch (error) {
      setFeedback({ message: "", error: error.message || getErrorMessage(error) });
    }
  }

  async function markNotificationRead(notification) {
    if (!notification?._id || notification.isRead) return;
    try {
      await api.patch(`/auth/notifications/${notification._id}/read`);
      await loadNotifications();
    } catch (error) {
      setFeedback({ message: "", error: getErrorMessage(error) });
    }
  }

  async function loadNavBadges(role) {
    try {
      const today = todayInput();
      if (role === "receptionist") {
        const res = await api.get("/reception/dashboard");
        const appointments = res.data.appointments || [];
        const consultations = res.data.consultations || [];
        setNavBadges({
          appointments: appointments.filter((item) => item.status === "pending").length,
          schedule: appointments.filter(
            (item) =>
              ["scheduled", "confirmed", "checked_in", "in_treatment"].includes(item.status) &&
              clinicDateInput(item.startAt) === today
          ).length,
          consultations: consultations.filter((item) => (item.status || "waiting") === "waiting").length
        });
        return;
      }

      if (role === "dentist" || role === "nurse") {
        const res = await api.get("/clinical/dashboard", { params: { date: today } });
        setNavBadges({ schedule: (res.data.appointments || []).length });
        return;
      }

      setNavBadges({});
    } catch {
      setNavBadges({});
    }
  }

  async function deleteNotification(notification) {
    if (!notification?._id) return;
    const previousNotifications = notifications;
    setNotifications((current) => current.filter((item) => item._id !== notification._id));
    try {
      const res = await api.delete(`/auth/notifications/${notification._id}`);
      setNotifications(res.data.notifications || []);
    } catch (error) {
      setNotifications(previousNotifications);
      setFeedback({ message: "", error: getErrorMessage(error) });
    }
  }

  async function deleteAllNotifications() {
    if (!notifications.length) return;
    const previousNotifications = notifications;
    setNotifications([]);
    try {
      await api.delete("/auth/notifications");
    } catch (error) {
      setNotifications(previousNotifications);
      setFeedback({ message: "", error: getErrorMessage(error) });
    }
  }

  return (
    <Layout className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Feedback error={feedback.error} message={feedback.message} onClear={clearFeedback} />

      <Header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            title="Mở menu"
          >
            <Menu size={24} />
          </button>

          <Link
            className="flex items-center gap-2.5 group"
            onClick={scrollPageToTop}
            to={user?.role === "patient" ? "/dashboard?tab=home" : "/"}
          >
            <div className="p-2 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl shadow-sm text-white group-hover:shadow-md transition-all">
              <Activity size={20} />
            </div>
            <span className="text-gradient font-bold text-xl hidden sm:block tracking-tight">SmileCare</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Điều hướng chính">
          {items.map((item) => {
            const Icon = item.icon;
            const badgeCount = navBadges[item.id] || 0;
            const active = item.isTab
              ? location.pathname === "/dashboard" &&
              (item.section ? location.hash === `#${item.section}` : activeTab === item.id && location.hash !== "#services")
              : false;

            const itemClasses = `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-primary-50 text-primary-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`;

            return item.isTab ? (
              <Link
                key={item.id}
                to={item.to}
                className={itemClasses}
                onClick={() => {
                  if (item.id === "home") scrollPageToTop();
                  if (user?.role) loadNavBadges(user.role);
                }}
              >
                <Icon size={18} className={active ? "text-primary-600" : "text-slate-400"} />
                <span>{item.label}</span>
                {badgeCount > 0 && (
                  <Badge count={badgeCount > 99 ? "99+" : badgeCount} className="absolute -top-1.5 -right-1.5" />
                )}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => {
                  if (user?.role) loadNavBadges(user.role);
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? "text-primary-600" : "text-slate-400"} />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge count={badgeCount > 99 ? "99+" : badgeCount} className="absolute -top-1.5 -right-1.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Popover
                content={
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onDelete={deleteNotification}
                    onDeleteAll={deleteAllNotifications}
                    onMarkRead={markNotificationRead}
                    userInitial={userInitial}
                  />
                }
                trigger="click"
                open={showNotifications}
                onOpenChange={setShowNotifications}
                placement="bottomRight"
              >
                <Badge count={unreadCount} overflowCount={9} size="small" offset={[-4, 4]}>
                  <button
                    className={`relative p-2.5 rounded-xl transition-colors ${showNotifications ? "bg-primary-50 text-primary-600" : "text-slate-500 hover:bg-slate-100"}`}
                    title="Thông báo"
                  >
                    <Bell size={20} />
                  </button>
                </Badge>
              </Popover>

              <Dropdown
                trigger={['click']}
                open={showAccountMenu}
                onOpenChange={setShowAccountMenu}
                dropdownRender={() => (
                  <ProfileDropdown
                    fileInputRef={fileInputRef}
                    onChangePassword={() => { setPasswordOpen(true); setShowAccountMenu(false); }}
                    onEditProfile={() => { setProfileOpen(true); setShowAccountMenu(false); }}
                    onLogout={handleLogout}
                    onUploadAvatar={uploadAvatar}
                    user={user}
                    userInitial={userInitial}
                  />
                )}
              >
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border-2 border-transparent hover:border-primary-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 overflow-hidden"
                  title="Tài khoản"
                >
                  {user.avatarUrl ? (
                    <Avatar src={user.avatarUrl} alt={user.fullName || "Avatar"} className="w-full h-full object-cover" />
                  ) : (
                    <Avatar className="bg-primary-100 text-primary-700 font-bold">{userInitial}</Avatar>
                  )}
                </button>
              </Dropdown>
            </>
          ) : null}
        </div>
      </Header>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg shadow-sm text-white">
              <Activity size={18} />
            </div>
            <span className="text-gradient font-bold text-lg tracking-tight">SmileCare</span>
          </div>
        }
        placement="left"
        closable={true}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const badgeCount = navBadges[item.id] || 0;
              const active = item.isTab
                ? location.pathname === "/dashboard" &&
                (item.section ? location.hash === `#${item.section}` : activeTab === item.id && location.hash !== "#services")
                : false;

              const itemClasses = `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`;

              return item.isTab ? (
                <Link
                  key={item.id}
                  to={item.to}
                  className={itemClasses}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.id === "home") scrollPageToTop();
                    if (user?.role) loadNavBadges(user.role);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={active ? "text-primary-600" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <Badge count={badgeCount > 99 ? "99+" : badgeCount} />
                  )}
                </Link>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user?.role) loadNavBadges(user.role);
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-primary-600" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <Badge count={badgeCount > 99 ? "99+" : badgeCount} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {user && (
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 mb-4">
                {user.avatarUrl ? (
                  <Avatar src={user.avatarUrl} alt="Avatar" size="large" />
                ) : (
                  <Avatar size="large" className="bg-primary-100 text-primary-700 font-bold">{userInitial}</Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{roleLabels[user.role] || user.role}</p>
                </div>
              </div>
              <LogoutButton onLogout={() => { handleLogout(); setMobileMenuOpen(false); }} />
            </div>
          )}
        </div>
      </Drawer>

      <Content className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </Content>

      {profileOpen && (
        <EditUserProfile
          form={profileForm}
          onCancel={() => setProfileOpen(false)}
          onChange={setProfileForm}
          onSubmit={saveProfile}
        />
      )}

      {passwordOpen && (
        <ChangeUserPassword
          form={passwordForm}
          onCancel={() => setPasswordOpen(false)}
          onChange={setPasswordForm}
          onSubmit={changePassword}
        />
      )}
    </Layout>
  );
}

function fileToCompressedAvatar(file) {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Chỉ hỗ trợ file ảnh."));
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxSize = 360;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không đọc được file ảnh."));
    };
    image.src = objectUrl;
  });
}
