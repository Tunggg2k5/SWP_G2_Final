import { Trash2, X } from "lucide-react";
import { Empty } from "antd";

export default function NotificationPanel({ notifications, onClose, onDelete, onDeleteAll, onMarkRead, userInitial }) {
  return (
    <div className="w-80 sm:w-96 flex flex-col bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-0.5">Hoạt động mới</p>
          <h3 className="text-base font-bold text-slate-800">Thông báo hệ thống</h3>
        </div>
        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          onClick={onClose}
          title="Đóng"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[24rem] overflow-y-auto overscroll-contain flex-1">
        {notifications.length ? (
          <div className="divide-y divide-slate-100/50">
            {notifications.map((item) => (
              <div
                className={`group flex items-start gap-3 p-4 transition-colors ${
                  item.isRead ? "bg-white" : "bg-primary-50/40"
                } hover:bg-slate-50`}
                key={item._id}
              >
                <button
                  className="flex-1 flex items-start gap-3 text-left"
                  onClick={() => onMarkRead(item)}
                  type="button"
                >
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm shadow-sm">
                    {userInitial}
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-sm ${item.isRead ? "font-medium text-slate-700" : "font-bold text-slate-900"} truncate`}>
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-snug">
                      {item.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </button>
                <button
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  onClick={() => onDelete(item)}
                  title="Xóa thông báo"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <Empty description="Chưa có thông báo mới." />
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-center">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            onClick={onDeleteAll}
            type="button"
          >
            <Trash2 size={15} />
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
