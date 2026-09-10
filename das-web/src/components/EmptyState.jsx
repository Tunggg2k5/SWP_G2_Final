import { Empty, Flex, Typography } from "antd";

const { Text } = Typography;

export default function EmptyState({ title = "Chưa có dữ liệu", text = "Dữ liệu sẽ xuất hiện sau khi hệ thống được cập nhật." }) {
  return (
    <Flex justify="center" style={{ padding: '64px 24px' }}>
      <Empty
        description={
          <Flex vertical align="center">
            <Text strong style={{ fontSize: 16, marginBottom: 4 }}>{title}</Text>
            <Text type="secondary" style={{ maxWidth: 300 }}>{text}</Text>
          </Flex>
        }
      />
    </Flex>
  );
}
