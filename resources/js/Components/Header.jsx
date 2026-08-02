import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { cartCount, auth } = usePage().props;
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="sticky top-0 z-40">
            <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                    Livraison gratuite partout au Maroc
                </p>
            </div>

            <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                    <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                        <span>5witm<span className="text-[#C2A65A]">.</span></span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                        <a href="#products-grid" onClick={(e) => handleSmoothScroll(e, 'products-grid')} className="text-white hover:text-[#C2A65A] transition">
                            {t('navbar.explore_products')}
                        </a>
                        <Link href="/about-us" className="text-white hover:text-[#C2A65A] transition">{t('navbar.about_us')}</Link>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => changeLanguage('fr')} className={`text-xs font-semibold ${i18n.language === 'fr' ? 'text-[#C2A65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                        FR
                    </button>
                    <span className="text-white/30">|</span>
                    <button onClick={() => changeLanguage('ar')} className={`text-xs font-semibold ${i18n.language === 'ar' ? 'text-[#CA65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                        AR
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0">
                    {!auth?.user ? (
                        <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs px-1 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span>{t('navbar.login')}</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-[10px] sm:text-xs whitespace-nowrap">
                                    {t('navbar.admin_space')}
                                </Link>
                            )}
                            <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                {t('navbar.my_profile')}
                            </Link>
                            <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                {t('navbar.my_orders')}
                            </Link>
                            <div className="hidden sm:block h-4 w-px bg-white/20 shrink-0" />
                            <span className="hidden sm:inline-flex items-center gap-1 text-white font-bold max-w-[100px] truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C2A65A] shrink-0"></span>
                                {auth.user.name.split(' ')[0]}
                            </span>
                            <button
                                onClick={() => router.post('/logout')}
                                className="text-white/50 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-[#0A4338] sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-white/15 sm:border-none cursor-pointer text-left transition"
                            >
                                {t('navbar.logout')}
                            </button>
                        </div>
                    )}

                    <Link href="/cart" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                        <span>Panier</span>
                        <span className="bg-[#0A4338] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {cartCount || 0}
                        </span>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
