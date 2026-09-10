import { LogOut } from "lucide-react";

export default function LogoutButton({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      type="button"
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group"
    >
      <LogOut size={19} className="group-hover:scale-110 transition-transform" />
      <span>Đăng xuất</span>
    </button>
  );
}
