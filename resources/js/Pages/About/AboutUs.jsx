import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function AboutUs() {
    const { t } = useTranslation();
    const { auth, cartCount } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col justify-between">
            <Head title="À propos - 5witm." />

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
                                <Link href="/about-us" className="text-[#C2A65A] hover:text-[#2D7A69] transition">{t('navbar.about_us')}</Link>
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
                                    <Link href="/orders" className="text-[#C2A65A] hover:text-[#2D7A69] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5 hidden sm:inline">
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
                                <span className="bg-[#0A4338] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                    {cartCount || 0}
                                </span>
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
                                className="text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.about_us')}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 flex-1">
                {/* HERO SECTION */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="text-[10px] sm:text-xs font-semibold text-[#0F5C4D] uppercase tracking-[0.35em]">
                        Notre Histoire
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0A4338] mt-4 mb-6 leading-tight">
                        À propos de 5witm
                    </h1>
                    <p className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Votre destination premium pour des accessoires de qualité supérieure, sélectionnés avec passion et livrés partout au Maroc.
                    </p>
                </div>

                {/* STORY SECTION */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#C2A65A]/10 border border-[#C2A65A]/30 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-serif text-xl sm:text-2xl text-[#0A4338] mb-3">Notre Histoire</h2>
                            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                                5witm est né d'une passion pour l'élégance et la qualité. Nous avons commencé avec une vision simple : offrir aux Marocains des produits premium accessibles, sans compromis sur la qualité. Notre voyage a commencé avec une sélection minutieuse de montres, bijoux et accessoires qui allient style et durabilité.
                            </p>
                        </div>
                    </div>
                </div>
                {/* HIGH VISIBILITY LUXURY SOCIAL MEDIA SECTION */}
                <div className="bg-gradient-to-br from-[#0A4338] via-[#0A4338] to-[#0A4338] border border-[#C2A65A]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#C2A65A]/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="text-center mb-6">
                        <span className="text-[10px] font-bold text-[#C2A65A] uppercase tracking-[0.3em]">Rejoignez la communauté</span>
                        <h3 className="font-serif text-xl sm:text-2xl text-white mt-1">Suivez 5witm sur les réseaux</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/212600000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0A4338]/80 border border-[#C2A65A]/15 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-white/70 hover:text-emerald-400 transition-all duration-300 group"
                        >
                            <svg className="w-6 h-6 fill-current mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            <span className="text-xs font-semibold">WhatsApp</span>
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0A4338]/80 border border-[#C2A65A]/15 hover:border-pink-500/60 hover:bg-pink-950/20 text-white/70 hover:text-pink-400 transition-all duration-300 group"
                        >
                            <svg className="w-6 h-6 fill-current mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span className="text-xs font-semibold">Instagram</span>
                        </a>

                        {/* TikTok */}
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0A4338]/80 border border-[#C2A65A]/15 hover:border-[#C2A65A]/60 hover:bg-[#0A4338] text-white/70 hover:text-[#C2A65A] transition-all duration-300 group"
                        >
                            <svg className="w-6 h-6 fill-current mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.36 1.53-1.35 2.52.01 1.25.79 2.39 1.94 2.76 1.1.37 2.38.07 3.17-.75.64-.66.97-1.57.97-2.49.02-4.97-.01-9.94.02-14.91z"/>
                            </svg>
                            <span className="text-xs font-semibold">TikTok</span>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0A4338]/80 border border-[#C2A65A]/15 hover:border-blue-500/60 hover:bg-blue-950/20 text-white/70 hover:text-blue-400 transition-all duration-300 group"
                        >
                            <svg className="w-6 h-6 fill-current mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span className="text-xs font-semibold">Facebook</span>
                        </a>
                    </div>
                </div>
                {/* MISSION & VALUES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 className="font-serif text-lg text-[#0A4338] mb-3">Notre Mission</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Rendre l'achat en ligne simple, sûr et agréable. Nous croyons en la transparence, l'intégrité et la construction de relations durables avec nos clients. Chaque produit que nous proposons est sélectionné avec soin pour garantir votre satisfaction.
                        </p>
                    </div>

                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                        </div>
                        <h3 className="font-serif text-lg text-[#0A4338] mb-3">Nos Valeurs</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Qualité, authenticité et service client exceptionnel. Nous nous engageons à offrir des produits qui dépassent vos attentes et une expérience d'achat qui vous fidélisera.
                        </p>
                    </div>
                </div>

                {/* WHY CHOOSE US */}
                <div className="bg-[#0A4338] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#C2A65A] mb-8 text-center">Pourquoi nous choisir ?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: 'truck', title: 'Livraison Gratuite', desc: 'Partout au Maroc en 24h-48h' },
                            { icon: 'shield', title: 'Qualité Premium', desc: 'Produits sélectionnés et vérifiés' },
                            { icon: 'refresh', title: 'Retour Facile', desc: 'Échange garanti sous 7 jours' },
                            { icon: 'headset', title: 'Support 24/7', desc: 'Service client réactif et disponible' },
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-14 h-14 mx-auto rounded-full border border-[#C2A65A]/40 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        {item.icon === 'truck' && <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />}
                                        {item.icon === 'shield' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3 7.356A9.001 9.001 0 005.74 5.743M12 21a9.001 9.001 0 008.257-5.743M9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c.414 0 .75-.336.75-.75s-.336-.75-.75-.75-.75.336-.75.75.336.75.75.75zm-.375 0h.008v.015h-.008V9.75z" />}
                                        {item.icon === 'refresh' && <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.65h4.992v-.001M4.031 4.03v4.992m0-4.992l3.182 3.183a8.25 8.25 0 0013.803-3.7m0 0l-3.182-3.183a8.25 8.25 0 00-13.803 3.7" />}
                                        {item.icon === 'headset' && <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />}
                                    </svg>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                                <p className="text-xs text-white/60">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>



                {/* CTA SECTION */}
                <div className="text-center bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 shadow-sm">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#0A4338] mb-4">Prêt à découvrir notre collection ?</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
                        Explorez notre sélection de produits premium et profitez de la livraison gratuite partout au Maroc.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-xl transition shadow-md"
                    >
                        Découvrir la boutique
                    </Link>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-16">
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
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-6 space-y-4">
                            <Link href="/" className="text-xl font-serif tracking-wide text-[#C2A65A] flex items-center gap-2">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                                Votre boutique officielle pour des produits premium sélectionnés avec soin. Service client réactif et expérience d'achat 100% sécurisée.
                            </p>
                        </div>

                        <div className="md:col-span-6 flex flex-col md:items-end justify-center">
                            <div className="text-xs font-bold text-white">support@5witm.com</div>
                            <p className="text-[11px] text-white/50 mt-2">© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
