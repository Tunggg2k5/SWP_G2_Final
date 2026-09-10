import { UsersRound } from "lucide-react";
import { useState, useEffect } from "react";
import { Carousel, Typography } from "antd";
import EmptyState from "../EmptyState.jsx";
import DentistCard from "./DentistCard.jsx";

const { Title } = Typography;

export default function DentistProfile({ dentistSlides }) {
  // Flatten slides into a single array for easier manual carousel control
  // assuming dentistSlides is an array of arrays of dentists due to old carousel format
  const dentists = dentistSlides.flat();

  // Responsive items per page logic
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };

    handleResize(); // Set initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(dentists.length / itemsPerPage);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <UsersRound size={16} />
            Đội ngũ bác sĩ
          </span>
          <Title level={2} className="text-slate-900 m-0">Bác sĩ đồng hành theo từng kế hoạch điều trị</Title>
        </div>

        {dentists.length ? (
          <div className="relative px-4 md:px-12">
            <Carousel autoplay dots={{ className: 'custom-carousel-dots' }}>
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div key={pageIndex}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
                    {dentists.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((dentist) => (
                      <div key={dentist._id} className="w-full h-full">
                        <DentistCard dentist={dentist} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="card-base p-8 text-center max-w-2xl mx-auto">
            <EmptyState title="Đang cập nhật đội ngũ bác sĩ" text="Danh sách bác sĩ sẽ hiển thị sau khi có dữ liệu trong hệ thống." />
          </div>
        )}
      </div>
    </section>
  );
}
