import React, { useState, useCallback, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from 'react-i18next';
import {
    PlusIcon,
    TrashIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

// Cartesian product generator for option combinations
const generateCombinations = (variantTypes) => {
    const activeTypes = variantTypes.filter(t => t.name.trim() !== '' && t.values && t.values.length > 0);
    if (activeTypes.length === 0) return [];

    const cartesian = (args) => {
        return args.reduce((a, b) => {
            return a.flatMap(d => b.map(e => [d, e].flat()));
        }, [[]]);
    };

    const valueArrays = activeTypes.map((type, typeIdx) =>
        type.values
            .filter(v => v.value.trim() !== '')
            .map((val, valIdx) => ({
                typeIdx,
                valIdx,
                typeName: type.name,
                value: val.value
            }))
    );

    if (valueArrays.some(arr => arr.length === 0)) return [];

    const combinations = cartesian(valueArrays);

    return combinations.map(combination => {
        const combArray = Array.isArray(combination) ? combination : [combination];
        const variantValueKeys = combArray.map(item => `${item.typeIdx}_${item.valIdx}`);
        const name = combArray.map(item => item.value).join(' / ');

        return {
            id: variantValueKeys.join('-'),
            variant_value_ids: variantValueKeys,
            name: name,
            sku: '',
            stock: 0,
            price: '',
            discount_price: '',
            weight: '',
            barcode: '',
            status: true,
        };
    });
};

export default function Create() {
    const { t } = useTranslation();
    const { data, setData, errors, processing } = useForm({
        name: '',
        description: '',
        category: '',
        brand: '',
        reference: '',
        status: 'Active',
        featured: false,
        price: '',
        sale_price: '',
        stock: 0,
        sku: '',
        weight: '',
        barcode: '',
        image: null,
        gallery: [],
        has_variants: false,
        variant_types: [],
        product_variants: [],
    });

    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [variantValueImagePreviews, setVariantValueImagePreviews] = useState({});

    // Automatically recalculate total stock for variant-based products
    const totalVariantStock = useMemo(() => {
        if (!data.has_variants) return Number(data.stock) || 0;
        return data.product_variants.reduce((sum, pv) => sum + (Number(pv.stock) || 0), 0);
    }, [data.has_variants, data.stock, data.product_variants]);

    // Handle variant combinations sync
    const syncCombinations = useCallback(() => {
        if (!data.has_variants) return;

        const newGenerated = generateCombinations(data.variant_types);

        // Preserve user inputs if key combination already exists
        const preservedVariants = newGenerated.map(newPv => {
            const existing = data.product_variants.find(oldPv => oldPv.id === newPv.id);
            return existing ? { ...existing, name: newPv.name } : newPv;
        });

        setData('product_variants', preservedVariants);
    }, [data.has_variants, data.variant_types, data.product_variants, setData]);

    // Update variants when types or values change
    const updateVariantTypes = (newTypes) => {
        const generated = generateCombinations(newTypes);
        setData(prev => ({
            ...prev,
            variant_types: newTypes,
            product_variants: generated
        }));
    };

    // Main Image Drop/Select
    const handleMainImageChange = (file) => {
        if (!file) return;
        setData('image', file);
        setMainImagePreview(URL.createObjectURL(file));
    };

    // Gallery Images Drop/Select
    const handleGalleryChange = (files) => {
        const fileArray = Array.from(files);
        setData('gallery', [...data.gallery, ...fileArray]);
        setGalleryPreviews(prev => [...prev, ...fileArray.map(f => URL.createObjectURL(f))]);
    };

    const removeGalleryImage = (index) => {
        setData('gallery', data.gallery.filter((_, i) => i !== index));
        setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    };

    // Variant Type Operations
    const addVariantType = () => {
        const newTypes = [...data.variant_types, { name: '', order: data.variant_types.length, values: [] }];
        updateVariantTypes(newTypes);
    };

    const removeVariantType = (typeIndex) => {
        const newTypes = data.variant_types.filter((_, idx) => idx !== typeIndex);
        updateVariantTypes(newTypes);
    };

    const handleTypeNameChange = (typeIndex, value) => {
        const newTypes = [...data.variant_types];
        newTypes[typeIndex].name = value;
        updateVariantTypes(newTypes);
    };

    // Variant Values Operations
    const addVariantValue = (typeIndex) => {
        const newTypes = [...data.variant_types];
        newTypes[typeIndex].values.push({
            value: '',
            order: newTypes[typeIndex].values.length,
            image: null
        });
        updateVariantTypes(newTypes);
    };

    const removeVariantValue = (typeIndex, valueIndex) => {
        const newTypes = [...data.variant_types];
        newTypes[typeIndex].values = newTypes[typeIndex].values.filter((_, idx) => idx !== valueIndex);
        updateVariantTypes(newTypes);
    };

    const handleValueChange = (typeIndex, valueIndex, val) => {
        const newTypes = [...data.variant_types];
        newTypes[typeIndex].values[valueIndex].value = val;
        updateVariantTypes(newTypes);
    };

    const handleValueImageChange = (typeIndex, valueIndex, file) => {
        if (!file) return;
        const newTypes = [...data.variant_types];
        newTypes[typeIndex].values[valueIndex].image = file;
        setData('variant_types', newTypes);

        const key = `${typeIndex}_${valueIndex}`;
        setVariantValueImagePreviews(prev => ({
            ...prev,
            [key]: URL.createObjectURL(file)
        }));
    };

    const handleVariantFieldChange = (pvIndex, field, value) => {
        const updatedVariants = [...data.product_variants];
        updatedVariants[pvIndex][field] = value;
        setData('product_variants', updatedVariants);
    };

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name || '');
        formData.append('description', data.description || '');
        formData.append('category', data.category || '');
        formData.append('brand', data.brand || '');
        formData.append('reference', data.reference || '');
        formData.append('status', data.status || 'Active');
        formData.append('featured', data.featured ? '1' : '0');
        formData.append('has_variants', data.has_variants ? '1' : '0');

        if (!data.has_variants) {
            formData.append('price', data.price !== '' && data.price !== null ? data.price : '');
            formData.append('sale_price', data.sale_price || '');
            formData.append('stock', data.stock !== '' && data.stock !== null ? data.stock : '0');
            formData.append('sku', data.sku || '');
            formData.append('weight', data.weight || '');
            formData.append('barcode', data.barcode || '');
        }

        if (data.image) {
            formData.append('image', data.image);
        }

        if (data.gallery && data.gallery.length > 0) {
            data.gallery.forEach((file, index) => {
                formData.append(`gallery[${index}]`, file);
            });
        }

        if (data.has_variants) {
            data.variant_types.forEach((type, tIndex) => {
                formData.append(`variant_types[${tIndex}][name]`, type.name || '');
                formData.append(`variant_types[${tIndex}][order]`, type.order ?? 0);

                if (type.values && type.values.length > 0) {
                    type.values.forEach((v, vIndex) => {
                        formData.append(`variant_types[${tIndex}][values][${vIndex}][value]`, v.value || '');
                        formData.append(`variant_types[${tIndex}][values][${vIndex}][order]`, v.order ?? 0);
                        if (v.image) {
                            formData.append(`variant_types[${tIndex}][values][${vIndex}][image]`, v.image);
                        }
                    });
                }
            });

            data.product_variants.forEach((pv, pvIndex) => {
                if (pv.variant_value_ids && pv.variant_value_ids.length > 0) {
                    pv.variant_value_ids.forEach((id, idIndex) => {
                        formData.append(`product_variants[${pvIndex}][variant_value_ids][${idIndex}]`, id);
                    });
                }
                formData.append(`product_variants[${pvIndex}][sku]`, pv.sku || '');
                formData.append(`product_variants[${pvIndex}][stock]`, pv.stock ?? 0);

                if (pv.price !== '' && pv.price !== null && pv.price !== undefined) {
                    formData.append(`product_variants[${pvIndex}][price]`, pv.price);
                }

                if (pv.discount_price !== '' && pv.discount_price !== null && pv.discount_price !== undefined) {
                    formData.append(`product_variants[${pvIndex}][discount_price]`, pv.discount_price);
                }

                formData.append(`product_variants[${pvIndex}][weight]`, pv.weight || '');
                formData.append(`product_variants[${pvIndex}][barcode]`, pv.barcode || '');
                formData.append(`product_variants[${pvIndex}][status]`, pv.status ? '1' : '0');
            });
        }

        router.post(route('admin.products.store'), formData, {
            forceFormData: true,
            onError: (errs) => {
                console.error("Validation Errors:", errs);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={t('admin.products.create.page_title', 'Create Product')} />

            <form onSubmit={submit} className="mx-auto max-w-7xl space-y-6 pb-12">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                    <div>
                        <Link href={route('admin.products.index')} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
                            &larr; {t('admin.products.create.back_to_list', 'Back to Products')}
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            {t('admin.products.create.main_title', 'Create New Product')}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.products.index')}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                            {t('admin.products.create.cancel_button', 'Cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                        >
                            {processing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                            {processing ? t('admin.products.create.saving', 'Saving...') : t('admin.products.create.save', 'Save Product')}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Product Info */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Product Details</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700">Product Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        placeholder="e.g. Premium Cotton T-Shirt"
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700">Description</label>
                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        placeholder="Write detailed product description..."
                                    />
                                    <FieldError message={errors.description} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Category</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Montres">Montres</option>
                                            <option value="Bijoux">Bijoux</option>
                                            <option value="Lunettes">Lunettes</option>
                                            <option value="Accessoires">Accessoires</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Brand (Optional)</label>
                                        <input
                                            type="text"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Reference / SKU</label>
                                        <input
                                            type="text"
                                            value={data.reference}
                                            onChange={(e) => setData('reference', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Type Selector */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Product Type</h2>
                            <p className="mt-1 text-xs text-slate-500">Choose how inventory and prices are managed for this item.</p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                                        !data.has_variants ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="product_type"
                                        checked={!data.has_variants}
                                        onChange={() => setData('has_variants', false)}
                                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                                    />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Simple Product</span>
                                        <span className="mt-0.5 block text-xs text-slate-500">Single price, standalone SKU, unified stock.</span>
                                    </div>
                                </label>

                                <label
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                                        data.has_variants ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="product_type"
                                        checked={data.has_variants}
                                        onChange={() => {
                                            setData('has_variants', true);
                                            syncCombinations();
                                        }}
                                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                                    />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Product with Variants</span>
                                        <span className="mt-0.5 block text-xs text-slate-500">Multiple option groups like Size, Color, or Material.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Simple Product Configuration */}
                        {!data.has_variants && (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">Pricing & Inventory</h2>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Regular Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                        <FieldError message={errors.price} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Sale Price (Optional)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.sale_price}
                                            onChange={(e) => setData('sale_price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                        <FieldError message={errors.stock} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">SKU</label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.weight}
                                            onChange={(e) => setData('weight', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Barcode / EAN</label>
                                        <input
                                            type="text"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Variants Builder */}
                        {data.has_variants && (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">Option Groups</h2>
                                            <p className="mt-0.5 text-xs text-slate-500">Define option types (e.g. Color, Size, Capacity)</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVariantType}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Option Group
                                        </button>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        {data.variant_types.map((type, tIndex) => (
                                            <div key={tIndex} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="w-full max-w-xs">
                                                        <input
                                                            type="text"
                                                            value={type.name}
                                                            onChange={(e) => handleTypeNameChange(tIndex, e.target.value)}
                                                            placeholder="Option Name (e.g. Color)"
                                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                                        />
                                                        <FieldError message={errors[`variant_types.${tIndex}.name`]} />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantType(tIndex)}
                                                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                {/* Values List */}
                                                <div className="mt-3 space-y-2">
                                                    {type.values.map((v, vIndex) => (
                                                        <div key={vIndex} className="flex items-center gap-2">
                                                            <div className="w-full">
                                                                <input
                                                                    type="text"
                                                                    value={v.value}
                                                                    onChange={(e) => handleValueChange(tIndex, vIndex, e.target.value)}
                                                                    placeholder="Value (e.g. Red, XL)"
                                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                                                />
                                                                <FieldError message={errors[`variant_types.${tIndex}.values.${vIndex}.value`]} />
                                                            </div>
                                                            <label className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition">
                                                                {variantValueImagePreviews[`${tIndex}_${vIndex}`] ? (
                                                                    <img src={variantValueImagePreviews[`${tIndex}_${vIndex}`]} alt="" className="h-full w-full object-cover rounded-lg" />
                                                                ) : (
                                                                    <PhotoIcon className="h-4 w-4 text-slate-400" />
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="sr-only"
                                                                    onChange={(e) => handleValueImageChange(tIndex, vIndex, e.target.files[0])}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVariantValue(tIndex, vIndex)}
                                                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addVariantValue(tIndex)}
                                                        className="mt-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                                                    >
                                                        + Add Value
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Generated Combinations Matrix */}
                                {data.product_variants.length > 0 && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-base font-semibold text-slate-900">Generated Combinations</h2>
                                                <p className="text-xs text-slate-500">Configure prices, SKUs, and stock for each variant.</p>
                                            </div>
                                            <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                                                Total Stock: {totalVariantStock}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            {data.product_variants.map((pv, pvIndex) => (
                                                <div key={pv.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-slate-900">{pv.name}</span>
                                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={pv.status}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'status', e.target.checked)}
                                                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                            />
                                                            Enabled
                                                        </label>
                                                    </div>

                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">SKU</label>
                                                            <input
                                                                type="text"
                                                                value={pv.sku}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'sku', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-slate-900"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.sku`]} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Stock *</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={pv.stock}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-slate-900"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.stock`]} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Price Override</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={pv.price}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'price', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-slate-900"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.price`]} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Sale Price</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={pv.discount_price}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'discount_price', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-slate-900"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.discount_price`]} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Options */}
                    <div className="space-y-6">
                        {/* Status & Visibility */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Visibility & Status</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.featured}
                                        onChange={(e) => setData('featured', e.target.checked)}
                                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <span className="text-xs font-medium text-slate-700">Featured Product</span>
                                </label>
                            </div>
                        </div>

                        {/* Main Product Image */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Main Product Image</h2>
                            <div className="mt-4">
                                {mainImagePreview ? (
                                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                        <img src={mainImagePreview} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('image', null);
                                                setMainImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white hover:bg-slate-900 transition cursor-pointer"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition">
                                        <PhotoIcon className="h-8 w-8 text-slate-400" />
                                        <span className="mt-2 text-xs text-slate-500">Drag & drop or click to upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => handleMainImageChange(e.target.files[0])}
                                        />
                                    </label>
                                )}
                                <FieldError message={errors.image} />
                            </div>
                        </div>

                        {/* Gallery Images */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Gallery Images</h2>
                            <div className="mt-4 space-y-3">
                                <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition">
                                    <span className="text-xs font-semibold text-slate-700">+ Add Gallery Photos</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => handleGalleryChange(e.target.files)}
                                    />
                                </label>

                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {galleryPreviews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-square overflow-hidden rounded-md border border-slate-200">
                                                <img src={src} alt="" className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(idx)}
                                                    className="absolute top-1 right-1 rounded-full bg-slate-900/70 p-0.5 text-white hover:bg-slate-900 cursor-pointer"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
