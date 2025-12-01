import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data: product, error: pError } = await supabase
    .from('products')
    .select('*')
    .eq('id', 4)
    .single();

  const { data: variants, error: vError } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', 4);

  return NextResponse.json({
    product,
    pError,
    variants,
    vError
  });
}
