import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

const navItems = [
    { href: '/admin', label: 'Dashboard', match: (url) => url === '/admin' },
    { href: '/admin/products', label: 'Produits', match: (url) => url.startsWith('/admin/products') },
    { href: '/admin/orders', label: 'Commandes', match: (url) => url.startsWith('/admin/orders') },
];

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const ordersCount = props.orders_count ?? 0;

    const getPageTitle = () => {
        if (url === '/admin') return 'Dashboard';
        if (url.includes('/products')) return 'Produits';
        if (url.includes('/orders')) return 'Commandes';
        return 'Admin';
    };

    return (
        <div className="min-h-screen bg-[#f6f6f7] text-slate-950 antialiased">
            <Head title={`Admin - ${getPageTitle()}`} />

            <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
                <Link href="/admin" className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-xs font-semibold text-white">M</span>
                    <span className="text-sm font-semibold">monocle admin</span>
                </Link>
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                >
                    {isMobileMenuOpen ? 'Fermer' : 'Menu'}
                </button>
            </div>

            {isMobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    className="fixed inset-0 z-30 bg-slate-950/20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform md:top-0 md:h-screen md:translate-x-0`}>
                <div className="hidden items-center gap-2 border-b border-slate-200 pb-4 md:flex">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">M</span>
                    <div>
                        <p className="text-sm font-semibold leading-none">monocle</p>
                        <p className="mt-1 text-[11px] text-slate-500">Espace admin</p>
                    </div>
                </div>

                <nav className="mt-5 flex-1 space-y-6" onClick={() => setIsMobileMenuOpen(false)}>
                    <div>
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Menu</p>
                        <div className="mt-2 space-y-1">
                            {navItems.map((item) => {
                                const active = item.match(url);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {item.href === '/admin/orders' && ordersCount > 0 && (
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                active ? 'bg-white/15 text-white' : 'bg-yellow-100 text-yellow-900'
                                            }`}>
                                                {ordersCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="border-t border-slate-200 pt-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Retour boutique
                    </Link>
                </div>
            </aside>

            <div className="min-w-0 md:pl-64">
                <header className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur md:flex">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Admin</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-950">{getPageTitle()}</span>
                    </div>
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-900">
                        Boutique active
                    </span>
                </header>

                <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
