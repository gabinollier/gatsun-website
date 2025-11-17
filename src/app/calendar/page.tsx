import type { Metadata } from 'next';
import CalendarPageClient from '@/components/CalendarPageClient';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CalendarPage() {
  return <CalendarPageClient />;
}