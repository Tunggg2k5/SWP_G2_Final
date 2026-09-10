import { Trash2, X } from "lucide-react";
import { Empty, Button, Typography, Flex, Avatar } from "antd";

const { Text } = Typography;

export default function NotificationPanel({ notifications, onClose, onDelete, onDeleteAll, onMarkRead, userInitial }) {
  return (
    <div style={{ width: 384, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <Flex align="center" justify="space-between" style={{ padding: 16, borderBottom: '1px solid #f1f5f9', backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
        <div>
          <Text style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, display: 'block' }}>Hoạt động mới</Text>
          <Text strong style={{ fontSize: 16, color: '#1e293b' }}>Thông báo hệ thống</Text>
        </div>
        <Button type="text" shape="circle" icon={<X size={18} />} onClick={onClose} />
      </Flex>

      <div style={{ maxHeight: 384, overflowY: 'auto' }}>
        {notifications.length ? (
          <Flex vertical>
            {notifications.map((item) => (
              <Flex
                key={item._id}
                style={{
                  padding: 16,
                  backgroundColor: item.isRead ? '#fff' : 'rgba(238, 242, 255, 0.4)',
                  borderBottom: '1px solid rgba(241, 245, 249, 0.5)'
                }}
              >
                <div style={{ flex: 1, display: 'flex', gap: 12, cursor: 'pointer', textAlign: 'left' }} onClick={() => onMarkRead(item)}>
                  <Avatar style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 'bold' }}>{userInitial}</Avatar>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <Text strong={!item.isRead} style={{ color: item.isRead ? '#334155' : '#0f172a', display: 'block' }} ellipsis>{item.title}</Text>
                    <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.message}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, fontWeight: 500, display: 'block' }}>{new Date(item.createdAt).toLocaleString("vi-VN")}</Text>
                  </div>
                </div>
                <Button type="text" danger icon={<Trash2 size={16} />} onClick={() => onDelete(item)} style={{ flexShrink: 0 }} />
              </Flex>
            ))}
          </Flex>
        ) : (
          <div style={{ padding: 32 }}>
            <Empty description="Chưa có thông báo mới." />
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <Flex justify="center" style={{ padding: 12, borderTop: '1px solid #f1f5f9', backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
          <Button type="text" danger icon={<Trash2 size={15} />} onClick={onDeleteAll} style={{ fontWeight: 500 }}>
            Xóa tất cả
          </Button>
        </Flex>
      )}
    </div>
  );
}
