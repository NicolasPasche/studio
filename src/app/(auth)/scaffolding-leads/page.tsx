'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScaffoldingLeadsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/opportunities');
  }, [router]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-64" />
    </div>
  );
}
