import { Camera, LockKeyhole, UserPen } from "lucide-react";
import { roleLabels } from "../../utils/roles.js";
import LogoutButton from "./LogoutButton.jsx";
import { Button, Typography, Avatar, Flex } from "antd";

const { Text } = Typography;

export default function ProfileDropdown({
  fileInputRef,
  onChangePassword,
  onEditProfile,
  onLogout,
  onUploadAvatar,
  user,
  userInitial
}) {
  return (
    <div style={{ width: 256, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <Flex vertical align="center" style={{ padding: 20, backgroundColor: 'rgba(248, 250, 252, 0.8)', borderBottom: '1px solid #f1f5f9' }}>
        <Avatar
          src={user.avatarUrl}
          size={64}
          style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: 24, fontWeight: 'bold', marginBottom: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        >
          {!user.avatarUrl && userInitial}
        </Avatar>
        <Text strong style={{ fontSize: 16, width: '100%', textAlign: 'center' }} ellipsis>{user.fullName}</Text>
        <Text
          style={{ display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: 9999, backgroundColor: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 600 }}
        >
          {roleLabels[user.role] || user.role}
        </Text>
      </Flex>

      <Flex vertical style={{ padding: 8, gap: 2 }}>
        <Button type="text" block onClick={onEditProfile} icon={<UserPen size={18} style={{ color: '#94a3b8' }} />} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 12px', height: 'auto', fontWeight: 500, color: '#334155' }}>
          Thay đổi thông tin cá nhân
        </Button>

        <Button type="text" block onClick={() => fileInputRef.current?.click()} icon={<Camera size={18} style={{ color: '#94a3b8' }} />} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 12px', height: 'auto', fontWeight: 500, color: '#334155' }}>
          Đổi avatar từ thư viện
        </Button>

        <Button type="text" block onClick={onChangePassword} icon={<LockKeyhole size={18} style={{ color: '#94a3b8' }} />} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 12px', height: 'auto', fontWeight: 500, color: '#334155' }}>
          Đổi mật khẩu
        </Button>
      </Flex>

      <div style={{ padding: 8, borderTop: '1px solid #f1f5f9', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}>
        <LogoutButton onLogout={onLogout} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onUploadAvatar} />
    </div>
  );
}
