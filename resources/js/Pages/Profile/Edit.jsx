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
        <div className="bg-[#faf7f0] min-h-screen text-neutral-900 antialiased font-sans flex flex-col justify-between overflow-x-hidden">
            <Head title="Mon Profil - 5witm." />

            <div>
                {/* NAVIGATION (Copie conforme de Welcome) */}
                <header className="sticky top-0 z-40">
                    <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-neutral-950 text-center py-2.5 px-4">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                            Livraison gratuite partout au Maroc
                        </p>
                    </div>

                    <nav className="bg-neutral-950/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                            <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-amber-400 flex items-center gap-1.5 shrink-0">
                                <span>5witm<span className="text-amber-300">.</span></span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => changeLanguage('fr')} className={`text-xs font-semibold ${i18n.language === 'fr' ? 'text-amber-400 font-bold' : 'text-neutral-500'} hover:text-amber-400 transition`}>
                                FR
                            </button>
                            <span className="text-neutral-700">|</span>
                            <button onClick={() => changeLanguage('ar')} className={`text-xs font-semibold ${i18n.language === 'ar' ? 'text-amber-400 font-bold' : 'text-neutral-500'} hover:text-amber-400 transition`}>
                                AR
                            </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-neutral-400 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                    <Link href="/admin/products" className="bg-amber-500/10 text-amber-400 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition font-bold border border-amber-500/30 text-[10px] sm:text-xs whitespace-nowrap">
                                        {t('navbar.admin_space')}
                                    </Link>
                                )}
                                <Link href="/orders" className="hover:text-amber-400 transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.my_orders')}
                                </Link>
                                <Link href="/about-us" className="hover:text-amber-400 transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.about_us')}
                                </Link>
                                <div className="hidden sm:block h-4 w-px bg-neutral-700 shrink-0" />
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="text-neutral-500 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-neutral-900 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-neutral-700 sm:border-none cursor-pointer text-left transition"
                                >
                                    {t('navbar.logout')}
                                </button>
                            </div>

                            <Link href="/cart" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                                <span>Panier</span>
                                <span className="bg-neutral-950 text-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="max-w-4xl mx-auto space-y-8 p-6 sm:p-12">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-4 border-b border-neutral-200 pb-6">
                        <h2 className="font-serif text-3xl text-neutral-950">Gestion du compte</h2>
                        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition">
                            ← Retour à la collection
                        </Link>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-100 shadow-sm">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </main>
            </div>

            {/* FOOTER (Copie conforme de Welcome) */}
            <footer className="bg-neutral-950 text-neutral-100 mt-16 sm:mt-24">
                <div className="border-b border-amber-500/15">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        {[
                            { title: 'Livraison rapide', desc: 'Partout au Maroc en 24h-48h' },
                            { title: 'Paiement à la livraison', desc: 'Payez après vérification' },
                            { title: 'Retour facile', desc: 'Échange garanti sous 7 jours' },
                            { title: 'Produits de qualité', desc: 'Sélection rigoureuse et vérifiée' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-center justify-center md:justify-start gap-3.5">
                                <div className="w-10 h-10 rounded-full border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">{item.title}</h4>
                                    <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-6 space-y-4">
                            <Link href="/" className="text-xl font-serif tracking-wide text-amber-400 flex items-center gap-2">
                                <span>5witm<span className="text-amber-300">.</span></span>
                            </Link>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                                Votre boutique officielle pour des produits premium sélectionnés avec soin. Service client réactif et expérience d'achat 100% sécurisée.
                            </p>
                        </div>
                        <div className="md:col-span-6 flex flex-col md:items-end justify-center">
                            <div className="text-xs font-bold text-neutral-100">support@5witm.com</div>
                            <p className="text-[11px] text-neutral-500 mt-2">© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
