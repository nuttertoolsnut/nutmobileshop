// ✅ โค้ดที่ 'ถูก'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ต้องมีคำว่า export นำหน้าตัวแปรที่คุณต้องการให้ไฟล์อื่นเรียกใช้
export const supabase = createClient(supabaseUrl, supabaseAnonKey);