'use client';

import type { EventContentArg } from '@fullcalendar/core';

type CalendarEventContentProps = {
  arg: EventContentArg;
};

export default function CalendarEventContent({ arg }: CalendarEventContentProps) {
  const members = arg.event.extendedProps.members;
  const isRecurring = arg.event.extendedProps.repeat_weekly > 0;
  const eventStart = arg.event.start ? new Date(arg.event.start) : null;
  const eventEnd = arg.event.end ? new Date(arg.event.end) : null;
  const startString = eventStart
    ? eventStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
    : '';
  const endString = eventEnd
    ? eventEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
    : '';
  const durationMinutes =
    eventStart && eventEnd ? (eventEnd.getTime() - eventStart.getTime()) / 60000 : 0;
  const isCompactEvent = durationMinutes > 0 && durationMinutes < 45;
  const isSelected = arg.isSelected;

  return (
    <div
      style={{ height: 'calc(100% - 6px)' }}
      className={`relative translate-y-0.5 px-0.5 py-0.5 overflow-hidden w-full bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg ring-3 ${isSelected ? 'ring-4' : ''} ring-white outline-2 outline-orange-600 hover:outline-orange-700 sm:px-2 sm:py-1.5 ${isCompactEvent ? 'flex items-center  text-center' : ''}`}
    >
      {isRecurring && (
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-white/30 rounded-full flex items-center justify-center">
          <svg
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </div>
      )}
      {isCompactEvent ? (
        <div className="font-semibold break-normal text-[10px] leading-3 sm:leading-4 sm:text-xs md:text-sm">
          {arg.event.title}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <div className="font-semibold break-normal text-[10px] leading-3 sm:leading-4 sm:text-xs md:text-sm">
              {arg.event.title}
            </div>
          </div>
          <div className="mt-0.5 text-[9px] sm:text-[11px] leading-3 sm:leading-4 opacity-90 break-normal">
            {members}
            <br />
            {startString}-{endString}
          </div>
        </>
      )}
    </div>
  );
}
