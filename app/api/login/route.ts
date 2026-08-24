import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { pin, name } = await req.json();

  if (!pin || pin !== process.env.APP_PIN) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
  }

  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

  const res = NextResponse.json({ ok: true });
  res.cookies.set('gear_pin_ok', 'yes', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: TEN_YEARS, // effectively permanent — this device won't be asked again
    path: '/',
  });
  res.cookies.set('gear_user', name === 'eric' ? 'eric' : 'you', {
    secure: true,
    sameSite: 'lax',
    maxAge: TEN_YEARS,
    path: '/',
  });
  return res;
}
