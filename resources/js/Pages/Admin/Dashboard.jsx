import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function canonicalStatus(status) {
    const value = String(status || 'en_attente');
    const legacy = {
        'pay\u00c3\u00a9': 'pay\u00e9',
        'exp\u00c3\u00a9di\u00c3\u00a9': 'exp\u00e9di\u00e9',
        'livr\u00c3\u00a9': 'livr\u00e9',
    };

    return legacy[value] || value;
}

function StatusBadge({ status }) {
    const key = canonicalStatus(status);
    const styles = {
        en_attente: 'bg-yellow-100 text-yellow-900',
        'pay\u00e9': 'bg-green-100 text-green-900',
        'exp\u00e9di\u00e9': 'bg-blue-100 text-blue-900',
        'livr\u00e9': 'bg-slate-200 text-slate-800',
    };
    const labels = {
        en_attente: 'En attente',
        'pay\u00e9': 'Payee',
        'exp\u00e9di\u00e9': 'Expediee',
        'livr\u00e9': 'Livree',
    };

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[key] || styles.en_attente}`}>
            {labels[key] || key.replace('_', ' ')}
        </span>
    );
}

export default function Dashboard({ stats }) {
    const revenue = Number(stats.chiffre_affaires || 0);
    const chartData = [
        { name: 'Jan', CA: revenue * 0.35 },
        { name: 'Fev', CA: revenue * 0.5 },
        { name: 'Mar', CA: revenue * 0.45 },
        { name: 'Avr', CA: revenue * 0.7 },
        { name: 'Mai', CA: revenue * 0.85 },
        { name: 'Juin', CA: revenue },
    ];

    const cards = [
        { label: "Chiffre d'affaires", value: money(stats.chiffre_affaires), detail: 'Commandes payees et traitees' },
        { label: 'Commandes', value: stats.total_orders, detail: 'Total commandes' },
        { label: 'Clients', value: stats.total_clients, detail: 'Comptes inscrits' },
        { label: 'Stock bas', value: stats.out_of_stock, detail: 'Produits en rupture', danger: stats.out_of_stock > 0 },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Vue generale</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/products/create" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Nouveau produit
                        </Link>
                        <Link href="/admin/orders" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
                            Voir commandes
                        </Link>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                            <p className={`mt-2 text-2xl font-semibold ${card.danger ? 'text-red-700' : 'text-slate-950'}`}>{card.value}</p>
                            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                        </div>
                    ))}
                </div>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Performance commerciale</h2>
                            <p className="mt-1 text-sm text-slate-500">Estimation des ventes sur les derniers mois.</p>
                        </div>
                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">6 mois</span>
                    </div>
                    <div className="h-72 min-w-0 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#111827" stopOpacity={0.16} />
                                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#eef2f7" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} tickFormatter={(value) => `${Number(value).toFixed(0)}`} />
                                <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }} />
                                <Area type="monotone" dataKey="CA" stroke="#111827" strokeWidth={2} fill="url(#salesArea)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-12">
                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:col-span-2 xl:col-span-5">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <h2 className="text-base font-semibold text-slate-950">Dernieres commandes</h2>
                            <Link href="/admin/orders" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Tout voir</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(stats.recent_orders || []).map((order) => (
                                <div key={order.id} className="flex items-center justify-between gap-4 p-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-950">#{order.id}</p>
                                        <p className="mt-1 truncate text-sm text-slate-500">{order.client_name}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-semibold text-slate-950">{money(order.total_price)}</p>
                                        <div className="mt-2"><StatusBadge status={order.status} /></div>
                                    </div>
                                </div>
                            ))}
                            {(stats.recent_orders || []).length === 0 && (
                                <p className="p-6 text-sm text-slate-500">Aucune commande recente.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:col-span-2 xl:col-span-4">
                        <div className="border-b border-slate-200 p-4">
                            <h2 className="text-base font-semibold text-slate-950">Meilleurs produits</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {(stats.top_products || []).map((product) => (
                                <div key={product.id || product.name} className="flex items-center justify-between gap-3 p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                                            {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold text-slate-400">N/A</span>}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-950">{product.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">{money(product.price)}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{product.total_sold} u</span>
                                </div>
                            ))}
                            {(stats.top_products || []).length === 0 && (
                                <p className="p-6 text-sm text-slate-500">Aucune vente produit.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-3">
                        <h2 className="text-base font-semibold text-slate-950">Operations</h2>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Panier moyen</p>
                                <p className="mt-2 text-xl font-semibold text-slate-950">{money(stats.panier_moyen)}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ruptures</p>
                                <p className={`mt-2 text-xl font-semibold ${stats.out_of_stock > 0 ? 'text-red-700' : 'text-green-800'}`}>{stats.out_of_stock}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
