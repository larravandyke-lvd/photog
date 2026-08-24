import Image from 'next/image';

export default function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="bg-charcoal text-paper px-5 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
      <Image src="/brand-icon.svg" alt="" width={40} height={40} className="shrink-0" />
      <div className="min-w-0">
        <h1 className="font-serif text-lg leading-tight truncate">PopPop's Collection</h1>
        {subtitle && <p className="text-amber/80 text-xs tracking-wide truncate">{subtitle}</p>}
      </div>
    </header>
  );
}
