'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CalendarClient from '@/components/CalendarClient';

export default function CalendarPageClient() {
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  const showViewerBadge = typeof viewerCount === 'number' && viewerCount > 1;
  const viewerLabel = showViewerBadge ? `${viewerCount} personnes en ligne` : '';

  return (
    <main className="bg-slate-950 min-h-screen flex flex-col text-slate-100">
      <header className="hidden md:block border-b border-slate-100/10 bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/30 px-4 md:px-8">
        <nav className="container mx-auto h-16 md:h-20 flex justify-between items-center">
          <Link className="h-full flex items-center gap-3 md:gap-4" href="/">
            <Image src="/logo.png" alt="Gatsun Logo" width={48} height={48} className="md:w-16 md:h-16 translate-y-0.5" />
            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-lg drop-shadow-white/20">Calendrier</span>
          </Link>
          {showViewerBadge && (
            <div className="flex items-center gap-2 rounded-full border border-slate-100/15 bg-slate-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              <span>{viewerLabel}</span>
            </div>
          )}
        </nav>
      </header>

      <div className="flex-1 flex flex-col md:p-8">
        <div className="max-w-400 mx-auto w-full">
          <CalendarClient onViewerCountChange={setViewerCount} />
        </div>
      </div>
    </main>
  );
}
