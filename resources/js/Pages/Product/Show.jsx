import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Show({ product }) {
    const { cartCount, auth, userShipping } = usePage().props;

    // Villes du Maroc pour le select
    const marocCities = [
        "Agadir", "Béni Mellal", "Berrechid", "Casablanca", "El Jadida", "Fès",
        "Guelmim", "Kenitra", "Khemisset", "Ksar El Kebir", "Larache", "Marrakech",
        "Meknès", "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi",
        "Salé", "Settat", "Tanger", "Taza", "Temara", "Tétouan"
    ];

    // Images & Galerie
    const allImages = [
        { id: 'main', path: product.image },
        ...(product.images || []).map(img => ({ id: img.id, path: img.image_path }))
    ].filter(img => img.path);

    const [activeImage, setActiveImage] = useState(product.image);
    const [quantity, setQuantity] = useState(1);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const scrollRef = useRef(null);

    // Formulaire de commande directe
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_city: '',
        customer_address: ''
    });

    useEffect(() => {
        if (auth?.user) {
            setFormData(prev => ({
                ...prev,
                customer_name: auth.user.name || '',
                customer_email: auth.user.email || '',
                customer_phone: userShipping?.phone || '',
                customer_city: userShipping?.city || '',
                customer_address: userShipping?.address || ''
            }));
        }
    }, [userShipping, auth]);

    const handleAddToCart = () => {
        router.post(`/cart/add/${product.id}`, { quantity }, { preserveScroll: true });
    };

    const handleDirectOrder = (e) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_city || !formData.customer_address) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        router.post(`/direct-order/${product.id}`, {
            ...formData,
            quantity
        });
    };

    const specs = product.description
        ? product.description.split('\n').filter(line => line.trim() !== '')
        : ["Aucune spécification technique disponible."];

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth < 640 ? 100 : 180;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const formattedPrice = (price) => {
        return `${Number(price).toFixed(2)} DH`;
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen text-slate-900 antialiased font-sans selection:bg-blue-100">
            <Head title={`${product.name} — monocle.`} />

            {/* 💎 BARRE DE NAVIGATION HAUT DE GAMME */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex justify-between items-center">
                    <Link href="/" className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-950 flex items-center gap-1.5 sm:gap-2 group">
                        <span className="bg-slate-950 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-[11px] font-black shadow-md shadow-slate-950/10 group-hover:scale-105 transition-transform">
                            M.
                        </span>
                        <span className="font-black tracking-tighter text-sm sm:text-base lg:text-lg">monocle<span className="text-blue-600">.</span></span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
                        <Link href="/orders" className="text-[10px] sm:text-xs font-semibold text-slate-500 hover:text-slate-950 transition hidden sm:block">
                            Mes Commandes
                        </Link>
                        <Link
                            href="/cart"
                            className="bg-slate-950 hover:bg-slate-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95"
                        >
                            <span>Panier</span>
                            {cartCount > 0 && (
                                <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

                {/* Fil d'ariane */}
                <nav className="mb-4 sm:mb-8 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wide uppercase">
                    <Link href="/" className="hover:text-slate-950 transition">Boutique</Link>
                    <span>/</span>
                    <span className="text-slate-800 font-extrabold truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-start">

                    {/* 📸 GAUCHE : GALERIE D'IMAGES PREMUIUM */}
                    <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-5">

                        {/* Stage Principal */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-14 min-h-[40vh] sm:min-h-[50vh] aspect-auto sm:aspect-square flex items-center justify-center shadow-xs relative group overflow-hidden">
                            {activeImage ? (
                                <img
                                    key={activeImage}
                                    src={activeImage}
                                    alt={product.name}
                                    className="max-h-[40vh] sm:max-h-[50vh] lg:max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-700 ease-out group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-slate-300 font-bold text-xs uppercase tracking-widest">Image non disponible</div>
                            )}

                            {/* Badge Studio / Authenticité */}
                            <div className="absolute top-2 sm:top-5 left-2 sm:left-5 bg-slate-900/5 backdrop-blur-md px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full border border-slate-900/10 flex items-center gap-1.5 sm:gap-2">
                                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Produit Authentique</span>
                            </div>
                        </div>

                        {/* Carrousel de vignettes */}
                        {allImages.length > 1 && (
                            <div className="relative group/gallery mt-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="absolute -left-1.5 sm:-left-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur border border-slate-200 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-100"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="absolute -right-1.5 sm:-right-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur border border-slate-200 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition opacity-100 sm:opacity-0 sm:group-hover/gallery:opacity-100"
                                >
                                    ›
                                </button>

                                <div ref={scrollRef} className="flex gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1">
                                    {allImages.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.path)}
                                            onTouchStart={() => setActiveImage(img.path)}
                                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white border-2 p-1 sm:p-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                                                activeImage === img.path
                                                    ? 'border-slate-950 ring-4 ring-slate-950/5 shadow-md scale-95'
                                                    : 'border-slate-200/70 opacity-60 hover:opacity-100 hover:border-slate-300'
                                            }`}
                                        >
                                            <img src={img.path} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="Vignette" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🛒 DROITE : DÉTAILS & ACHAT */}
                    <div className="lg:col-span-5 flex flex-col space-y-4 sm:space-y-7">

                        {/* Header Produit */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className={`inline-flex items-center gap-1 sm:gap-1.5 font-bold px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] border uppercase tracking-wider ${
                                    product.stock > 0
                                        ? (product.stock < 5 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                                        : 'bg-rose-50 border-rose-200 text-rose-700'
                                }`}>
                                    <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${product.stock > 0 ? (product.stock < 5 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-rose-500'}`}></span>
                                    {product.stock > 0 ? (product.stock < 5 ? `Plus que ${product.stock} en stock` : 'En Stock') : 'Rupture de stock'}
                                </span>

                                <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Réf: #{product.id.toString().padStart(4, '0')}</span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight capitalize">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-2 sm:gap-3 pt-1">
                                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                                    {formattedPrice(product.price)}
                                </span>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-400">TVA incluse</span>
                            </div>
                        </div>

                        {/* Spécifications & Caractéristiques */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-2xs space-y-3">
                            <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                                Caractéristiques
                            </h2>
                            <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs font-semibold text-slate-600">
                                {specs.map((spec, index) => (
                                    <li key={index} className="flex items-start gap-2 sm:gap-2.5">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="leading-relaxed">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Sélecteur de Quantité */}
                        {product.stock > 0 && (
                            <div className="flex items-center justify-between bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200/70 shadow-2xs">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</span>
                                <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center transition active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="w-5 sm:w-6 text-center text-[11px] sm:text-xs font-black text-slate-900 font-mono">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center transition active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Boutons d'Action */}
                        <div className="space-y-2 sm:space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className={`w-full py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-md active:scale-98 cursor-pointer ${
                                    product.stock > 0
                                        ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-slate-950/10'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span>Ajouter au Panier</span>
                                <span className="text-sm sm:text-base">🛒</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOrderForm(!showOrderForm)}
                                disabled={product.stock <= 0}
                                className={`w-full py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-md active:scale-98 cursor-pointer ${
                                    product.stock > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/15'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span>{showOrderForm ? 'Masquer le Formulaire' : 'Acheter Maintenant (Express)'}</span>
                                <span className="text-sm sm:text-base">⚡</span>
                            </button>
                        </div>

                        {/* ⚡ FORMULAIRE DE COMMANDE DIRECTE (EXPRESS CHECKOUT) */}
                        {showOrderForm && (
                            <div className="bg-white border-2 border-blue-600/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="border-b border-slate-100 pb-2 sm:pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <div>
                                        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950">Commande Rapide</h3>
                                        <p className="text-[9px] sm:text-[10px] font-medium text-slate-400">Paiement à la livraison partout au Maroc</p>
                                    </div>
                                    <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">Paiement Cash 💵</span>
                                </div>

                                <form onSubmit={handleDirectOrder} className="space-y-3 sm:space-y-3.5">
                                    <div>
                                        <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 mb-1">Nom complet *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Amine Benali"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white transition"
                                            value={formData.customer_name}
                                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <div>
                                            <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 mb-1">Téléphone *</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="06 00 00 00 00"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white transition"
                                                value={formData.customer_phone}
                                                onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 mb-1">Ville *</label>
                                            <select
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white transition cursor-pointer"
                                                value={formData.customer_city}
                                                onChange={e => setFormData({ ...formData, customer_city: e.target.value })}
                                            >
                                                <option value="" disabled>Sélectionner la ville</option>
                                                {marocCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="votre@email.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white transition disabled:opacity-60"
                                            value={formData.customer_email}
                                            onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                                            disabled={!!auth?.user}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 mb-1">Adresse de livraison *</label>
                                        <textarea
                                            required
                                            rows="2"
                                            placeholder="Quartier, Rue, N° d'appartement..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white transition resize-none"
                                            value={formData.customer_address}
                                            onChange={e => setFormData({ ...formData, customer_address: e.target.value })}
                                        />
                                    </div>

                                    {/* Total & Submit */}
                                    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                                        <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold text-slate-600">
                                            <span>Montant Total :</span>
                                            <span className="text-sm sm:text-base font-black text-slate-950">{formattedPrice(Number(product.price) * quantity)}</span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider py-3 sm:py-3.5 rounded-xl shadow-md transition active:scale-98 cursor-pointer"
                                        >
                                            Confirmer ma Commande
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 🛡️ REASSURANCE / TRUST BADGES */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/60 text-center">
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-sm sm:text-base">🚚</span>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase">Livraison 24/48h</h4>
                                <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium">Partout au Maroc</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-sm sm:text-base">🤝</span>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase">Paiement Cache</h4>
                                <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium">À la livraison</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 space-y-1">
                                <span className="text-sm sm:text-base">✨</span>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase">Garantie 100%</h4>
                                <p className="text-[8px] sm:text-[9px] text-slate-400 font-medium">Produit certifié</p>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
