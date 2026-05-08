import { Link } from "react-router-dom";
import PageShell from "../../shared/layouts/PageShell/PageShell";
import styles from "./ServicesSupport.module.css";

const SERVICES = [
  {
    title: "Khảo sát & thiết kế giải pháp",
    desc: "Khảo sát hiện trường, xác định KPI, thiết kế kiến trúc và BOM triển khai.",
  },
  {
    title: "Tích hợp & triển khai onsite",
    desc: "Tích hợp robot/PLC/SCADA/vision/IoT, chạy thử và nghiệm thu theo checklist.",
  },
  {
    title: "Đào tạo & chuyển giao",
    desc: "Tài liệu vận hành/bảo trì, đào tạo đội ngũ kỹ thuật và quy trình xử lý sự cố.",
  },
  {
    title: "Bảo trì & hỗ trợ 24/7",
    desc: "Hỗ trợ từ xa, backup/restore, theo dõi log và xử lý sự cố theo SLA.",
  },
  {
    title: "Nâng cấp & tối ưu",
    desc: "Tối ưu cycle time, giảm lỗi, nâng độ ổn định và chuẩn hóa vận hành.",
  },
  {
    title: "Bảo mật & an toàn vận hành",
    desc: "Phân quyền, audit, hardening cơ bản cho hệ thống điều khiển và dữ liệu.",
  },
];

export default function ServicesSupport() {
  return (
    <main className="page">
      <div className="container">
        <p className="page-eyebrow">Dịch vụ & Hỗ trợ</p>
        <h1>
          Dịch vụ <span className="green">và Hỗ Trợ</span>
        </h1>
        <p className="page-desc">Đây là trang Dịch vụ & Hỗ trợ</p>
      </div>
    </main>
  );
}
