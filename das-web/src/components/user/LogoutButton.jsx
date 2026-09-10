import { LogOut } from "lucide-react";
import { Button } from "antd";

export default function LogoutButton({ onLogout }) {
  return (
    <Button
      onClick={onLogout}
      type="text"
      danger
      block
      icon={<LogOut size={16} />}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 12px', height: 'auto', fontWeight: 500 }}
    >
      Đăng xuất
    </Button>
  );
}
