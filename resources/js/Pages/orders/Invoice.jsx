import React from 'react';
import { Head } from '@inertiajs/react';

export default function Invoice({ order }) {

    // Fonction utilitaire pour imprimer
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-slate-50 min-h-screen py-6 sm:py-12 px-4 print:bg-white print:py-0 print:px-0">
            <Head>
                <title>{`Facture #${order.id} - monocle.`}</title>
                <style type="text/css" media="print">{`
                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                    body {
                        background: white;
                        color: black;
                    }
                    .no-print {
                        display: none !important;
                    }
                `}</style>
            </Head>

            {/* Barre d'action invisible à l'impression */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
                <button
                    onClick={() => window.history.back()}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-2"
                >
                    ← Retour
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition active:scale-95 flex items-center gap-2"
                >
                    🖨️ Imprimer la facture
                </button>
            </div>

            {/* Corps de la facture */}
            <div className="bg-white text-slate-900 p-6 sm:p-10 max-w-3xl mx-auto font-sans antialiased border border-slate-200 rounded-[2rem] shadow-xl print:shadow-none print:border-none print:rounded-none">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div>
                        <div className="font-black text-2xl flex items-center gap-2 mb-2">
                            <span className="bg-slate-900 text-white p-2 rounded-xl text-xs">👓</span>
                            <span>monocle<span className="text-blue-600">.</span></span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kenitra, Maroc</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">contact@monocle.com</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Facture</h1>
                        <p className="font-mono text-xs font-black text-slate-400 mt-2">#INV-{order.id}</p>
                        <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-wider">
                            Date: {order.created_at}
                        </p>
                    </div>
                </div>

                {/* Info Client & Expédition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-300 uppercase text-[9px] tracking-[0.2em] border-b border-slate-100 pb-1">Facturé à:</h3>
                        <div className="pl-1">
                            <p className="font-black text-slate-900 text-base capitalize leading-tight mb-1">{order.customer_name}</p>
                            <p className="text-xs font-bold text-slate-500 lowercase">{order.customer_email}</p>
                            <p className="text-xs font-black text-slate-900 mt-2">📞 {order.customer_phone}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-300 uppercase text-[9px] tracking-[0.2em] border-b border-slate-100 pb-1">Adresse de Livraison:</h3>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-xs text-slate-600 leading-relaxed shadow-inner font-medium">
                            {order.customer_address}
                        </div>
                    </div>
                </div>

                {/* Statut de la commande */}
                <div className="mb-10 flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl w-fit">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Statut:</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                </div>

                {/* Table des articles */}
                <div className="mb-10">
                    <table className="hidden sm:table w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                                <th className="py-4 pl-2">Description</th>
                                <th className="py-4 text-center w-16">Qté</th>
                                <th className="py-4 text-right w-24">Prix</th>
                                <th className="py-4 text-right pr-2 w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items && order.items.map((item, index) => (
                                <tr key={index} className="group">
                                    <td className="py-5 flex items-center gap-4 pl-2">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 print:border">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300">👓</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 capitalize text-sm">{item.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Réf: MON-{item.id || index + 100}</p>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center font-black text-slate-600">{item.quantity}</td>
                                        <td className="py-5 text-right font-bold text-slate-500">{Number(item.price).toFixed(2)} DH</td>
                                        <td className="py-5 text-right font-black text-slate-900 pr-2">{(item.price * item.quantity).toFixed(2)} DH</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card View for Items */}
                    <div className="sm:hidden space-y-4">
                        {order.items && order.items.map((item, index) => (
                            <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-14 h-14 bg-white rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300">👓</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 capitalize text-sm truncate">{item.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Réf: MON-{item.id || index + 100}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-600">Qté: {item.quantity}</span>
                                        <span className="text-sm font-black text-slate-900">{(item.price * item.quantity).toFixed(2)} DH</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Résumé financier */}
                <div className="flex flex-col items-end pt-6 border-t-2 border-slate-900">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>SOUS-TOTAL</span>
                            <span>{Number(order.total_price).toFixed(2)} DH</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>LIVRAISON</span>
                            <span className="text-emerald-600 font-black">GRATUIT</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-lg mt-4">
                            <span className="text-[10px] font-black tracking-[0.2em]">TOTAL TTC</span>
                            <span className="text-xl font-black">{Number(order.total_price).toFixed(2)} DH</span>
                        </div>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-20 flex justify-between items-end border-t border-slate-100 pt-8">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest space-y-1">
                        <p>Monocle Optique S.A.R.L</p>
                        <p>IF: 45678912 — RC: 32145</p>
                        <p>Merci pour votre confiance !</p>
                    </div>
                    <div className="text-right">
                        <div className="w-32 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center opacity-30 grayscale mb-2 mx-auto">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Cachet & Signature</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
