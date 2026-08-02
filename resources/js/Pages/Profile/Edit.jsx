import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { useTranslation } from 'react-i18next';

export default function Edit({ mustVerifyEmail, status }) {
    const { cartCount, auth } = usePage().props;
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col justify-between overflow-x-hidden">
            <Head title="Mon Profil - 5witm." />

            <div>
                {/* NAVIGATION */}
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
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => changeLanguage('fr')} className={`text-xs font-semibold ${i18n.language === 'fr' ? 'text-[#C2A65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                                FR
                            </button>
                            <span className="text-white/30">|</span>
                            <button onClick={() => changeLanguage('ar')} className={`text-xs font-semibold ${i18n.language === 'ar' ? 'text-[#C2A65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                                AR
                            </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                    <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-[10px] sm:text-xs whitespace-nowrap">
                                        {t('navbar.admin_space')}
                                    </Link>
                                )}
                                <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.my_orders')}
                                </Link>
                                <Link href="/about-us" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.about_us')}
                                </Link>
                                <div className="hidden sm:block h-4 w-px bg-white/20 shrink-0" />
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="text-white/50 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-[#0A4338] sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-white/20 sm:border-none cursor-pointer text-left transition"
                                >
                                    {t('navbar.logout')}
                                </button>
                            </div>

                            <Link href="/cart" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                                <span>Panier</span>
                                <span className="bg-[#0A4338] text-[#C2A65A] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="max-w-4xl mx-auto space-y-8 p-6 sm:p-12">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-4 border-b border-[#E5E7EB] pb-6">
                        <h2 className="font-serif text-3xl text-[#0A4338]">Gestion du compte</h2>
                        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#0F5C4D] hover:text-[#0A4338] transition">
                            ← Retour à la collection
                        </Link>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB]/80 shadow-sm">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB]/80 shadow-sm">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </main>
            </div>

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-16 sm:mt-24">
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
                        <div className="md:col-span-6 space-y-4">
                            <Link href="/" className="text-xl font-serif tracking-wide text-white flex items-center gap-2">
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
