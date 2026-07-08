import Link from 'next/link';

export function Nav() {
  return (
    <nav className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
      <Link className="text-sm font-semibold tracking-wide text-zinc-100" href="/">
        Spread Studio
      </Link>
      <div className="flex items-center gap-1 text-sm">
        <Link className="rounded px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50" href="/">
          Trade
        </Link>
        <Link data-testid="nav-positions" className="rounded px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50" href="/positions">
          Positions
        </Link>
        <Link className="rounded px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50" href="/orders">
          Orders
        </Link>
        <Link className="rounded px-3 py-1.5 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50" href="/analytics">
          Analytics
        </Link>
      </div>
    </nav>
  );
}
