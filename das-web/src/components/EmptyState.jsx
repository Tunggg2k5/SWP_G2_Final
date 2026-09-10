import { Empty } from "antd";

export default function EmptyState({ title = "Chưa có dữ liệu", text = "Dữ liệu sẽ xuất hiện sau khi hệ thống được cập nhật." }) {
  return (
    <div className="py-16 px-6 animate-fade-in flex justify-center">
      <Empty
        description={
          <div>
            <strong className="text-base font-semibold text-slate-700 mb-1 block">{title}</strong>
            <span className="text-sm text-slate-500 max-w-xs block">{text}</span>
          </div>
        }
      />
    </div>
  );
}
