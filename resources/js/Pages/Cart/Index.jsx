import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Index() {
    const { cart, auth, flash, userShipping } = usePage().props;
    const cartItems = Object.entries(cart || {});

    // Villes du Maroc pour le select
    const marocCities = [
        "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Meknès",
        "Oujda", "Kenitra", "Tétouan", "Safi", "Temara", "Salé", "Mohammedia",
        "Béni Mellal", "El Jadida", "Taza", "Nador", "Settat", "Larache",
        "Ksar El Kebir", "Khemisset", "Guelmim", "Berrechid", "Ouarzazate"
    ].sort();

    // État du formulaire avec le champ 'city'
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_city: '',
        customer_address: ''
    });

    useEffect(() => {
        if (auth.user) {
            setFormData(prev => ({
                ...prev,
                customer_name: auth.user.name || '',
                customer_email: auth.user.email || '',
                customer_phone: userShipping?.phone || '',
                customer_city: userShipping?.city || '',
                customer_address: userShipping?.address || ''
            }));
        }
    }, [userShipping, auth.user]);

    const totalPrice = cartItems.reduce((total, [id, item]) => {
        return total + (Number(item.price) * item.quantity);
    }, 0);

    const handleQuantityChange = (id, currentQty, newQty) => {
        if (newQty < 1) return;
        router.patch(`/cart/update/${id}`, { quantity: newQty }, {
            preserveScroll: true
        });
    };

    const handleRemove = (id) => {
        router.delete(`/cart/remove/${id}`, {
            preserveScroll: true
        });
    };

    const handleCheckout = (e) => {
        e.preventDefault();

        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_city || !formData.customer_address) {
            alert('Veuillez compléter tous les champs obligatoires pour finaliser votre commande.');
            return;
        }

        router.post('/checkout', formData);
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen text-slate-900 antialiased font-sans">
            <Head title="Votre panier — monocle." />

            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span className="bg-slate-900 text-white p-1.5 rounded-lg text-[10px] sm:text-xs">👓</span>
                    <span>monocle<span className="text-blue-600 font-black">.</span></span>
                </Link>
                <Link href="/" className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-900 transition">
                    ← Poursuivre mes achats
                </Link>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {flash?.error && (
                    <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">
                        ⚠️ Une erreur est survenue : {flash.error}. Veuillez réessayer.
                    </div>
                )}

                <div className="mb-6 sm:mb-8 border-b border-slate-200/60 pb-4 sm:pb-5">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Votre panier</h1>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Finalisez votre commande en toute simplicité. Paiement sécurisé à la livraison.</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/60 text-center shadow-xs">
                        <p className="text-slate-400 text-xs font-medium mb-4">Votre panier est actuellement vide.</p>
                        <Link href="/" className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition inline-block">Découvrir nos produits</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">

                        <div className="md:col-span-7 space-y-3">
                            {cartItems.map(([id, item]) => (
                                <div key={id} className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-xs">
                                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#fcfcfd] border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 shadow-inner shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="text-[8px] text-slate-300 font-bold uppercase">Image produit</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 capitalize truncate">{item.name}</h3>
                                                <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 font-medium">{Number(item.price).toFixed(2)} DH</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-50 pt-2 sm:pt-0 sm:border-none w-full sm:w-auto">
                                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 h-8">
                                            <button type="button" onClick={() => handleQuantityChange(id, item.quantity, item.quantity - 1)} className="px-2.5 h-full bg-white text-slate-500 font-bold text-xs border-r border-slate-200/60">-</button>
                                            <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                                            <button type="button" onClick={() => handleQuantityChange(id, item.quantity, item.quantity + 1)} className="px-2.5 h-full bg-white text-slate-500 font-bold text-xs border-l border-slate-200/60">+</button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-slate-900 text-xs w-16 text-right">{(Number(item.price) * item.quantity).toFixed(2)} DH</span>
                                            <button type="button" onClick={() => handleRemove(id)} className="text-slate-300 hover:text-rose-600 text-xs font-bold p-2">Retirer</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleCheckout} className="md:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Vos informations de livraison</h2>
                                <p className="text-[11px] text-slate-400">Bénéficiez d'une livraison rapide partout au Maroc avec paiement à la réception.</p>
                            </div>

                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nom et prénom</label>
                                    <input type="text" required placeholder="Entrez votre nom et prénom" className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-slate-950 transition" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Adresse e-mail</label>
                                    <input type="email" required placeholder="Votre adresse e-mail" className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-slate-950 transition" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} disabled={!!auth.user} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Numéro de téléphone</label>
                                    <input type="tel" required placeholder="Votre numéro de téléphone" className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-slate-950 transition" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                                </div>

                                {/* 🏙️ NOUVEAU SELECT VILLE */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Ville de livraison</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-slate-950 transition cursor-pointer appearance-none"
                                        value={formData.customer_city}
                                        onChange={e => setFormData({...formData, customer_city: e.target.value})}
                                    >
                                        <option value="" disabled>Sélectionnez votre ville</option>
                                        {marocCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Adresse complète de livraison</label>
                                    <textarea required rows="2" placeholder="Votre adresse complète (rue, quartier, numéro de maison/appartement)" className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-slate-950 transition resize-none" value={formData.customer_address} onChange={e => setFormData({...formData, customer_address: e.target.value})} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between mb-4 items-baseline">
                                    <span className="text-slate-500 text-xs font-medium">Montant total à payer</span>
                            <span className="text-xl font-extrabold text-slate-900 tracking-tight">{totalPrice.toFixed(2)} DH</span>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-xl shadow-xs transition cursor-pointer">Confirmer ma commande</button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
