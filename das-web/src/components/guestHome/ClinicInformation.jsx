import { CalendarDays, CheckCircle2, Clock, MapPin, UsersRound, ThumbsUp } from "lucide-react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function ClinicInformation({ address, dentistCount, roomCount }) {
  return (
    <section className="py-16 bg-primary-700 text-white relative overflow-hidden" id="about">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-teal-200 bg-teal-900/50 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <CheckCircle2 size={16} />
            Về SmileCare
          </span>
          <Title level={2} className="text-white mb-6">Không gian điều trị hiện đại, lịch hẹn rõ ràng</Title>
          <div className="flex flex-wrap justify-center gap-8 text-primary-100">
            <span className="flex items-center gap-2">
              <Clock size={20} className="text-teal-300" />
              Hằng tuần, 8h-11h30 và 14h-17h30
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Card className="bg-white/10 border-none text-center h-full rounded-2xl" bordered={false} styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
            <div className="p-4 bg-primary-600/50 rounded-full mb-4">
              <MapPin size={32} className="text-teal-300" />
            </div>
            <div>
              <strong className="block text-xl font-bold text-white mb-2">Vị trí trung tâm</strong>
              <span className="text-sm text-primary-200 block">{address || "Địa chỉ phòng khám đang được cập nhật."}</span>
            </div>
          </Card>

          <Card className="bg-white/10 border-none text-center h-full rounded-2xl" bordered={false} styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
            <div className="p-4 bg-primary-600/50 rounded-full mb-4">
              <CalendarDays size={32} className="text-teal-300" />
            </div>
            <div>
              <strong className="block text-xl font-bold text-white mb-2">{roomCount ? `${roomCount} phòng` : "Chưa có"} điều trị</strong>
              <span className="text-sm text-primary-200 block">Trang thiết bị hiện đại, vô trùng.</span>
            </div>
          </Card>

          <Card className="bg-white/10 border-none text-center h-full rounded-2xl" bordered={false} styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
            <div className="p-4 bg-primary-600/50 rounded-full mb-4">
              <UsersRound size={32} className="text-teal-300" />
            </div>
            <div>
              <strong className="block text-xl font-bold text-white mb-2">{dentistCount}+ Bác sĩ</strong>
              <span className="text-sm text-primary-200 block">Giàu kinh nghiệm, tận tâm.</span>
            </div>
          </Card>

          <Card className="bg-white/10 border-none text-center h-full rounded-2xl" bordered={false} styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>
            <div className="p-4 bg-primary-600/50 rounded-full mb-4">
              <ThumbsUp size={32} className="text-teal-300" />
            </div>
            <div>
              <strong className="block text-xl font-bold text-white mb-2">10,000+ Khách hàng</strong>
              <span className="text-sm text-primary-200 block">Hài lòng với nụ cười mới.</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
