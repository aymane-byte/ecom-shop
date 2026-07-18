import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const statusOptions = [
    { value: 'en_attente', label: 'En attente de traitement' },
    { value: 'pay\u00e9', label: 'Payée' },
    { value: 'exp\u00e9di\u00e9', label: 'Expédiée' },
    { value: 'livr\u00e9', label: 'Livrée' },
    { value: 'annul\u00e9', label: 'Annulée' },
];

const tabs = [
    { id: 'all', label: 'Toutes les commandes' },
    { id: 'en_attente', label: 'En attente de traitement' },
    { id: 'pay\u00e9', label: 'Commandes payées' },
    { id: 'exp\u00e9di\u00e9', label: 'Commandes expédiées' },
    { id: 'livr\u00e9', label: 'Commandes livrées' },
];

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function canonicalStatus(status) {
    const value = String(status || 'en_attente');
    const legacy = {
        'pay\u00c3\u00a9': 'pay\u00e9',
        'exp\u00c3\u00a9di\u00c3\u00a9': 'exp\u00e9di\u00e9',
        'livr\u00c3\u00a9': 'livr\u00e9',
        'annul\u00c3\u00a9': 'annul\u00e9',
    };

    return legacy[value] || value;
}

function normalizeStatus(status) {
    const value = canonicalStatus(status);

    return value.replace('_', ' ');
}

function StatusBadge({ status }) {
    const key = canonicalStatus(status);
    const styles = {
        en_attente: 'bg-yellow-100 text-yellow-900 border-yellow-200',
        'pay\u00e9': 'bg-green-100 text-green-900 border-green-200',
        'exp\u00e9di\u00e9': 'bg-blue-100 text-blue-900 border-blue-200',
        'livr\u00e9': 'bg-slate-200 text-slate-800 border-slate-300',
        'annul\u00e9': 'bg-red-100 text-red-900 border-red-200',
    };

    const labels = {
        en_attente: 'En attente de traitement',
        'pay\u00e9': 'Payée',
        'exp\u00e9di\u00e9': 'Expédiée',
        'livr\u00e9': 'Livrée',
        'annul\u00e9': 'Annulée',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${styles[key] || styles.en_attente}`}>
            {labels[key] || normalizeStatus(key)}
        </span>
    );
}

function PaymentBadge({ status }) {
    const key = canonicalStatus(status);
    const isPaid = key === 'pay\u00e9' || key === 'exp\u00e9di\u00e9' || key === 'livr\u00e9';

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${
            isPaid ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-700'
        }`}>
            {isPaid ? 'Paiement effectué' : 'Paiement en attente'}
        </span>
    );
}

