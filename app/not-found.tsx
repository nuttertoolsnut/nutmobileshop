import Link from 'next/link'
import { Button, Result } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Result
        status="404"
        title="404"
        subTitle="ขออภัย ไม่พบหน้าที่คุณต้องการ"
        extra={
          <Link href="/">
            <Button type="primary" size="large" icon={<HomeOutlined />}>
              กลับสู่หน้าหลัก
            </Button>
          </Link>
        }
      />
    </div>
  )
}
