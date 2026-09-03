import Image from 'next/image';
import Link from 'next/link';

export default function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="bg-charcoal text-paper px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
      <Link href="/" className="flex items-center gap-3 min-w-0">
        <Image src="/brand-icon.svg" alt="" width={40} height={40} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-lg leading-tight truncate">PopPop's Collection</h1>
          {subtitle && <p className="text-amber/80 text-xs tracking-wide truncate">{subtitle}</p>}
        </div>
      </Link>
      <a
        href="https://portals-gateway.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#34a574] hover:text-[#3fc188]"
        style={{ fontFamily: 'Georgia,serif' }}
      >
        <svg width="18" height="18" viewBox="0 0 64 64"><defs><linearGradient id="pmg1" x1="4" y1="2" x2="60" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#f6e3b4"/><stop offset=".5" stopColor="#c9a24b"/><stop offset="1" stopColor="#7a5a35"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="url(#pmg1)"/><circle cx="32" cy="32" r="26" fill="none" stroke="#1b1207" strokeOpacity=".28" strokeWidth="1.5"/><text x="32" y="43" fontFamily="Georgia,serif" fontStyle="italic" fontWeight="700" fontSize="30" fill="#1b1207" textAnchor="middle">V</text></svg>
        Portal Menu
      </a>
    </header>
  );
}
