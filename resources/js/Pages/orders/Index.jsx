import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Index({ orders }) {
    const ordersList = Array.isArray(orders) ? orders : [];
    const sortedOrders = [...ordersList].sort((a, b) => b.id - a.id);

    const getOrderItems = (items) => {
        if (!items) return [];
        if (typeof items === 'object') {
            return Array.isArray(items) ? items : Object.values(items);
        }
        try {
            const parsed = JSON.parse(items);
            return Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch (e) {
            return [];
        }
    };

    // 🔥 🚀 LA FONCTION OPTIMISÉE: Kat-tiri print mra w7da clean o safya m l-background!
    const handleDownloadInvoice = (e, orderId) => {
        e.preventDefault();

        // 1. Suppression dial les doublons
        const existingIframe = document.getElementById(`invoice-iframe-${orderId}`);
        if (existingIframe) existingIframe.remove();

        // 2. Création dial l-iframe completely hidden
        const iframe = document.createElement('iframe');
        iframe.id = `invoice-iframe-${orderId}`;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';

        // Sifet l-src l-la route dial la facture
        iframe.src = `/orders/${orderId}/invoice`;

        // 3. Trigger mra w7da mlli kay-sharga l-content completely
        iframe.onload = function() {
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (error) {
                    console.error("Erreur d'impression:", error);
                }
            }, 300); // Wa9t optimisé bach may-trash double print
        };

        document.body.appendChild(iframe);
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 antialiased font-sans">
            <Head title="Mon Historique de Commandes - monocle." />

            {/* 📱 RESPONSIVE NAVIGATION PADDINGS */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center sticky top-0 z-50">
                <Link href="/" className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center">👓</span>
                    <span>monocle<span className="text-blue-600 font-black">.</span></span>
                </Link>
                <Link href="/" className="text-[10px] sm:text-[11px] font-bold text-slate-500 hover:text-slate-900 transition bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-xl">
                    ← <span className="hidden sm:inline">Retourner à la</span> boutique
                </Link>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* Responsive Header block */}
                <div className="mb-6 sm:mb-10 pb-4 sm:pb-5 border-b border-slate-200/60">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Espace Client</span>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">Historique de vos Commandes</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Vos achats récents présentés sous forme de fiches de suivi.</p>
                </div>

                {sortedOrders.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/60 text-center shadow-2xs">
                        <p className="text-slate-400 text-xs font-medium mb-4">Vous n'avez pas encore passé de commande sur notre boutique.</p>
                        <Link href="/" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition inline-block">
                            Découvrir nos collections
                        </Link>
                    </div>
                ) : (
                    /* 📱 RESPONSIVE GRID LAYOUT: Automatically collapses to 1 column on mobile devices */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {sortedOrders.map((order) => {
                            const items = getOrderItems(order.items);
                            const priceRaw = order.total_price !== undefined ? order.total_price : order.total_amount;
                            const totalPrice = isNaN(Number(priceRaw)) ? 0 : Number(priceRaw);

                            return (
                                <div key={order.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-xs">

                                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/30">
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Référence</p>
                                                <p className="font-mono text-slate-900 font-bold text-xs tracking-tight">#{order.id}</p>
                                            </div>

                                            <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md text-[8px] border shrink-0 ${
                                                order.status === 'en_attente' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                    order.status === 'payé' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                        order.status === 'expédié' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                                            'bg-emerald-50 border-emerald-100 text-emerald-700'
                                            }`}>
                                                <span className={`w-1 h-1 rounded-full ${
                                                    order.status === 'en_attente' ? 'bg-amber-500' :
                                                        order.status === 'payé' ? 'bg-blue-500' :
                                                            order.status === 'expédié' ? 'bg-indigo-500' : 'bg-emerald-500'
                                                }`}></span>
                                                <span className="uppercase tracking-wider text-[7px]">{order.status || 'en_attente'}</span>
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end mt-4 gap-2">
                                            <div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date d'achat</p>
                                                <p className="text-slate-800 font-bold text-xs whitespace-nowrap">
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Montant</p>
                                                <p className="text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                                                        {totalPrice.toFixed(2)} DH
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Articles ({items.length})</p>

                                            {items.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic">Aucun détail disponible.</p>
                                            ) : (
                                                /* Secure inner image list container */
                                                <div className="flex flex-wrap gap-2 max-h-[110px] overflow-y-auto pr-1">
                                                    {items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0 shadow-3xs"
                                                            title={item.name || 'Produit'}
                                                        >
                                                            {item.image ? (
                                                                <img src={item.image} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                            ) : (
                                                                <span className="text-[8px] text-slate-300 font-bold">👓</span>
                                                            )}
                                                            <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                                                                {item.quantity || 1}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={(e) => handleDownloadInvoice(e, order.id)}
                                                className="w-full text-center text-[10px] font-extrabold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200/70 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 select-none"
                                            >
                                                📑 Télécharger la facture
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
