import React from 'react';
import { Head } from '@inertiajs/react';
import Barcode from './Barcode';
import { useTranslation } from 'react-i18next';

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function trackingCode(orderId) {
    return `3AM-${String(orderId).padStart(6, '0')}`;
}

function Label({ order }) {
    const { t } = useTranslation();

    function safeText(value, fallbackKey) {
        return value && String(value).trim() ? value : t(fallbackKey);
    }

    const code = trackingCode(order.id);
    const city = safeText(order.customer_city, 'admin.shipping_labels.city_not_provided');
    const address = safeText(order.customer_address, 'admin.shipping_labels.address_not_provided');
    const phone = safeText(order.customer_phone, 'admin.shipping_labels.phone_not_provided');

    return (
        <div className="h-[110mm] w-[100mm] bg-white text-black p-2 flex flex-col border-2 border-black">
            {/* Top Row */}
            <div className="flex justify-between items-start border-b-2 border-black pb-1">
                <div>
                    <p className="text-[12px] font-black">5witm</p>
                    <p className="text-[4px] font-bold uppercase">{t('admin.shipping_labels.ecommerce_shipping')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black">{code}</p>
                    <p className="text-[4px] font-bold">#{order.id}</p>
                </div>
            </div>

            {/* Zone tri */}
            <div className="flex justify-center py-1 border-b-2 border-black">
                <div className="border-2 border-black px-3 py-1">
                    <p className="text-[4px] font-black uppercase text-center">{t('admin.shipping_labels.sorting_zone')}</p>
                    <p className="text-[24px] font-black text-center leading-none">{city.slice(0, 3).toUpperCase()}</p>
                </div>
            </div>

            {/* Destinataire */}
            <div className="border-b-2 border-black py-1">
                <p className="text-[4px] font-black uppercase bg-black text-white inline-block px-1">{t('admin.shipping_labels.recipient_info')}</p>
                <p className="text-[11px] font-black uppercase mt-0.5">{safeText(order.customer_name, 'admin.shipping_labels.customer_name_not_provided')}</p>
                <p className="text-[8px] font-bold uppercase">{address}</p>
                <p className="text-[9px] font-black uppercase">{city}</p>
                <p className="text-[8px] font-black mt-0.5">{t('admin.shipping_labels.phone_prefix')}: {phone}</p>
            </div>

            {/* Barcode */}
            <div className="flex justify-center py-1 border-b-2 border-black">
                <Barcode value={code} />
            </div>

            {/* Articles */}
            <div className="flex-1 border-b-2 border-black py-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase">{t('admin.shipping_labels.package_content', { count: order.items_count })}</p>
                <div className="mt-0.5 space-y-0.5">
                    {(order.items || []).slice(0, 6).map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex justify-between text-[7px] font-bold">
                            <span className="truncate flex-1">{item.name}</span>
                            <span className="ml-1">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
                {(order.items || []).length > 6 && (
                    <p className="text-[5px] font-black">{t('admin.shipping_labels.additional_items', { count: order.items.length - 6 })}</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center py-1">
                <div className="text-[4px] font-bold uppercase">
                    <p>{t('admin.shipping_labels.date_prefix')}: {order.created_at}</p>
                    <p>{t('admin.shipping_labels.verify_phone_instruction')}</p>
                </div>
                <div className="text-right">
                    <p className="text-[4px] font-black uppercase">{t('admin.shipping_labels.amount_to_collect')}</p>
                    <p className="text-[14px] font-black">{money(order.total_price)}</p>
                </div>
            </div>
        </div>
    );
}

export default function ShippingLabels({ orders }) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
            <Head title={t('admin.shipping_labels.page_title')} />

            <style>{`
                @page {
                    size: 80mm 110mm;
                    margin: 0;
                }

                @media print {
                    html, body, #app {
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .labels-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, 80mm);
                        gap: 0;
                    }

                    .labels-grid > div {
                        page-break-after: always;
                        page-break-inside: avoid;
                        break-after: always;
                        break-inside: avoid;
                    }

                    .labels-grid > div:last-child {
                        page-break-after: auto;
                        break-after: auto;
                    }
                }
            `}</style>

            <div className="mx-auto mb-4 flex max-w-[420px] items-center justify-between gap-2 print:hidden">
                <button
                    type="button"
                    onClick={() => window.close()}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    {t('admin.shipping_labels.close_button')}
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                    {t('admin.shipping_labels.print_all_labels_button')}
                </button>
            </div>

            <div className="labels-grid flex flex-col gap-4 items-center">
                {orders.map((order) => (
                    <Label key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
