import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DoorOpen } from "lucide-react";
import { Button, Card, Input, Modal, Select, Space, Table, Typography, Row, Col, Flex } from "antd";

const { Text } = Typography;

export default function ClinicRoomManagement({
  dentistUsers,
  editingRoom,
  loading,
  nurseUsers,
  onCancelEditRoom,
  onCreateRoom,
  onEditingRoomChange,
  onEditRoom,
  onDeleteRoom,
  onRoomFormChange,
  onUpdateRoom,
  roomForm,
  rooms
}) {
  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: "bold", color: "#1e293b" }}>{text}</span>
    },
    {
      title: "Bác sĩ phụ trách",
      key: "assignedDentist",
      render: (_, record) => record.assignedDentist?.fullName || "Chưa gán bác sĩ"
    },
    {
      title: "Y tá phụ trách",
      key: "assignedNurse",
      render: (_, record) => record.assignedNurse?.fullName || "Không gán y tá"
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEditRoom(record)} title="Cập nhật" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteRoom(record)} title="Xóa" />
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Card 
        title={
          <Space>
            <DoorOpen size={20} style={{ color: "#2563eb" }} /> 
            <span>Tạo phòng khám</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <form onSubmit={onCreateRoom}>
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Tên phòng</Text>
                <Input value={roomForm.name} onChange={(event) => onRoomFormChange({ name: event.target.value })} required />
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Bác sĩ phụ trách</Text>
                <Select style={{ width: "100%" }} value={roomForm.assignedDentist} onChange={(value) => onRoomFormChange({ assignedDentist: value })}>
                  <Select.Option value="">Chưa gán</Select.Option>
                  {dentistUsers.map((dentist) => (
                    <Select.Option key={dentist._id} value={dentist._id}>{dentist.fullName}</Select.Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Y tá phụ trách</Text>
                <Select style={{ width: "100%" }} value={roomForm.assignedNurse} onChange={(value) => onRoomFormChange({ assignedNurse: value })}>
                  <Select.Option value="">Không gán</Select.Option>
                  {nurseUsers.map((nurse) => (
                    <Select.Option key={nurse._id} value={nurse._id}>{nurse.fullName}</Select.Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col span={24}>
              <Button type="primary" htmlType="submit">Thêm phòng</Button>
            </Col>
          </Row>
        </form>
      </Card>

      <Card 
        title={
          <Space>
            <DoorOpen size={20} style={{ color: "#2563eb" }} /> 
            <span>Phòng khám</span>
          </Space>
        } 
        style={{ boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
      >
        <Table
          dataSource={rooms}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title="Cập nhật phòng khám"
        open={!!editingRoom}
        onCancel={onCancelEditRoom}
        footer={null}
        destroyOnClose
      >
        {editingRoom && (
          <form onSubmit={onUpdateRoom}>
            <Space direction="vertical" size="middle" style={{ width: "100%", marginTop: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Tên phòng</Text>
                <Input value={editingRoom.name} onChange={(event) => onEditingRoomChange({ name: event.target.value })} required />
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Bác sĩ phụ trách</Text>
                <Select style={{ width: "100%" }} value={editingRoom.assignedDentist} onChange={(value) => onEditingRoomChange({ assignedDentist: value })}>
                  <Select.Option value="">Chưa gán</Select.Option>
                  {dentistUsers.map((dentist) => (
                    <Select.Option key={dentist._id} value={dentist._id}>{dentist.fullName}</Select.Option>
                  ))}
                </Select>
              </Space>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#334155" }}>Y tá phụ trách</Text>
                <Select style={{ width: "100%" }} value={editingRoom.assignedNurse} onChange={(value) => onEditingRoomChange({ assignedNurse: value })}>
                  <Select.Option value="">Không gán</Select.Option>
                  {nurseUsers.map((nurse) => (
                    <Select.Option key={nurse._id} value={nurse._id}>{nurse.fullName}</Select.Option>
                  ))}
                </Select>
              </Space>
              <Flex justify="flex-end" gap="small" style={{ marginTop: 16 }}>
                <Button onClick={onCancelEditRoom}>Hủy</Button>
                <Button type="primary" htmlType="submit">Lưu cập nhật</Button>
              </Flex>
            </Space>
          </form>
        )}
      </Modal>
    </Space>
  );
}
