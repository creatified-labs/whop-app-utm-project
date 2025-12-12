import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	// Block /dev routes in production
	if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/dev')) {
		return NextResponse.rewrite(new URL('/404', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: '/dev/:path*',
};
