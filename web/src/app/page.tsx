import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <p>บริการวางแผนบ้านโดยสถาปนิก</p>
      <h1>รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง</h1>
      <p>เลือกความต้องการทีละขั้น และดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว</p>
      <Link href="/configurator">เริ่มออกแบบบ้าน</Link>
    </main>
  );
}
