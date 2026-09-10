import { EditOutlined, SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, Space, Table, Typography, Row, Col, Flex } from "antd";

const { Text } = Typography;

function cleanPriceInput(value) {
  return String(value || "").replace(/[^\d-]/g, "");
}

export default function DentalServiceManagement({
  editingService,
  loading,
  onCancelEditService,
  onCreateService,
  onDeleteService,
  onEditingServiceChange,
  onEditService,
  onServiceFormChange,
  onUpdateService,
  serviceForm,
  services
}) {
  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: "bold", color: "#1e293b" }}>{text}</span>
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "Chưa có mô tả"
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text) => <span style={{ color: "#2563eb", fontWeight: 600 }}>{text || "0"}</span>
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEditService(record)} title="Cập nhật" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteService(record)} title="Xóa" />
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Card 
        title={
          <Space>
            <SettingOutlined style={{ color: "#2563eb" }} /> 
            <span>Thêm dịch vụ nha khoa</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <form onSubmit={onCreateService} style={{ maxWidth: 768 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong style={{ color: "#334155" }}>Tên dịch vụ</Text>
                  <Input value={serviceForm.name} onChange={(event) => onServiceFormChange({ name: event.target.value })} required />
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong style={{ color: "#334155" }}>Giá tiền</Text>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9-]+"
                    placeholder="Ví dụ: 200000 hoặc 200000-500000"
                    value={serviceForm.price}
                    onChange={(event) => onServiceFormChange({ price: cleanPriceInput(event.target.value) })}
                    required
                  />
                </Space>
              </Col>
            </Row>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong style={{ color: "#334155" }}>Mô tả</Text>
              <Input.TextArea value={serviceForm.description} onChange={(event) => onServiceFormChange({ description: event.target.value })} rows={3} />
            </Space>
            <Button type="primary" htmlType="submit">Thêm dịch vụ</Button>
          </Space>
        </form>
      </Card>

      <Card 
        title={
          <Space>
            <SettingOutlined style={{ color: "#2563eb" }} /> 
            <span>Dịch vụ</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <Table
          dataSource={services}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title="Cập nhật dịch vụ"
        open={!!editingService}
        onCancel={onCancelEditService}
        footer={null}
        destroyOnClose
      >
        {editingService && (
          <form onSubmit={onUpdateService}>
            <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Tên dịch vụ</Text>
                <Input value={editingService.name} onChange={(event) => onEditingServiceChange({ name: event.target.value })} required />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Giá tiền</Text>
                <Input
                  inputMode="numeric"
                  pattern="[0-9-]+"
                  value={editingService.price || ""}
                  onChange={(event) => onEditingServiceChange({ price: cleanPriceInput(event.target.value) })}
                  required
                />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Mô tả</Text>
                <Input.TextArea value={editingService.description || ""} onChange={(event) => onEditingServiceChange({ description: event.target.value })} rows={3} />
              </Space>
              <Flex justify="flex-end" gap="small" style={{ marginTop: 16 }}>
                <Button onClick={onCancelEditService}>Hủy</Button>
                <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
              </Flex>
            </Space>
          </form>
        )}
      </Modal>
    </Space>
  );
}
