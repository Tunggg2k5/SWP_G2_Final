import { Camera, LockKeyhole, UserPen } from "lucide-react";
import { roleLabels } from "../../utils/roles.js";
import LogoutButton from "./LogoutButton.jsx";

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
    <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
      <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center text-center">
        <span className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold shadow-md mb-3 ring-4 ring-white">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className="w-full h-full object-cover" />
          ) : (
            userInitial
          )}
        </span>
        <strong className="text-base font-bold text-slate-800 truncate w-full">{user.fullName}</strong>
        <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold tracking-wide">
          {roleLabels[user.role] || user.role}
        </span>
      </div>

      <div className="p-2 space-y-0.5">
        <button
          onClick={onEditProfile}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
        >
          <UserPen size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
          <span className="flex-1 text-left">Thay đổi thông tin cá nhân</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
        >
          <Camera size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
          <span className="flex-1 text-left">Đổi avatar từ thư viện</span>
        </button>

        <button
          onClick={onChangePassword}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
        >
          <LockKeyhole size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
          <span className="flex-1 text-left">Đổi mật khẩu</span>
        </button>
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50/50">
        <LogoutButton onLogout={onLogout} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onUploadAvatar} />
    </div>
  );
}
