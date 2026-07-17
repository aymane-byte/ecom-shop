import React from 'react';
import { Head } from '@inertiajs/react';
import Barcode from './Barcode';

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function safeText(value, fallback = 'N/A') {
    return value && String(value).trim() ? value : fallback;
}

function trackingCode(orderId) {
    return `MCL-${String(orderId).padStart(6, '0')}`;
}

export default function ShippingLabel({ order }) {
    const code = trackingCode(order.id);
    const city = safeText(order.customer_city, 'VILLE NON RENSEIGNEE');
    const address = safeText(order.customer_address, 'ADRESSE NON RENSEIGNEE');
    const phone = safeText(order.customer_phone, 'TELEPHONE NON RENSEIGNE');

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
            <Head title={`Etiquette colis ${code}`} />

            <style>{`
                @page {
                    size: 100mm 150mm;
                    margin: 0;
                }

                @media print {
                    html, body, #app {
                        width: 100mm;
                        height: 150mm;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="mx-auto mb-4 flex w-full max-w-[420px] items-center justify-between gap-2 print:hidden">
                <button
                    type="button"
                    onClick={() => window.close()}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    Fermer
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                    Imprimer
                </button>
            </div>

            <main className="mx-auto flex h-[150mm] w-[100mm] max-w-full flex-col bg-white text-black shadow-xl ring-1 ring-slate-300 print:m-0 print:shadow-none print:ring-0 [transform-origin:top_center] scale-[0.5] sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.9] xl:scale-1">
                <header className="grid grid-cols-[1fr_34mm] border-b-2 border-black">
                    <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[20px] font-black leading-none tracking-tight">monocle</p>
                                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em]">Expedition ecommerce</p>
                            </div>
                            <span className="rounded border border-black px-2 py-1 text-[10px] font-black uppercase">
                                Standard
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] font-bold uppercase">
                            <div className="rounded border border-black p-1.5">
                                <p className="text-[7px] font-black text-slate-600">Origine</p>
                                <p>Monocle Store</p>
                            </div>
                            <div className="rounded border border-black p-1.5">
                                <p className="text-[7px] font-black text-slate-600">Date</p>
                                <p>{order.created_at}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-l-2 border-black p-2 text-center">
                        <p className="text-[7px] font-black uppercase tracking-wide">Zone tri</p>
                        <p className="mt-2 text-[26px] font-black leading-none">{city.slice(0, 3).toUpperCase()}</p>
                        <p className="mt-2 break-words text-[9px] font-black">{code}</p>
                    </div>
                </header>

                <section className="border-b-2 border-black p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Destinataire</p>
                        <p className="rounded bg-black px-2 py-1 text-[8px] font-black uppercase text-white">A livrer</p>
                    </div>
                    <h1 className="mt-2 text-[20px] font-black uppercase leading-tight">
                        {safeText(order.customer_name, 'CLIENT')}
                    </h1>
                    <p className="mt-2 text-[13px] font-bold uppercase leading-snug">{address}</p>
                    <p className="mt-2 text-[16px] font-black uppercase leading-tight">{city}</p>
                    <div className="mt-3 rounded border-2 border-black px-2 py-1.5">
                        <p className="text-[8px] font-black uppercase tracking-wide">Telephone client</p>
                        <p className="mt-0.5 text-[15px] font-black">{phone}</p>
                    </div>
                </section>

                <section className="border-b-2 border-black p-3">
                    <Barcode value={code} />
                    <p className="mt-1 text-center text-[10px] font-black tracking-[0.18em]">{code}</p>
                </section>

                <section className="grid flex-1 grid-cols-[1fr_31mm] border-b-2 border-black">
                    <div className="p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Preparation colis</p>
                        <ul className="mt-2 space-y-1.5">
                            {(order.items || []).slice(0, 6).map((item, index) => (
                                <li key={`${item.name}-${index}`} className="flex justify-between gap-2 text-[10px] font-bold leading-tight">
                                    <span className="min-w-0 truncate">{item.name}</span>
                                    <span className="shrink-0 rounded border border-black px-1 font-black">x{item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                        {(order.items || []).length > 6 && (
                            <p className="mt-2 text-[9px] font-black">+{order.items.length - 6} autre(s) article(s)</p>
                        )}
                    </div>

                    <div className="border-l-2 border-black p-2 text-center">
                        <p className="text-[7px] font-black uppercase tracking-wide">Pieces</p>
                        <p className="mt-1 text-[24px] font-black leading-none">{order.items_count}</p>
                        <div className="mt-3 border-t border-black pt-2">
                            <p className="text-[7px] font-black uppercase tracking-wide">Commande</p>
                            <p className="mt-1 text-[14px] font-black">#{order.id}</p>
                        </div>
                    </div>
                </section>

                <footer className="grid grid-cols-[1fr_38mm]">
                    <div className="p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Instructions</p>
                        <p className="mt-1 text-[10px] font-bold leading-tight">
                            Verifier le telephone avant livraison. Ne pas plier. Remettre uniquement au client ou a son representant.
                        </p>
                    </div>
                    <div className="border-l-2 border-black p-2 text-center">
                        <p className="text-[8px] font-black uppercase tracking-wide">COD</p>
                        <p className="mt-1 text-[18px] font-black leading-tight">{money(order.total_price)}</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
