import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

const statusConfig = {
    pending: { label: 'En attente', bg: 'bg-[#C2A65A]/10', text: 'text-[#C2A65A]', border: 'border-[#C2A65A]/30', dot: 'bg-[#C2A65A]' },
    processing: { label: 'En traitement', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    shipped: { label: 'Expédiée', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    delivered: { label: 'Livrée', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    cancelled: { label: 'Annulée', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    returned: { label: 'Retournée', bg: 'bg-[#F8F7F4]', text: 'text-[#6B7280]', border: 'border-[#E5E7EB]', dot: 'bg-[#6B7280]' },
};

const getStatusConfig = (status) => statusConfig[status?.toLowerCase()] || statusConfig.pending;

export default function Index() {
    const { t } = useTranslation();
    const { auth, orders: rawOrders } = usePage().props;
    const orders = rawOrders?.data || rawOrders || [];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const toggleExpand = (orderId) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status?.toLowerCase() === filterStatus);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatPrice = (price) => `${Number(price || 0).toFixed(2)} DH`;

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col justify-between">
            {/* HEADER */}
            <header className="sticky top-0 z-50">
                <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 shadow-lg">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-white p-1.5 hover:text-[#C2A65A] transition shrink-0"
                                aria-label="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    )}
                                </svg>
                            </button>

                            <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                                <Link href="/" className="text-white hover:text-[#C2A65A] transition">{t('navbar.explore_products')}</Link>
                                <Link href="/about-us" className="text-white hover:text-[#C2A65A] transition">{t('navbar.about_us')}</Link>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center">
                            <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0 flex-1 justify-end">
                            {!auth?.user ? (
                                <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs px-1 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    <span className="hidden sm:inline">{t('navbar.login')}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                    {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                        <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-[10px] sm:text-xs whitespace-nowrap">
                                            {t('navbar.admin_space')}
                                        </Link>
                                    )}
                                    <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5 hidden sm:inline">
                                        {t('navbar.my_profile')}
                                    </Link>
                                    <Link href="/orders" className="text-[#C2A65A] hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5 hidden sm:inline">
                                        {t('navbar.my_orders')}
                                    </Link>
                                    <div className="hidden sm:block h-4 w-px bg-white/20 shrink-0" />
                                    <span className="hidden sm:inline-flex items-center gap-1 text-white font-bold max-w-[100px] truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2A65A] shrink-0"></span>
                                        {auth.user.name.split(' ')[0]}
                                </span>
                                    <button onClick={() => router.post('/logout')} className="text-white/50 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-[#0A4338] sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-white/20 sm:border-none cursor-pointer text-left transition">
                                        {t('navbar.logout')}
                                    </button>
                                </div>
                            )}

                            <Link href="/cart" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                                <span className="hidden sm:inline">Panier</span>
                                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.11-9L11.25 5.25M7.5 14.25L4.5 20.25m3-6h10.5l1.5-6H5.25l-.383-1.437a1.125 1.125 0 00-1.087-.835H2.25m0 0L4.5 20.25m16.5-6l-1.5 6m-7.5 0v-3.75" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-[#C2A65A]/20 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.explore_products')}
                            </Link>
                            <Link
                                href="/about-us"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.about_us')}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
                <div className="mb-6 sm:mb-10 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A4338] tracking-tight">{t('orders.my_orders_title', 'Mes commandes')}</h1>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-2 font-medium">{t('orders.my_orders_subtitle', 'Suivez et gérez toutes vos commandes en un seul endroit.')}</p>
                </div>

                {/* STATUS FILTERS */}
                <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${
                            filterStatus === 'all'
                                ? 'bg-[#0A4338] text-[#C2A65A] border-[#0A4338] shadow-md'
                                : 'bg-white text-neutral-600 border-neutral-200/80 hover:border-[#C2A65A] hover:text-[#0F5C4D]'
                        }`}
                    >
                        Toutes
                    </button>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(key)}
                            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition border ${
                                filterStatus === key
                                    ? 'bg-[#0A4338] text-[#C2A65A] border-[#0A4338] shadow-md'
                                    : 'bg-white text-neutral-600 border-neutral-200/80 hover:border-[#C2A65A] hover:text-[#0F5C4D]'
                            }`}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 sm:p-16 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#C2A65A]/10 border border-[#C2A65A]/30 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 11-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.057.435 1.119.993z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">{t('orders.no_orders_title', 'Aucune commande')}</h3>
                        <p className="text-xs text-[#6B7280] mt-2 font-medium">{t('orders.no_orders_subtitle', 'Vous n\'avez pas encore passé de commande.')}</p>
                        <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition">
                            {t('orders.start_shopping', 'Découvrir la boutique')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredOrders.map((order) => {
                            const status = getStatusConfig(order.status);
                            const isExpanded = expandedOrderId === order.id;
                            const items = order.items || order.order_items || [];

                            return (
                                <div key={order.id} className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden transition hover:shadow-md">
                                    <button
                                        onClick={() => toggleExpand(order.id)}
                                        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-neutral-50/50 transition"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl ${status.bg} ${status.border} border flex items-center justify-center shrink-0`}>
                                                <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`}></span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs sm:text-sm font-bold text-[#111111] truncate">
                                                    {t('orders.order_number', 'Commande')} #{order.id?.toString().padStart(4, '0') || 'N/A'}
                                                </h3>
                                                <p className="text-[10px] sm:text-[11px] text-[#6B7280] font-medium mt-0.5">{formatDate(order.created_at || order.order_date)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{t('orders.total', 'Total')}</p>
                                                <p className="text-sm font-black text-[#111111]">{formatPrice(order.total_amount || order.total)}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border} uppercase tracking-wider`}>
                                                {status.label}
                                            </span>
                                            <svg className={`w-4 h-4 text-[#6B7280] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-[#E5E7EB] p-4 sm:p-5 bg-[#F8F7F4]/30 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{t('orders.shipping_address', 'Adresse de livraison')}</h4>
                                                    <div className="text-xs font-semibold text-[#6B7280] space-y-0.5">
                                                        <p>{order.customer_name || auth?.user?.name || '—'}</p>
                                                        <p>{order.customer_phone || '—'}</p>
                                                        <p>{order.customer_address || '—'}</p>
                                                        <p>{order.customer_city || '—'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{t('orders.payment_info', 'Paiement')}</h4>
                                                    <div className="text-xs font-semibold text-[#6B7280] space-y-0.5">
                                                        <p>{t('orders.method', 'Méthode')}: <span className="text-[#111111] font-bold">{order.payment_method || 'Paiement à la livraison'}</span></p>
                                                        <p>{t('orders.status', 'Statut')}: <span className="text-[#111111] font-bold">{status.label}</span></p>
                                                        <p>{t('orders.date', 'Date')}: <span className="text-[#111111] font-bold">{formatDate(order.created_at || order.order_date)}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {items.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{t('orders.items', 'Articles')}</h4>
                                                    <div className="space-y-2">
                                                        {items.map((item, idx) => (
                                                            <div key={item.id || idx} className="flex items-center gap-3 bg-white border border-neutral-200/70 rounded-xl p-2.5">
                                                                <div className="w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {item.product?.image || item.image ? (
                                                                        <img src={item.product?.image || item.image} alt={item.product?.name || item.name} className="max-w-full max-h-full object-contain" />
                                                                    ) : (
                                                                        <span className="text-[8px] text-neutral-300 font-bold">N/A</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-[#111111] truncate">{item.product?.name || item.name || 'Produit'}</p>
                                                                    <p className="text-[10px] text-[#6B7280] font-medium">Qté: {item.quantity || 1}</p>
                                                                </div>
                                                                <p className="text-xs font-black text-[#111111] shrink-0">{formatPrice(item.price || item.unit_price)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{t('orders.total', 'Total')}:</p>
                                                    <p className="text-base font-black text-[#0A4338]">{formatPrice(order.total_amount || order.total)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {order.invoice_url && (
                                                        <Link href={order.invoice_url} className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:border-[#C2A65A] text-[#6B7280] hover:text-[#0F5C4D] text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                            </svg>
                                                            {t('orders.invoice', 'Facture')}
                                                        </Link>
                                                    )}
                                                    <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1.5 bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition">
                                                        {t('orders.view_details', 'Détails')}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <Link href="/" className="text-lg font-serif tracking-wide text-white">
                            5witm<span className="text-[#C2A65A]">.</span>
                        </Link>
                        <p className="text-[11px] text-white/50 font-medium">© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
