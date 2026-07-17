import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function StockBadge({ stock }) {
    const qty = Number(stock || 0);
    const styles = qty <= 0
        ? 'bg-red-100 text-red-900'
        : qty <= 5
            ? 'bg-yellow-100 text-yellow-900'
            : 'bg-green-100 text-green-900';

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
            {qty <= 0 ? 'Rupture' : `${qty} en stock`}
        </span>
    );
}

export default function Index({ products }) {
    const [search, setSearch] = useState('');

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return products;

        return products.filter((product) => {
            return [product.name, product.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [products, search]);

    const summary = useMemo(() => {
        return products.reduce(
            (acc, product) => {
                acc.value += Number(product.price || 0) * Number(product.stock || 0);
                if (Number(product.stock || 0) <= 0) acc.out += 1;
                return acc;
            },
            { value: 0, out: 0 }
        );
    }, [products]);

    const handleDelete = (id) => {
        if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
            router.delete(`/admin/products/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Produits - Admin" />

            <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Catalogue</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Produits</h1>
                    </div>
                    <Link
                        href="/admin/products/create"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
                    >
                        Ajouter un produit
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Produits</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{products.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Valeur stock</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{money(summary.value)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ruptures</p>
                        <p className={`mt-2 text-2xl font-semibold ${summary.out > 0 ? 'text-red-700' : 'text-slate-950'}`}>{summary.out}</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un produit"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 md:max-w-sm"
                        />
                        <p className="text-xs font-medium text-slate-500">{filteredProducts.length} resultat(s)</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hidden min-w-[800px] w-full border-collapse text-left lg:table">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-3 w-[45%]">Produit</th>
                                    <th className="px-4 py-3">Prix</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Valeur stock</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="bg-white transition hover:bg-slate-50">
                                            <td className="px-3 py-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                                                        {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold text-slate-400">N/A</span>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-950 text-sm">{product.name}</p>
                                                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description || 'Aucune description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-950">{money(product.price)}</td>
                                            <td className="px-4 py-4"><StockBadge stock={product.stock} /></td>
                                            <td className="px-4 py-4 text-slate-700">{money(Number(product.price || 0) * Number(product.stock || 0))}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-16 text-center">
                                            <h3 className="text-sm font-semibold text-slate-950">Aucun produit trouve</h3>
                                            <p className="mt-1 text-sm text-slate-500">Essayez une autre recherche.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex gap-3">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                                                {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold text-slate-400">N/A</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-950 truncate">{product.name}</h3>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description || 'Aucune description'}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <StockBadge stock={product.stock} />
                                                    <span className="text-sm font-semibold text-slate-950">{money(product.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                            <Link href={`/admin/products/${product.id}/edit`} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 text-center">
                                                Modifier
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product.id)}
                                                className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-950">Aucun produit trouve</h3>
                                    <p className="mt-1 text-sm text-slate-500">Essayez une autre recherche.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
