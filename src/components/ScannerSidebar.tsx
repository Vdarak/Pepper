'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ScannerSidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/scanners/horizontal-resistance', label: 'Horizontal Resistance' },
    { href: '/scanners/vcp', label: 'VCP' },
    { href: '/scanners/flags-pennants', label: 'Flags & Pennants' },
  ];

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-6">Scanners</h2>
      <nav className="space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-md transition-colors ${
              pathname === link.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
