import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
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

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    <div className="md:col-span-4 space-y-4">
                        <Link href="/" className="text-xl font-serif tracking-wide text-white flex items-center gap-2">
                            <span>5witm<span className="text-[#C2A65A]">.</span></span>
                        </Link>
                        <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                            Votre boutique officielle pour des produits premium sélectionnés avec soin. Service client réactif et expérience d'achat 100% sécurisée.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="WhatsApp">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                </svg>
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Facebook">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Instagram">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="TikTok">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.51-1.28 2.55.02.82.42 1.61 1.08 2.09.8.59 1.87.7 2.81.42.94-.27 1.71-1.02 1.98-1.96.22-.72.23-1.49.23-2.24V.02z"/>
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
                        <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Besoin d'aide ?</h5>
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
    );
}
