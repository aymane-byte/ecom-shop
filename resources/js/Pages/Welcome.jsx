import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function Welcome({ products }) {
    const { cartCount, flash, auth } = usePage().props;

    const handleAddToCart = (productId) => {
        router.post(`/cart/add/${productId}`, {}, { preserveScroll: true });
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen text-slate-900 antialiased font-sans flex flex-col justify-between">

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
                            <Link href="/" className="text-slate-900 hover:text-slate-900 transition">Boutique</Link>
                            <span className="cursor-not-allowed">Collections</span>
                            <span className="cursor-not-allowed">À Propos</span>
                        </div>
                    </div>

                    {/* Right controls area with strict responsive truncation */}
                    <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-slate-500 min-w-0">
                        {!auth?.user ? (
                            <Link href="/login" className="hover:text-slate-900 transition font-semibold text-[11px] sm:text-xs px-1">Connexion</Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {/* Admin Panel Link */}
                                {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                    <Link href="/admin/products" className="bg-blue-50 text-blue-600 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-bold border border-blue-100 text-[10px] sm:text-xs whitespace-nowrap">
                                        Admin
                                    </Link>
                                )}

                                {/* Mes Commandes - Réservé uniquement aux connectés */}
                                <Link href="/orders" className="hover:text-slate-900 transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    <span className="hidden sm:inline">Mes </span>Commandes
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
                                    Quitter
                                </button>
                            </div>
                        )}

                        {/* Panier Frame Trigger */}
                        <Link href="/cart" className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-4 py-2 rounded-xl font-semibold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                            <span className="hidden sm:inline">Panier</span>
                            <span className="sm:hidden">🛒</span>
                            {cartCount > 0 ? (
                                <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    {cartCount}
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[9px] sm:text-[10px]">0</span>
                            )}
                        </Link>
                    </div>
                </nav>

                {/* 📦 MAIN CONTENT BLOCK */}
                <main className="w-full px-4 sm:px-6 md:px-14 py-8 sm:py-12">

                    {/* STUDIO HERO TITLE */}
                    <div className="mb-8 sm:mb-12 border-b border-slate-200/60 pb-6 sm:pb-8 text-center flex flex-col items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md">Édition 2026</span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-3">Lunettes & Montures d'Optique</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto px-2">
                            Compositions minimalistes, matériaux de haute précision et confort visuel certifié par nos spécialistes.
                        </p>
                    </div>

                    {/* Notifications Clean */}
                    {flash && (flash.success || flash.error) && (
                        <div className={`mb-8 p-4 rounded-xl text-xs font-semibold border ${
                            flash.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                            {flash.success || flash.error}
                        </div>
                    )}

                    {/* PRODUCT MINIMALIST GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6 items-stretch">
                        {products && products.map((product) => (
                            <div key={product.id} className="bg-white border border-slate-200/60 rounded-2xl p-2 sm:p-3 flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:shadow-md group h-full">

                                <Link href={`/products/${product.id}`} className="block flex-1 min-w-0">
                                    {/* Image Container (Studio Frame) */}
                                    <div className="bg-[#fcfcfd] rounded-xl aspect-square overflow-hidden flex items-center justify-center p-3 sm:p-6 border border-slate-100 relative shadow-inner">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-103"
                                            />
                                        ) : (
                                            <span className="text-slate-300 text-[10px] sm:text-xs font-medium">Aucun visuel</span>
                                        )}

                                        {/* Stock Indicators Badges */}
                                        {product.stock <= 0 ? (
                                            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[7px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md">
                                                Épuisé
                                            </span>
                                        ) : product.stock <= 3 ? (
                                            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-amber-50 border border-amber-100 text-amber-600 text-[7px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md">
                                                Limité
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="pt-2 sm:pt-3 px-0.5 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight capitalize truncate group-hover:text-blue-600 transition">
                                            {product.name}
                                        </h3>
                                        <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed hidden sm:block h-8 overflow-hidden text-ellipsis">
                                            {product.description || "Monture optique ultra-légère conçue pour un usage quotidien."}
                                        </p>
                                    </div>
                                </Link>

                                {/* Info & Action Row */}
                                <div className="pt-2 sm:pt-3 mt-2 sm:mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-0.5 shrink-0">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] sm:text-xs text-slate-400 font-medium hidden sm:inline">Prix unitaire</span>
                                        <span className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight">
                                            {Number(product.price).toFixed(2)} DH
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(product.id)}
                                        disabled={product.stock <= 0}
                                        className={`w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl transition border shadow-xs text-center active:scale-95 whitespace-nowrap select-none ${
                                            product.stock > 0
                                                ? 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600 cursor-pointer'
                                                : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        {product.stock > 0 ? 'Ajouter' : 'Fin'}
                                    </button>
                                </div>

                            </div>
                        ))}
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
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Livraison Rapide</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Expédition sous 24 à 48 heures</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                                💵
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Paiement Sécurisé</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Paiement à la livraison ou en ligne</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0">
                                ✨
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Garantie Qualité</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Montures certifiées et contrôlées</p>
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
                                Studio de création de montures optiques haut de gamme. Nous combinons esthétique contemporaine et légèreté absolue pour sublimer votre regard au quotidien.
                            </p>
                        </div>

                        {/* Liens Rapides */}
                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Navigation</h5>
                            <ul className="space-y-2 text-xs font-semibold text-slate-500">
                                <li>
                                    <Link href="/" className="hover:text-slate-900 transition">Catalogue Général</Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-slate-900 transition">Mon Panier</Link>
                                </li>
                                {auth?.user && (
                                    <li>
                                        <Link href="/orders" className="hover:text-slate-900 transition">Historique des commandes</Link>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Informations Légales / Contact */}
                        <div className="md:col-span-4 space-y-3">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Service Client</h5>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Un renseignement sur nos montures ? Notre équipe est disponible du lundi au samedi pour vous conseiller.
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