function FulfillmentBadge({ status }) {
    const key = canonicalStatus(status);
    const fulfilled = key === 'exp\u00e9di\u00e9' || key === 'livr\u00e9';

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${
            fulfilled ? 'bg-blue-100 text-blue-900' : 'bg-yellow-100 text-yellow-900'
        }`}>
            {fulfilled ? 'Traitée' : 'Non traitée'}
        </span>
    );
}

export default function Orders({ orders, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const activeTab = filters.status && filters.status !== 'all' ? canonicalStatus(filters.status) : 'all';
    const rows = orders.data || [];

    const summary = useMemo(() => {
        return rows.reduce(
            (acc, order) => {
                acc.total += Number(order.total_price || 0);
                const status = canonicalStatus(order.status);
                if (status === 'en_attente') acc.pending += 1;
                if (status === 'exp\u00e9di\u00e9' || status === 'livr\u00e9') acc.fulfilled += 1;
                return acc;
            },
            { total: 0, pending: 0, fulfilled: 0 }
        );
    }, [rows]);

    const selectedAll = rows.length > 0 && selectedIds.length === rows.length;

    const visitWithFilters = (next = {}) => {
        router.get(
            route('admin.orders.index'),
            { status: activeTab, search, ...next },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleTabChange = (status) => {
        visitWithFilters({ status });
        setSelectedIds([]);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        visitWithFilters({ search });
    };

    const clearSearch = () => {
        setSearch('');
        visitWithFilters({ search: '' });
    };

    const handleSelectAll = (e) => {
        setSelectedIds(e.target.checked ? rows.map((order) => order.id) : []);
    };

    const handleSelectOne = (id) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const handleSingleStatusChange = (orderId, newStatus) => {
        router.patch(route('admin.orders.updateStatus', orderId), { status: newStatus }, { preserveScroll: true });
    };

    const handleBulkStatus = (status) => {
        if (selectedIds.length === 0) return;

        router.patch(route('admin.orders.bulkUpdateStatus'), { ids: selectedIds, status }, {
            onSuccess: () => setSelectedIds([]),
            preserveScroll: true,
        });
    };

    const handleMarkPrinted = () => {
        if (selectedIds.length === 0) return;

        router.post(route('admin.orders.markAsPrinted'), { ids: selectedIds }, {
            onSuccess: () => setSelectedIds([]),
            preserveScroll: true,
        });
    };

    const openInvoice = (orderId) => window.open(route('orders.invoice', orderId), '_blank');
    const openLabel = (orderId) => window.open(route('admin.orders.shippingLabel', orderId), '_blank');
    const openBulkInvoices = () => selectedIds.forEach(openInvoice);
    const openBulkLabels = () => {
        if (selectedIds.length === 0) return;
        window.open(route('admin.orders.bulkShippingLabels', { ids: selectedIds.join(',') }), '_blank');
    };

    const printAllPending = () => {
        window.open(route('admin.orders.bulkShippingLabels', { ids: 'all' }), '_blank');
    };

    return (
        <AdminLayout>
            <Head title="Tableau de Bord Admin - Gestion des Commandes" />

            <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <Link href="/admin" className="hover:text-slate-900">Tableau de Bord</Link>
                            <span>/</span>
                            <span className="text-slate-900">Gestion des Commandes</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Vue d'ensemble des Commandes</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={printAllPending}
                            className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-700"
                        >
                            Imprimer toutes les étiquettes d'expédition
                        </button>
                        <button
                            type="button"
                            onClick={handleMarkPrinted}
                            disabled={selectedIds.length === 0}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Marquer comme imprimé
                        </button>
                        <button
                            type="button"
                            onClick={openBulkLabels}
                            disabled={selectedIds.length === 0}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Générer les étiquettes ({selectedIds.length})
                        </button>
                        <button
                            type="button"
                            onClick={openBulkInvoices}
                            disabled={selectedIds.length === 0}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Générer les factures
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Commandes</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{orders.total || rows.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Chiffre d'affaires</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{money(summary.total)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Commandes à Traiter</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{summary.pending}</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200">
                        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 text-sm font-semibold transition ${
                                        activeTab === tab.id
                                            ? 'border-slate-950 text-slate-950'
                                            : 'border-transparent text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
                            <form onSubmit={handleSearch} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <input
                                        type="text"
                                        placeholder="Rechercher par N° commande, client ou téléphone"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                    >
                                        Rechercher les commandes
                                    </button>
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            Effacer la recherche
                                        </button>
                                    )}
                                </div>
                            </form>

                            {selectedIds.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-semibold text-slate-700">{selectedIds.length} commande(s) sélectionnée(s)</span>
                                    <button type="button" onClick={() => handleBulkStatus('exp\u00e9di\u00e9')} className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                                        Marquer comme expédiée
                                    </button>
                                    <button type="button" onClick={() => handleBulkStatus('livr\u00e9')} className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                                        Marquer comme livrée
                                    </button>
                                    <button type="button" onClick={() => setSelectedIds([])} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-900">
                                        Annuler la sélection
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hidden min-w-[1050px] w-full border-collapse text-left lg:table">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedAll}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                                        />
                                    </th>
                                    <th className="px-4 py-3">N° Commande</th>
                                    <th className="px-4 py-3">Date de commande</th>
                                    <th className="px-4 py-3">Nom du client</th>
                                    <th className="px-4 py-3">Statut du paiement</th>
                                    <th className="px-4 py-3">Statut de la livraison</th>
                                    <th className="px-4 py-3">Nb. Articles</th>
                                    <th className="px-4 py-3 text-right">Montant total</th>
                                    <th className="px-4 py-3">Statut de la commande</th>
                                    <th className="px-4 py-3 text-right">Actions rapides</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {rows.length > 0 ? (
                                    rows.map((order) => (
                                        <tr key={order.id} className={`transition hover:bg-slate-50 ${selectedIds.includes(order.id) ? 'bg-blue-50/40' : 'bg-white'}`}>
                                            <td className="px-4 py-4 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={() => handleSelectOne(order.id)}
                                                    className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-middle">
                                                <div className="font-semibold text-slate-950">#{order.id}</div>
                                                <div className="mt-1 text-[11px] text-slate-500">
                                                    {order.is_printed ? 'Étiquette imprimée' : 'Étiquette non imprimée'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-middle text-slate-600">{order.created_at}</td>
                                            <td className="px-4 py-4 align-middle">
                                                <div className="font-medium text-slate-950">{order.customer_name}</div>
                                            </td>
                                            <td className="px-4 py-4 align-middle">
                                                <PaymentBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-4 align-middle">
                                                <FulfillmentBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-4 align-middle text-slate-600">{order.items_count} article(s)</td>
                                            <td className="px-4 py-4 text-right align-middle font-semibold text-slate-950">{money(order.total_price)}</td>
                                            <td className="px-4 py-4 align-middle">
                                                <div className="flex min-w-32 flex-col items-start gap-2">
                                                    <StatusBadge status={order.status} />
                                                    <select
                                                        value={canonicalStatus(order.status)}
                                                        onChange={(e) => handleSingleStatusChange(order.id, e.target.value)}
                                                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                                    >
                                                        {statusOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-middle">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openLabel(order.id)}
                                                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                    >
                                                        Voir l'étiquette
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openInvoice(order.id)}
                                                        className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                                    >
                                                        Voir la facture
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-16 text-center">
                                            <div className="mx-auto max-w-sm">
                                                <h3 className="text-sm font-semibold text-slate-950">Aucune commande correspondante trouvée</h3>
                                                <p className="mt-1 text-sm text-slate-500">Ajustez les filtres ou votre recherche pour trouver des commandes.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                            {rows.length > 0 ? (
                                rows.map((order) => (
                                    <div key={order.id} className={`rounded-xl border ${selectedIds.includes(order.id) ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={() => handleSelectOne(order.id)}
                                                    className="mt-1 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-950">#{order.id}</span>
                                                        <StatusBadge status={order.status} />
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium text-slate-950">{order.customer_name}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">{order.created_at}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-slate-950">{money(order.total_price)}</p>
                                                <p className="mt-1 text-[10px] text-slate-500">{order.is_printed ? 'Étiquette imprimée' : 'Étiquette non imprimée'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <PaymentBadge status={order.status} />
                                            <FulfillmentBadge status={order.status} />
                                            <span className="text-xs text-slate-600">{order.items_count} article(s)</span>
                                        </div>

                                        <div className="mt-3 flex flex-col gap-2">
                                            <select
                                                value={canonicalStatus(order.status)}
                                                onChange={(e) => handleSingleStatusChange(order.id, e.target.value)}
                                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                            >
                                                {statusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openLabel(order.id)}
                                                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                                >
                                                    Voir l'étiquette
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openInvoice(order.id)}
                                                    className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                                >
                                                    Voir la facture
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-950">Aucune commande correspondante trouvée</h3>
                                    <p className="mt-1 text-sm text-slate-500">Ajustez les filtres ou votre recherche pour trouver des commandes.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {orders.links && orders.links.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                            <p className="text-xs font-medium text-slate-500">
                                Page {orders.current_page || 1} sur {orders.last_page || 1} pages
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                                {orders.links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || '#'}
                                        preserveScroll
                                        preserveState
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-slate-950 text-white'
                                                : link.url
                                                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                                                    : 'pointer-events-none text-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
