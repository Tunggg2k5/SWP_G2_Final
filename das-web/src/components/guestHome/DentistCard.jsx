import { Card, Typography, Tag, Avatar } from "antd";

const { Title, Text } = Typography;

export default function DentistCard({ dentist }) {
  const yearsOfExperience = Number(dentist.yearsOfExperience || dentist.experienceYears || 0);
  const experienceText = yearsOfExperience ? `${yearsOfExperience} năm kinh nghiệm` : "Kinh nghiệm đang cập nhật";
  const description = dentist.description || dentist.bio || "Thông tin bác sĩ đang được cập nhật từ hệ thống.";
  const initial = dentist.fullName?.trim()?.[0]?.toUpperCase() || "B";

  return (
    <Card 
      style={{ textAlign: "center", height: "100%", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      styles={{ body: { display: "flex", flexDirection: "column", alignItems: "center", height: "100%", padding: 24 } }}
    >
      <div style={{ marginBottom: 20 }}>
        {dentist.avatarUrl ? (
          <Avatar src={dentist.avatarUrl} size={110} style={{ border: "4px solid #f0f9ff", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }} />
        ) : (
          <Avatar size={110} style={{ backgroundColor: "#e0f2fe", color: "#0284c7", fontSize: 36, fontWeight: 700, border: "4px solid #f0f9ff" }}>
            {initial}
          </Avatar>
        )}
      </div>
      <Title level={4} style={{ color: "#1e293b", marginBottom: 8 }}>{dentist.fullName}</Title>
      <Tag color="cyan" style={{ borderRadius: 12, padding: "2px 10px", marginBottom: 12, fontWeight: 600 }}>
        {experienceText}
      </Tag>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6, flexGrow: 1 }}>
        {description}
      </Text>
    </Card>
  );
}
