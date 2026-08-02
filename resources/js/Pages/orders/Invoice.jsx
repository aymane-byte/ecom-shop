import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function Invoice() {
    const { t } = useTranslation();
    const { order: rawOrder, auth } = usePage().props;
    const order = rawOrder?.data || rawOrder;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!order) {
        return (
            <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-bold text-[#111111]">Facture introuvable</h1>
                    <Link href="/orders" className="mt-4 inline-block text-[#0F5C4D] hover:text-[#0A4338] font-semibold">Retour aux commandes</Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatPrice = (price) => `${Number(price || 0).toFixed(2)} DH`;

    const items = order.items || order.order_items || [];
    const subtotal = order.subtotal || items.reduce((sum, item) => sum + (Number(item.price || item.unit_price || 0) * (item.quantity || 1)), 0);
    const shippingCost = Number(order.shipping_cost || 0);
    const total = Number(order.total_amount || order.total || (subtotal + shippingCost));
    const invoiceNumber = order.invoice_number || `INV-${String(order.id || 0).padStart(5, '0')}`;

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans">
            {/* HEADER */}
            <header className="sticky top-0 z-50">
                <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 shadow-lg">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
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
                        </div>

                        <div className="flex-1 flex justify-center">
                            <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0 flex-1 justify-end">
                            <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs">
                                {t('navbar.my_orders', 'Mes commandes')}
                            </Link>
                            <Link href="/about-us" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs">
                                {t('navbar.about_us', 'À propos')}
                            </Link>
                            <Link href="/" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold transition shadow-sm shrink-0">
                                {t('navbar.explore_products', 'Boutique')}
                            </Link>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-[#C2A65A]/20 flex flex-col gap-4">
                            <Link
                                href="/orders"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.my_orders', 'Mes commandes')}
                            </Link>
                            <Link
                                href="/about-us"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.about_us', 'À propos')}
                            </Link>
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-[#0F5C4D] text-white px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-[0.15em] text-center"
                            >
                                {t('navbar.explore_products', 'Boutique')}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* PRINT / ACTION BAR */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0A4338] tracking-tight">{t('invoice.title', 'Facture')}</h1>
                        <p className="text-[11px] text-white/60 font-medium mt-1">{invoiceNumber}</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition print:hidden"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.819c.24.03.48.05.721.05.553 0 1.083-.128 1.555-.364l.965-.482a3.75 3.75 0 011.585-.364h.022a3.75 3.75 0 011.585.364l.965.482c.472.236 1.002.364 1.555.364.24 0 .48-.02.721-.05m-9.5-3.18L4.8 7.2m1.92 3.44l1.92-3.44m0 0L9.6 7.2m1.92 3.44l1.92-3.44M19.2 7.2l-1.92 3.44m1.92-3.44l-1.44-2.4a.75.75 0 00-.6-.36H6.24a.75.75 0 00-.6.36L4.8 7.2m14.4 0a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V7.95a.75.75 0 01.75-.75h1.5z" />
                        </svg>
                        {t('invoice.print', 'Imprimer')}
                    </button>
                </div>

                {/* INVOICE CARD */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
                    {/* INVOICE HEADER */}
                    <div className="bg-[#0A4338] text-white px-6 sm:px-10 py-8 sm:py-10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                            <div>
                                <Link href="/" className="text-2xl font-serif tracking-wide text-[#C2A65A]">
                                    5witm<span className="text-[#C2A65A]">.</span>
                                </Link>
                                <p className="text-[11px] text-white/60 font-medium mt-2 max-w-xs leading-relaxed">
                                    Boutique premium en ligne. Acier inoxydable, livraison gratuite partout au Maroc.
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C2A65A]">{t('invoice.invoice_number', 'N° Facture')}</h2>
                                <p className="text-sm font-bold text-white mt-1">{invoiceNumber}</p>
                                <p className="text-[11px] text-white/60 font-medium mt-2">{formatDate(order.created_at || order.order_date)}</p>
                            </div>
                        </div>
                    </div>

                    {/* BILL TO */}
                    <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-[#E5E7EB]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">{t('invoice.bill_to', 'Facturé à')}</h3>
                                <div className="text-xs font-semibold text-[#6B7280] space-y-0.5">
                                    <p className="font-bold text-[#111111]">{order.customer_name || auth?.user?.name || '—'}</p>
                                    <p>{order.customer_email || '—'}</p>
                                    <p>{order.customer_phone || '—'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">{t('invoice.ship_to', 'Livré à')}</h3>
                                <div className="text-xs font-semibold text-[#6B7280] space-y-0.5">
                                    <p>{order.customer_address || '—'}</p>
                                    <p>{order.customer_city || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="px-6 sm:px-10 py-6 sm:py-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-[10px] font-black uppercase tracking-widest text-white/60 pb-3 pr-4">{t('invoice.item', 'Article')}</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-white/60 pb-3 px-4 text-center hidden sm:table-cell">{t('invoice.quantity', 'Qté')}</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-white/60 pb-3 px-4 text-right">{t('invoice.unit_price', 'Prix unitaire')}</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-white/60 pb-3 pl-4 text-right">{t('invoice.total', 'Total')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-xs text-white/60 font-medium py-8">{t('invoice.no_items', 'Aucun article')}</td>
                                    </tr>
                                ) : (
                                    items.map((item, idx) => (
                                        <tr key={item.id || idx} className="border-b border-[#E5E7EB] last:border-0">
                                            <td className="py-3.5 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center overflow-hidden shrink-0">
                                                        {item.product?.image || item.image ? (
                                                            <img src={item.product?.image || item.image} alt="" className="max-w-full max-h-full object-contain" />
                                                        ) : (
                                                            <span className="text-[8px] text-neutral-300 font-bold">N/A</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-[#111111] truncate">{item.product?.name || item.name || 'Produit'}</p>
                                                        <p className="text-[10px] text-white/60 font-medium sm:hidden">Qté: {item.quantity || 1}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center text-xs font-semibold text-neutral-600 hidden sm:table-cell">{item.quantity || 1}</td>
                                            <td className="py-3.5 px-4 text-right text-xs font-semibold text-neutral-600">{formatPrice(item.price || item.unit_price)}</td>
                                            <td className="py-3.5 pl-4 text-right text-xs font-bold text-[#111111]">{formatPrice((Number(item.price || item.unit_price || 0)) * (item.quantity || 1))}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTALS */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full sm:w-72 space-y-2.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-neutral-600">
                                    <span>{t('invoice.subtotal', 'Sous-total')}</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-neutral-600">
                                    <span>{t('invoice.shipping', 'Livraison')}</span>
                                    <span>{shippingCost === 0 ? t('invoice.free', 'Gratuite') : formatPrice(shippingCost)}</span>
                                </div>
                                <div className="border-t border-neutral-200 pt-3 flex justify-between items-center">
                                    <span className="text-sm font-black text-[#0A4338] uppercase tracking-wider">{t('invoice.total', 'Total')}</span>
                                    <span className="text-lg font-black text-[#0A4338]">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAYMENT INFO */}
                    <div className="bg-neutral-50 border-t border-[#E5E7EB] px-6 sm:px-10 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">{t('invoice.payment_method', 'Méthode de paiement')}</h4>
                                <p className="text-xs font-bold text-[#111111]">{order.payment_method || 'Paiement à la livraison'}</p>
                            </div>
                            <div className="sm:text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1.5">{t('invoice.order_status', 'Statut')}</h4>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#C2A65A]/10 border-[#C2A65A]/30 text-[#C2A65A] uppercase tracking-wider">
                                    {order.status || 'En attente'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* THANK YOU */}
                    <div className="bg-[#0A4338] px-6 sm:px-10 py-6 text-center">
                        <p className="text-[11px] text-[#C2A65A] font-bold uppercase tracking-widest">{t('invoice.thank_you', 'Merci pour votre confiance')}</p>
                        <p className="text-[10px] text-neutral-500 font-medium mt-1">5witm — {new Date().getFullYear()}</p>
                    </div>
                </div>

                <div className="mt-6 text-center print:hidden">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#0F5C4D] transition uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        {t('invoice.back_to_orders', 'Retour aux commandes')}
                    </Link>
                </div>
            </main>
        </div>
    );
}
