import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from 'react-i18next';

function money(value) {
    return `${Number(value || 0).toFixed(2)} DH`;
}

function StockBadge({ stock }) {
    const { t } = useTranslation();
    const qty = Number(stock || 0);
    const styles = qty <= 0
        ? 'bg-red-100 text-red-900'
        : qty <= 5
            ? 'bg-yellow-100 text-yellow-900'
            : 'bg-green-100 text-green-900';

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
            {qty <= 0 ? t('admin.products.out_of_stock') : t('admin.products.in_stock', { count: qty })}
        </span>
    );
}

export default function Index({ products }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    // Access the actual array of products from the 'data' property of the resource collection
    const productList = useMemo(() => products.data || [], [products.data]);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return productList;

        return productList.filter((product) => {
            return [product.name, product.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [productList, search]);

    const summary = useMemo(() => {
        return productList.reduce( // Use productList here
            (acc, product) => {
                // If product has variants, sum up stock and value from enabled product_variants
                if (product.has_variants && product.product_variants && product.product_variants.length > 0) {
                    const enabledVariants = product.product_variants.filter(v => v.status);
                    enabledVariants.forEach(variant => {
                        acc.value += Number(variant.price || product.price || 0) * Number(variant.stock || 0);
                        if (Number(variant.stock || 0) <= 0) acc.out += 1;
                    });
                } else {
                    // For simple products
                    acc.value += Number(product.price || 0) * Number(product.stock || 0);
                    if (Number(product.stock || 0) <= 0) acc.out += 1;
                }
                return acc;
            },
            { value: 0, out: 0 }
        );
    }, [productList]); // Depend on productList

    const handleDelete = (id) => {
        if (confirm(t('admin.products.delete_confirm'))) {
            router.delete(route('admin.products.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title={t('admin.products.page_title')} />

            <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{t('admin.products.catalog_management')}</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{t('admin.products.product_list_title')}</h1>
                    </div>
                    <Link
                        href={route('admin.products.create')}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
                    >
                        {t('admin.products.add_new_product_button')}
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t('admin.products.total_products_card')}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{productList.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t('admin.products.total_stock_value_card')}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{money(summary.value)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t('admin.products.out_of_stock_products_card')}</p>
                        <p className={`mt-2 text-2xl font-semibold ${summary.out > 0 ? 'text-red-700' : 'text-slate-950'}`}>{summary.out}</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.products.search_placeholder')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 md:max-w-sm"
                        />
                        <p className="text-xs font-medium text-slate-500">{t('admin.products.products_found', { count: filteredProducts.length })}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hidden min-w-[800px] w-full border-collapse text-left lg:table">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-3 w-[45%]">{t('admin.products.table_header_product_details')}</th>
                                    <th className="px-4 py-3">{t('admin.products.table_header_unit_price')}</th>
                                    <th className="px-4 py-3">{t('admin.products.table_header_stock_status')}</th>
                                    <th className="px-4 py-3">{t('admin.products.table_header_stock_value')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin.products.table_header_quick_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="bg-white transition hover:bg-slate-50">
                                            <td className="px-3 py-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                                                        {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold text-slate-400">{t('admin.products.image_not_available')}</span>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-950 text-sm">
                                                            {product.name}
                                                            {product.has_variants && product.product_variants && product.product_variants.length > 0 && (
                                                                <span className="ml-1 text-xs text-slate-500">({product.product_variants.length} {t('admin.products.variants')})</span>
                                                            )}
                                                        </p>
                                                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description || t('admin.products.no_description_provided')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-950">
                                                {product.has_variants && product.product_variants && product.product_variants.length > 0
                                                    ? (() => {
                                                        const enabledVariants = product.product_variants.filter(v => v.status);
                                                        const prices = enabledVariants.map(v => v.price !== null ? v.price : product.price);
                                                        const minPrice = prices.length > 0 ? Math.min(...prices) : product.price;
                                                        const maxPrice = prices.length > 0 ? Math.max(...prices) : product.price;
                                                        return minPrice === maxPrice ? money(minPrice) : `${money(minPrice)} - ${money(maxPrice)}`;
                                                    })()
                                                    : money(product.price)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <StockBadge
                                                    stock={product.has_variants && product.product_variants
                                                        ? product.product_variants.filter(v => v.status).reduce((sum, v) => sum + v.stock, 0)
                                                        : product.stock
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-slate-700">
                                                {money(
                                                    product.has_variants && product.product_variants
                                                        ? product.product_variants.filter(v => v.status).reduce((sum, v) => sum + (Number(v.price || product.price || 0) * Number(v.stock || 0)), 0)
                                                        : (Number(product.price || 0) * Number(product.stock || 0))
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.products.edit', product.id)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                                        {t('admin.products.edit_product_button')}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                    >
                                                        {t('admin.products.delete_product_button')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-16 text-center">
                                            <h3 className="text-sm font-semibold text-slate-950">{t('admin.products.no_matching_products_title')}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{t('admin.products.no_matching_products_description')}</p>
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
                                                {product.image ? <img src={product.image} alt="" className="h-full w-full object-contain" /> : <span className="text-[10px] font-semibold text-slate-400">{t('admin.products.image_not_available')}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-950 truncate">
                                                    {product.name}
                                                    {product.has_variants && product.product_variants && product.product_variants.length > 0 && (
                                                        <span className="ml-1 text-xs text-slate-500">({product.product_variants.length} {t('admin.products.variants')})</span>
                                                    )}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description || t('admin.products.no_description_provided')}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <StockBadge
                                                        stock={product.has_variants && product.product_variants
                                                            ? product.product_variants.reduce((sum, v) => sum + v.stock, 0)
                                                            : product.stock
                                                        }
                                                    />
                                                    <span className="text-sm font-semibold text-slate-950">
                                                        {product.has_variants && product.product_variants && product.product_variants.length > 0
                                                            ? `${money(Math.min(...product.product_variants.map(v => v.price !== null ? v.price : product.price)))} - ${money(Math.max(...product.product_variants.map(v => v.price !== null ? v.price : product.price)))}`
                                                            : money(product.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                            <Link href={route('admin.products.edit', product.id)} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 text-center">
                                                {t('admin.products.edit_product_button')}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product.id)}
                                                className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                {t('admin.products.delete_product_button')}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <h3 className="text-sm font-semibold text-slate-950">{t('admin.products.no_matching_products_title')}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{t('admin.products.no_matching_products_description')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
