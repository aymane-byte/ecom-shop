import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import { trackPixelEvent } from '../../helpers/pixel';

export default function Success() {
    const { t } = useTranslation();
    const { auth, order: rawOrder, flash, cartCount } = usePage().props;
    const order = rawOrder?.data || rawOrder;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

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

    const handlePrintReceipt = () => {
        window.open(`/orders/${order?.id}/invoice`, '_blank');
    };

    // Track Purchase Meta Pixel event when order is successful
    useEffect(() => {
        if (order) {
            const items = order.items || order.order_items || [];
            const contentIds = items.map(item => item.product_id || item.product?.id).filter(Boolean);
            const numItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

            trackPixelEvent('Purchase', {
                content_ids: contentIds,
                content_type: 'product',
                value: totalAmount,
                currency: 'MAD',
                num_items: numItems,
            });
        }
    }, [order, totalAmount]);
    const estimatedDelivery = order?.estimated_delivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col relative overflow-hidden">
            {/* HEADER & NAVBAR */}
            <header className="sticky top-0 z-40">
                {/* Announcement Bar */}
                <div className="bg-[#0F5C4D] text-white text-center py-2 px-4 shadow-inner">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-3.5 sm:py-4 shadow-lg transition-all">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">

                        {/* Left: Hamburger (Mobile) + Desktop Links */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden text-white hover:text-[#C2A65A] p-2 -ml-2 transition-colors focus:outline-none"
                                aria-label="Open Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>

                            <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em]">
                                <Link href="/" className="text-white/80 hover:text-[#C2A65A] transition">
                                    {t('navbar.explore_products', 'Boutique')}
                                </Link>
                                <Link href="/about-us" className="text-white/80 hover:text-[#C2A65A] transition">
                                    {t('navbar.about_us', 'À propos')}
                                </Link>
                            </div>
                        </div>

                        {/* Center: Brand Logo */}
                        <div className="flex-1 flex justify-center text-center">
                            <Link href="/" className="text-xl sm:text-2xl font-serif tracking-widest text-white hover:opacity-90 transition">
                                5witm<span className="text-[#C2A65A]">.</span>
                            </Link>
                        </div>

                        {/* Right Section: Actions & Desktop Auth */}
                        <div className="flex items-center gap-3 sm:gap-5 justify-end">
                            {/* Desktop Auth Links */}
                            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-white/80">
                                {!auth?.user ? (
                                    <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        {t('navbar.login', 'Connexion')}
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                            <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-xs">
                                                {t('navbar.admin_space', 'Admin')}
                                            </Link>
                                        )}
                                        <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider">
                                            {t('navbar.my_profile', 'Profil')}
                                        </Link>
                                        <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider">
                                            {t('navbar.my_orders', 'Mes commandes')}
                                        </Link>
                                        <button
                                            onClick={() => router.post('/logout')}
                                            className="text-white/50 hover:text-rose-400 font-bold text-xs cursor-pointer transition"
                                        >
                                            {t('navbar.logout', 'Déconnexion')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Cart Icon (Mobile & Desktop) */}
                            <Link
                                href="/cart"
                                className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition shadow-md active:scale-95 border border-[#C2A65A]/20"
                            >
                                <svg className="w-5 h-5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">Panier</span>
                                <span className="bg-[#C2A65A] text-[#0A4338] text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Mobile Drawer (Slide-Over Navigation) */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <div className="relative w-4/5 max-w-xs bg-[#0A4338] text-white h-full shadow-2xl flex flex-col justify-between z-10 border-r border-[#C2A65A]/20 p-6 overflow-y-auto animate-fade-in-up">
                            <div>
                                {/* Drawer Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-[#C2A65A]/20">
                                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif tracking-widest text-white">
                                        5witm<span className="text-[#C2A65A]">.</span>
                                    </Link>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-white/70 hover:text-white rounded-lg transition"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <div className="mt-6 flex flex-col gap-4">
                                    <Link
                                        href="/"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-white/90 hover:text-[#C2A65A] transition text-xs font-bold uppercase tracking-widest py-2 border-b border-white/5 flex items-center justify-between"
                                    >
                                        <span>{t('navbar.explore_products', 'Boutique')}</span>
                                        <span className="text-[#C2A65A]">→</span>
                                    </Link>
                                    <Link
                                        href="/about-us"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-white/90 hover:text-[#C2A65A] transition text-xs font-bold uppercase tracking-widest py-2 border-b border-white/5 flex items-center justify-between"
                                    >
                                        <span>{t('navbar.about_us', 'À propos')}</span>
                                        <span className="text-[#C2A65A]">→</span>
                                    </Link>
                                </div>

                                {/* User Auth Section inside Drawer */}
                                <div className="mt-8 pt-6 border-t border-[#C2A65A]/20">
                                    {auth?.user ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2 mb-2 bg-[#0F5C4D] p-3 rounded-xl border border-[#C2A65A]/20">
                                                <div className="w-8 h-8 rounded-full bg-[#C2A65A] text-[#0A4338] font-bold flex items-center justify-center text-xs">
                                                    {auth.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{auth.user.name}</p>
                                                    <p className="text-[10px] text-white/60 truncate">{auth.user.email}</p>
                                                </div>
                                            </div>

                                            {(auth.user.is_admin == 1 || auth.user.is_admin === true) && (
                                                <Link
                                                    href="/admin/products"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="bg-[#C2A65A]/10 text-[#C2A65A] px-4 py-2.5 rounded-xl transition font-bold border border-[#C2A65A]/30 text-xs text-center"
                                                >
                                                    {t('navbar.admin_space', 'Admin')}
                                                </Link>
                                            )}

                                            <Link
                                                href="/profile"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-xs font-medium text-white/80 hover:text-[#C2A65A] py-2 transition flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                                {t('navbar.my_profile', 'Profil')}
                                            </Link>

                                            <Link
                                                href="/orders"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-xs font-medium text-white/80 hover:text-[#C2A65A] py-2 transition flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5l-1.5-4.5H5.25l-1.5 4.5z" /></svg>
                                                {t('navbar.my_orders', 'Mes commandes')}
                                            </Link>

                                            <button
                                                onClick={() => { setMobileMenuOpen(false); router.post('/logout'); }}
                                                className="mt-4 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 transition text-center"
                                            >
                                                {t('navbar.logout', 'Déconnexion')}
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full py-3 bg-[#C2A65A] text-[#0A4338] font-bold text-xs rounded-xl transition text-center uppercase tracking-widest block shadow-lg"
                                        >
                                            {t('navbar.login', 'Connexion')}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="pt-6 border-t border-white/10 text-center">
                                <p className="text-[10px] text-white/50">© 5witm. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                )}
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
                        <button
                            onClick={handlePrintReceipt}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C2A65A] hover:bg-[#0A4338] hover:text-white text-[#0A4338] text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {t('success.download_receipt', 'Télécharger reçu')}
                        </button>
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

            {/* TRUST & FOOTER SECTION */}
            <section id="trust-section" className="bg-[#0A4338] text-white mt-16 sm:mt-24">
                <div className="border-b border-[#C2A65A]/15">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        {[
                            { title: 'Livraison rapide', desc: 'Partout au Maroc en 24h-48h' },
                            { title: 'Paiement à la livraison', desc: 'Payez après vérification' },
                            { title: 'Retour facile', desc: 'Échange garanti sous 7 jours' },
                            { title: 'Produits de qualité', desc: 'Sélection rigoureuse et vérifiée' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-center justify-center md:justify-start gap-3.5">
                                <div className="w-10 h-10 rounded-full border border-[#C2A65A]/40 flex items-center justify-center shrink-0 text-[#C2A65A]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                                    <p className="text-[11px] text-white/60 font-medium mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-4 space-y-4">
                            <Link href="/" className="text-xl font-serif tracking-wide text-white flex items-center gap-2">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                                Votre boutique officielle pour des produits premium sélectionnés avec soin. Service client réactif et expérience d'achat 100% sécurisée.
                            </p>
                            <div className="pt-2 flex items-center gap-3">
                                <a href="https://wa.me/212754012300" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="WhatsApp">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                    </svg>
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61592792846038&mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Facebook">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="https://www.instagram.com/5witm/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Instagram">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a href="https://www.tiktok.com/@5witm?_r=1&_t=ZS-98YrYXCjT9w" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="TikTok">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.53-1.35 2.52.01 1.25.79 2.39 1.94 2.76 1.1.37 2.38.07 3.17-.75.64-.66.97-1.57.97-2.49.02-4.97-.01-9.94.02-14.91z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Navigation</h5>
                            <ul className="space-y-2 text-xs font-semibold text-white/60">
                                <li><Link href="/" className="hover:text-[#C2A65A] transition">Accueil</Link></li>
                                <li><Link href="/cart" className="hover:text-[#C2A65A] transition">Panier</Link></li>
                                <li><a href="#FAQ" className="hover:text-[#C2A65A] transition">FAQ</a></li>
                                <li><a href="#Contact" className="hover:text-[#C2A65A] transition">Contact</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Informations Légales</h5>
                            <ul className="space-y-2 text-xs font-semibold text-white/60">
                                <li><a href="#CGV" className="hover:text-[#C2A65A] transition">Conditions générales</a></li>
                                <li><a href="#Retour" className="hover:text-[#C2A65A] transition">Politique de retour</a></li>
                                <li><a href="#Livraison" className="hover:text-[#C2A65A] transition">Politique de livraison</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[C2A65A]">Besoin d'aide ?</h5>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Notre équipe est disponible du lundi au samedi de 9h à 19h pour vous accompagner.
                            </p>
                            <div className="pt-1 text-xs font-bold text-white">support@5witm.com</div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-[#C2A65A]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-medium text-white/50">
                        <p>© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                        <div className="flex items-center gap-4">
                            <a href="#CGV" className="hover:text-[#C2A65A] transition">Mentions légales</a>
                            <span>•</span>
                            <a href="#Retour" className="hover:text-[#C2A65A] transition">Confidentialité</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
