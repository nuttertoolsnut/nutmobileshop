import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetailClient from './ProductDetailClient';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const params = await props.params;
  const id = params.id;

  // fetch data
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at the best price.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at the best price.`,
      images: [product.image_url, ...previousImages],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} at the best price.`,
      images: [product.image_url],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
