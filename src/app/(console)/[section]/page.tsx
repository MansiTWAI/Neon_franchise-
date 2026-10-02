import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { findSection } from '@/lib/navigation';

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const section = findSection((await params).section);
  return { title: section?.label };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const section = findSection((await params).section);
  if (!section?.slug) notFound();

  return (
    <>
      <PageHeader title={section.label} description={section.summary} />
      <EmptyState
        icon={section.icon}
        title={`No ${section.label.toLowerCase()} yet`}
        body={section.summary}
      />
    </>
  );
}
