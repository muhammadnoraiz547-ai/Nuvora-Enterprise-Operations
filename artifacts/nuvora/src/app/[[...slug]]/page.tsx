import RouteContent from '@/components/RouteContent';
import { redirect } from 'next/navigation';

export default async function NuvoraPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug?.length ? `/${slug.join('/')}` : '/';

  if (path === '/') {
    redirect('/dashboard');
  }

  return <RouteContent path={path} />;
}