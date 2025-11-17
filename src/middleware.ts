import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/*
  L'objectif de ce middleware est de faire en sorte que la page "calendar" soit accessible, et seulement accessible, via le domaine calendar.gatsun.fr.
  Ainsi :
  - Si l'utilisateur accède à calendar.gatsun.fr, on lui sert la page /calendar
  - Si l'utilisateur accède à gatsun.fr (ou n'importe quelle autre page), on lui sert la page normalement

  Cela permet de séparer clairement le calendrier du reste du site, tout en utilisant la même codebase NextJS, et pas deux projets séparés.
*/ 

// const CALENDAR_DOMAIN = 'calendar.gatsun.fr';
// const DEV_CALENDAR_DOMAIN = 'calendar.localhost:3000';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  // const isDev = process.env.NODE_ENV === 'development';

  const isCalendarDomain = host?.split('.')[0] === 'calendar';
  // const isCalendarPath = url.pathname.startsWith('/calendar');

  if (isCalendarDomain) {
    url.pathname = `/calendar${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // if (isCalendarPath && !isDev) {
  //   const calendarUrl = new URL(request.url);
  //   calendarUrl.host = isDev ? DEV_CALENDAR_DOMAIN : CALENDAR_DOMAIN;
  //   calendarUrl.pathname = calendarUrl.pathname.replace('/calendar', '');
  //   return NextResponse.redirect(calendarUrl);
  // }

  return NextResponse.next();
}

// Ce middleware s'applique à toutes les requêtes sauf celles vers /api, les assets statiques de Next.js et le favicon
// (c'est juste une petite optimisation pour éviter d'exécuter le middleware inutilement)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};