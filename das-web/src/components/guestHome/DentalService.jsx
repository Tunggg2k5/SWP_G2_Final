import { Sparkles } from "lucide-react";
import { Typography } from "antd";
import DentalServiceCard from "./DentalServiceCard.jsx";

const { Title, Paragraph } = Typography;

export default function DentalService({ services }) {
  return (
    <section className="py-20 bg-white" id="services">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={16} />
            Dịch vụ của chúng tôi
          </span>
          <Title level={2} className="text-gradient mb-6">Chăm Sóc Toàn Diện Cho Nụ Cười Của Bạn</Title>
          <Paragraph className="text-slate-600 text-lg">Từ kiểm tra định kỳ đến các giải pháp thẩm mỹ nha khoa, SmileCare đồng hành cùng bạn trong từng bước điều trị.</Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <DentalServiceCard service={service} key={service._id || service.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
