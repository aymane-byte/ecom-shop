import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status }) {
    const { cartCount, auth } = usePage().props;

    return (
        <div className="bg-[#f8f9fa] min-h-screen text-slate-900 antialiased font-sans flex flex-col justify-between">
            <Head title="Gérer mon profil - monocle." />

            <div>
                {/* 🛒 NAVIGATION MINIMALIST RESPONSIVE */}
                <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xs">
                    <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                        <Link href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 shrink-0">
                            <span className="bg-slate-900 text-white p-1.5 rounded-lg text-[10px] sm:text-xs">👓</span>
                            <span>monocle<span className="text-blue-600 font-black">.</span></span>
                        </Link>
                        {/* Secondary Desktop links */}
                        <div className="hidden md:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <Link href="/" className="text-slate-900 hover:text-slate-900 transition">Explorer nos produits</Link>
                            <span className="cursor-not-allowed">Nos nouveautés</span>
                            <span className="cursor-not-allowed">À propos de nous</span>
                        </div>
                    </div>

                    {/* Right controls area with strict responsive truncation */}
                    <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-slate-500 min-w-0">
                        {!auth?.user ? (
                            <Link href="/login" className="hover:text-slate-900 transition font-semibold text-[11px] sm:text-xs px-1">Se connecter</Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {/* Admin Panel Link */}
                                {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                    <Link href="/admin/products" className="bg-blue-50 text-blue-600 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-bold border border-blue-100 text-[10px] sm:text-xs whitespace-nowrap">
                                        Espace Admin
                                    </Link>
                                )}

                                {/* Mon Profil */}
                                <Link href="/profile" className="hover:text-slate-900 transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    Mon Profil
                                </Link>

                                {/* Mes Commandes - Réservé uniquement aux connectés */}
                                <Link href="/orders" className="hover:text-slate-900 transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    <span className="hidden sm:inline">Mes </span>commandes
                                </Link>

                                <div className="hidden sm:block h-4 w-px bg-slate-200 shrink-0" />

                                {/* User Name Badge (Hidden text on mobile to avoid layout crash) */}
                                <span className="hidden sm:inline-flex items-center gap-1 text-slate-800 font-bold max-w-[100px] truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    {auth.user.name.split(' ')[0]}
                                </span>

                                {/* Logout direct post method trigger to bypass proxy blocks */}
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="text-slate-400 hover:text-red-500 font-bold text-[10px] sm:text-xs bg-slate-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-slate-200/60 sm:border-none cursor-pointer text-left transition"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        )}

                        {/* Panier Frame Trigger */}
                        <Link href="/cart" className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-4 py-2 rounded-xl font-semibold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                            <span className="hidden sm:inline">Mon panier</span>
                            <span className="sm:hidden">🛒</span>
                            {cartCount > 0 ? (
                                <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    {cartCount}
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[9px] sm:text-[10px]">0 article(s)</span>
                            )}
                        </Link>
                    </div>
                </nav>

                <main className="max-w-4xl mx-auto space-y-6 p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Gestion de mon profil</h2>
                        <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
                            ← Retourner à la boutique
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </main>
            </div>

            {/* 🏁 FOOTER E-COMMERCE PREMIUM */}
            <footer className="bg-white border-t border-slate-200/80 mt-16 sm:mt-24">
                {/* Section Engagement & Réassurance */}
                <div className="border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                                🚚
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Livraison rapide partout au Maroc</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Recevez vos produits chez vous, rapidement et en toute sécurité.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                                💵
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Paiement à la livraison</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Payez en toute confiance à la réception de votre commande.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                                ✨
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Qualité supérieure garantie</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Des produits soigneusement sélectionnés pour votre entière satisfaction.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation & Branding Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

                        {/* Marque & Intro */}
                        <div className="md:col-span-5 space-y-3.5">
                            <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <span className="bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black">
                                    M.
                                </span>
                                <span className="font-black tracking-tighter">monocle<span className="text-blue-600">.</span></span>
                            </Link>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Votre partenaire de confiance pour des montures optiques de qualité exceptionnelle. Nous nous engageons à vous offrir un service client réactif et des prix compétitifs pour une satisfaction garantie.
                            </p>
                        </div>

                        {/* Liens Rapides */}
                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Liens utiles</h5>
                            <ul className="space-y-2 text-xs font-semibold text-slate-500">
                                <li>
                                    <Link href="/" className="hover:text-slate-900 transition">Explorer nos produits</Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-slate-900 transition">Accéder à mon panier</Link>
                                </li>
                                {auth?.user && (
                                    <li>
                                        <Link href="/orders" className="hover:text-slate-900 transition">Suivre mes commandes</Link>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Informations Légales / Contact */}
                        <div className="md:col-span-4 space-y-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Besoin d'aide ?</h5>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Une question sur nos produits ou votre commande ? Notre service client est à votre disposition pour vous accompagner.
                            </p>
                            <div className="pt-1 text-xs font-bold text-slate-800">
                                ✉️ support@monocle-optics.com
                            </div>
                        </div>

                    </div>

                    {/* Copyright & Crédits */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-medium text-slate-400">
                        <p>© {new Date().getFullYear()} monocle. Tous droits réservés.</p>
                        <div className="flex items-center gap-4">
                            <span className="hover:text-slate-600 transition cursor-pointer">Mentions légales</span>
                            <span>•</span>
                            <span className="hover:text-slate-600 transition cursor-pointer">Politique de confidentialité</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
