import React, { useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function Success() {
    const { t } = useTranslation();
    const { auth, order: rawOrder, flash } = usePage().props;
    const order = rawOrder?.data || rawOrder;

    useEffect(() => {
        const confettiScriptId = 'confetti-script';
        if (!document.getElementById(confettiScriptId)) {
            const script = document.createElement('script');
            script.id = confettiScriptId;
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
            script.onload = () => {
                if (window.confetti) {
                    const duration = 2500;
                    const end = Date.now() + duration;
                    const colors = ['#0F5C4D', '#2D7A69', '#C2A65A', '#F8F7F4'];

                    (function frame() {
                        window.confetti({
                            particleCount: 3,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0 },
                            colors: colors,
                        });
                        window.confetti({
                            particleCount: 3,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1 },
                            colors: colors,
                        });
                        if (Date.now() < end) {
                            requestAnimationFrame(frame);
                        }
                    })();
                }
            };
            document.body.appendChild(script);
        }
    }, []);

    const formatPrice = (price) => `${Number(price || 0).toFixed(2)} DH`;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const orderNumber = order?.id ? `#${String(order.id).padStart(4, '0')}` : '#0000';
    const totalAmount = order?.total_amount || order?.total || 0;
    const estimatedDelivery = order?.estimated_delivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col">
            {/* HEADER */}
            <header className="sticky top-0 z-50">
                <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center shadow-lg">
                    <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                        <span>5witm<span className="text-[#C2A65A]">.</span></span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0">
                        {!auth?.user ? (
                            <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs">
                                {t('navbar.login', 'Connexion')}
                            </Link>
                        ) : (
                            <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs">
                                {t('navbar.my_orders', 'Mes commandes')}
                            </Link>
                        )}
                        <Link href="/about-us" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs">
                            {t('navbar.about_us', 'À propos')}
                        </Link>
                        <Link href="/" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold transition shadow-sm shrink-0">
                            {t('navbar.explore_products', 'Boutique')}
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
                <div className="max-w-lg w-full">
                    {/* SUCCESS ICON */}
                    <div className="text-center mb-8">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-[#C2A65A]/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-20 h-20 rounded-full bg-[#0A4338] border-2 border-[#C2A65A] flex items-center justify-center shadow-xl">
                                <svg className="w-10 h-10 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A4338] tracking-tight">
                            {t('success.title', 'Commande confirmée !')}
                        </h1>
                        <p className="text-xs sm:text-sm text-white/50 mt-3 font-medium leading-relaxed max-w-sm mx-auto">
                            {t('success.subtitle', 'Merci pour votre achat. Nous avons bien reçu votre commande et nous vous contacterons bientôt pour la livraison.')}
                        </p>
                    </div>

                    {/* ORDER SUMMARY CARD */}
                    <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-[#0A4338] px-5 sm:px-7 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#C2A65A]">{t('success.order_number', 'N° Commande')}</p>
                                <p className="text-base font-bold text-white mt-0.5">{orderNumber}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#C2A65A]/10 border border-[#C2A65A]/30 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 11-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.057.435 1.119.993z" />
                                </svg>
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-5 space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#6B7280] uppercase tracking-wider">{t('success.date', 'Date')}</span>
                                <span className="font-semibold text-[#6B7280]">{formatDate(order?.created_at || order?.order_date)}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#6B7280] uppercase tracking-wider">{t('success.payment_method', 'Paiement')}</span>
                                <span className="font-semibold text-[#6B7280]">{order?.payment_method || 'Paiement à la livraison'}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#6B7280] uppercase tracking-wider">{t('success.estimated_delivery', 'Livraison estimée')}</span>
                                <span className="font-semibold text-[#0F5C4D]">{estimatedDelivery}</span>
                            </div>

                            <div className="border-t border-[#E5E7EB] pt-4 flex items-center justify-between">
                                <span className="text-sm font-black text-[#0A4338] uppercase tracking-wider">{t('success.total', 'Total')}</span>
                                <span className="text-xl font-black text-[#0A4338]">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* TRACKING STEPS */}
                    <div className="mt-6 bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">{t('success.tracking_title', 'Suivi de commande')}</h3>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -z-0"></div>
                            <div className="absolute top-4 left-0 h-0.5 bg-[#C2A65A] -z-0 transition-all duration-500" style={{ width: '33%' }}></div>

                            {[
                                { label: t('success.step_confirmed', 'Confirmée'), active: true, icon: 'check' },
                                { label: t('success.step_processing', 'En traitement'), active: false, icon: 'box' },
                                { label: t('success.step_shipped', 'Expédiée'), active: false, icon: 'truck' },
                            ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                                        step.active
                                            ? 'bg-[#0F5C4D] border-[#0F5C4D] text-white'
                                            : 'bg-white border-neutral-200 text-neutral-300'
                                    }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                            {step.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />}
                                            {step.icon === 'box' && <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.311M21 7.5v2.25m0-2.25l-2.25 1.311M3 7.5l2.25 1.311M3 7.5v2.25m0-2.25l2.25-1.311m0 0L12 3l6.75 3.75M5.25 9.75v9.75L12 21l6.75-6.75V9.75" />}
                                            {step.icon === 'truck' && <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />}
                                        </svg>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step.active ? 'text-[#0F5C4D]' : 'text-[#6B7280]'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {auth?.user && (
                            <Link
                                href="/orders"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md"
                            >
                                {t('success.view_orders', 'Mes commandes')}
                            </Link>
                        )}
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#C2A65A] text-[#6B7280] hover:text-[#0F5C4D] text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition"
                        >
                            {t('success.continue_shopping', 'Continuer mes achats')}
                        </Link>
                    </div>

                    {/* SUPPORT NOTE */}
                    <p className="mt-8 text-center text-[11px] text-[#6B7280] font-medium leading-relaxed max-w-sm mx-auto">
                        {t('success.support_note', 'Une question sur votre commande ? Contactez-nous à support@5witm.com ou via WhatsApp.')}
                    </p>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <Link href="/" className="text-lg font-serif tracking-wide text-[#C2A65A]">
                            5witm<span className="text-[#C2A65A]">.</span>
                        </Link>
                        <p className="text-[11px] text-white/50 font-medium">© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
