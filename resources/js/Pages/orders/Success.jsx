import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Success({ order }) {
    const { auth } = usePage().props;

    // Sécurité extrême au cas où "order" n'arrive pas du controller backend
    if (!order) {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">Votre commande est confirmée !</h1>
                    <p className="text-xs text-slate-400 mb-6">Nous vous remercions de votre confiance. Votre commande a été enregistrée avec succès.</p>
                    <Link href="/" className="block w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">Retourner à la boutique</Link>
                </div>
            </div>
        );
    }

    const totalAmount = isNaN(Number(order.total_amount || order.total_price)) ? 0 : Number(order.total_amount || order.total_price);

    const getStatusLabel = (status) => {
        switch (status) {
            case 'en_attente': return 'En attente de traitement';
            case 'payé': return 'Payée';
            case 'expédié': return 'Expédiée';
            case 'livré': return 'Livrée';
            case 'annulé': return 'Annulée';
            default: return status;
        }
    };

    // 🔥🚀 LA METHODE ULTRA CLEAN: Déclenche l'impression automatique en arrière-plan, comme pour l'historique !
    const handleDownloadInvoice = (e, orderId) => {
        e.preventDefault();

        // 1. Suppression des iframes existantes pour éviter les doublons
        const existingIframe = document.getElementById(`invoice-iframe-${orderId}`);
        if (existingIframe) existingIframe.remove();

        // 2. Création d'un iframe complètement masqué
        const iframe = document.createElement('iframe');
        iframe.id = `invoice-iframe-${orderId}`;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';

        // Définition de la source de l'iframe vers la route de la facture
        iframe.src = `/orders/${orderId}/invoice`;

        // 3. Déclenchement de l'impression une fois le contenu entièrement chargé
        iframe.onload = function() {
            setTimeout(() => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (error) {
                    console.error("Erreur d'impression:", error);
                }
            }, 300); // Délai optimisé pour éviter les impressions multiples
        };

        document.body.appendChild(iframe);
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans">
            <Head title="Commande confirmée - monocle." />

            {/* 📱 RESPONSIVE CARD CONTAINER */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 max-w-md w-full text-center shadow-xs">

                {/* Check Icon Frame */}
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center text-xl mx-auto mb-5 shadow-2xs">
                    ✓
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mb-2">Félicitations ! Votre commande est confirmée !</h1>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 font-medium px-1">
                    Nous vous remercions de votre confiance. Votre commande n°<span className="font-mono font-bold text-slate-700 text-[11px] sm:text-xs">#{order.id}</span> a été enregistrée avec succès. Notre équipe vous contactera très prochainement pour organiser la livraison.
                </p>

                {/* Ticket Facturation */}
                <div className="bg-[#fbfbfc] rounded-xl p-4 mb-6 border border-slate-200/40 text-left space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Statut de votre commande</span>
                        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[9px] bg-amber-50 border border-amber-100 text-amber-600 uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            {getStatusLabel(order.status || 'en_attente')}
                        </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                        <span className="text-slate-500 text-xs font-semibold">Montant total de la commande</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                {totalAmount.toFixed(2)} DH
                        </span>
                    </div>
                </div>

                {/* Actions Buttons Stack */}
                <div className="space-y-2">
                    <Link href="/" className="block w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold transition text-center active:scale-99">
                        Poursuivre mes achats
                    </Link>

                    {/* 🔥 BOUTON INVOICE OPTIMISÉ (Utilise l'iframe de l'historique de manière propre) */}
                    <button
                        type="button"
                        onClick={(e) => handleDownloadInvoice(e, order.id)}
                        className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl text-xs font-bold hover:bg-emerald-100 transition text-center active:scale-99 cursor-pointer select-none"
                    >
                        Télécharger ma facture
                    </button>

                    {/* L'historique ne s'affichera que pour les utilisateurs déjà connectés */}
                    {auth?.user && (
                        <Link href="/orders" className="block w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition text-center active:scale-99">
                            Voir mes commandes
                        </Link>
                    )}
                </div>

            </div>
        </div>
    );
}
