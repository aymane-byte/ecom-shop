import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Success({ order }) {
    const { auth } = usePage().props;

    // Sécurité extrême au cas où "order" n'arrive pas du controller backend
    if (!order) {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">Commande Validée !</h1>
                    <p className="text-xs text-slate-400 mb-6">Merci pour votre achat. Votre commande est bien enregistrée.</p>
                    <Link href="/" className="block w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">Retourner à la boutique</Link>
                </div>
            </div>
        );
    }

    const totalAmount = isNaN(Number(order.total_amount || order.total_price)) ? 0 : Number(order.total_amount || order.total_price);

    // 🔥🚀 LA METHODE ULTRA CLEAN: Kat tiri l'impression auto f l-background b7al l-historique!
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
            }, 300);
        };

        document.body.appendChild(iframe);
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans">
            <Head title="Commande Confirmée - monocle." />

            {/* 📱 RESPONSIVE CARD CONTAINER */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 max-w-md w-full text-center shadow-xs">

                {/* Check Icon Frame */}
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center text-xl mx-auto mb-5 shadow-2xs">
                    ✓
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mb-2">Commande Enregistrée !</h1>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 font-medium px-1">
                    Merci pour votre confiance. La référence <span className="font-mono font-bold text-slate-700 text-[11px] sm:text-xs">#{order.id}</span> a été validée avec succès par notre console.
                </p>

                {/* Ticket Facturation */}
                <div className="bg-[#fbfbfc] rounded-xl p-4 mb-6 border border-slate-200/40 text-left space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">État du traitement</span>
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[9px] bg-amber-50 border border-amber-100 text-amber-600 uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            {order.status || 'en_attente'}
                        </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                        <span className="text-slate-500 text-xs font-semibold">Total débité TTC</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                {totalAmount.toFixed(2)} DH
                        </span>
                    </div>
                </div>

                {/* Actions Buttons Stack */}
                <div className="space-y-2">
                    <Link href="/" className="block w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition text-center active:scale-99">
                        Continuer vers la boutique
                    </Link>

                    {/* 🔥 BOUTON INVOICE OPTIMISÉ (Khddam b l-iframe dyal l-historique completely) */}
                    <button
                        type="button"
                        onClick={(e) => handleDownloadInvoice(e, order.id)}
                        className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl text-xs font-bold hover:bg-emerald-100 transition text-center active:scale-99 cursor-pointer select-none"
                    >
                        📄 Télécharger ma Facture
                    </button>

                    {/* L-historique ma ghadi ybqa yban illa l user li connecti dejà */}
                    {auth?.user && (
                        <Link href="/orders" className="block w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition text-center active:scale-99">
                            Consulter mon historique
                        </Link>
                    )}
                </div>

            </div>
        </div>
    );
}
