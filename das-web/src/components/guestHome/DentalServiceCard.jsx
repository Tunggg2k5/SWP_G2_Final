import { Stethoscope, Activity, Sparkles, Smile } from "lucide-react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const iconMap = {
  implant: <Activity size={24} color="#0284c7" />,
  cosmetic: <Sparkles size={24} color="#f43f5e" />,
  ortho: <Smile size={24} color="#0d9488" />,
  general: <Stethoscope size={24} color="#f59e0b" />
};

const bgMap = {
  implant: "#f0f9ff",
  cosmetic: "#fff1f2",
  ortho: "#f0fdfa",
  general: "#fffbeb"
};

export default function DentalServiceCard({ service }) {
  const icon = iconMap[service.accent] || <Stethoscope size={24} color="#64748b" />;
  const bgColor = bgMap[service.accent] || "#f8fafc";

  return (
    <Card 
      style={{ height: "100%", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      styles={{ body: { display: "flex", flexDirection: "column", height: "100%", padding: 24 } }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        {icon}
      </div>
      <Title level={4} style={{ color: "#1e293b", marginBottom: 8 }}>{service.name}</Title>
      {service.priceText && <Text strong style={{ color: "#0284c7", marginBottom: 12, display: "block", fontSize: 16 }}>{service.priceText}</Text>}
      <Text style={{ color: "#64748b", lineHeight: 1.6, flexGrow: 1 }}>{service.description}</Text>
    </Card>
  );
}
