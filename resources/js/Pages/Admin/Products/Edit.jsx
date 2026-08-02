import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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

const extractValueId = (typeIndex, valueIndex, valObj) => {
    if (valObj.id) return valObj.id;
    return `${typeIndex}_${valueIndex}`;
};

const generateCombinations = (variantTypes) => {
    const activeTypes = variantTypes.filter(
        t => t.name && t.name.trim() !== '' && t.values && t.values.length > 0
    );
    if (activeTypes.length === 0) return [];

    const cartesian = (args) => {
        return args.reduce((a, b) => {
            return a.flatMap(d => b.map(e => [d, e].flat()));
        }, [[]]);
    };

    const valueArrays = activeTypes.map((type, tIndex) =>
        type.values
            .filter(v => v.value && v.value.trim() !== '')
            .map((val, vIndex) => ({
                id: extractValueId(tIndex, vIndex, val),
                typeName: type.name,
                value: val.value
            }))
    );

    if (valueArrays.some(arr => arr.length === 0)) return [];

    const combinations = cartesian(valueArrays);

    return combinations.map(combination => {
        const combArray = Array.isArray(combination) ? combination : [combination];
        const variantValueIds = combArray.map(item => item.id);
        const name = combArray.map(item => item.value).join(' / ');

        return {
            id: null,
            variant_value_ids: variantValueIds,
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

export default function Edit({ product: rawProduct }) {
    const product = rawProduct?.data || rawProduct || {};
    const { t } = useTranslation();

    const initialVariantPreviews = {};
    product.variant_types?.forEach((vt, tIndex) => {
        vt.values?.forEach((vv, vIndex) => {
            const key = vv.id || `${tIndex}_${vIndex}`;
            if (vv.images && vv.images.length > 0) {
                initialVariantPreviews[key] = vv.images[0].image_path;
            } else if (vv.image_path) {
                initialVariantPreviews[key] = vv.image_path;
            }
        });
    });

    const initialProductVariants = useMemo(() => {
        if (!product.product_variants) return [];
        return product.product_variants.map(pv => {
            let valueIds = pv.variant_value_ids || [];

            if ((!valueIds || valueIds.length === 0) && pv.variant_values) {
                valueIds = pv.variant_values.map(vv => vv.id);
            }

            return {
                ...pv,
                discount_price: pv.discount_price || pv.sale_price || '',
                variant_value_ids: valueIds,
                name: pv.name || (pv.variant_values ? pv.variant_values.map(vv => vv.value).join(' / ') : '')
            };
        });
    }, [product.product_variants]);

    const { data, setData, post, transform, errors, processing } = useForm({
        _method: 'PUT',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        categories: product.categories || [],
        brand: product.brand || '',
        reference: product.reference || '',
        status: product.status || 'Active',
        featured: product.featured || false,
        price: product.price || '',
        sale_price: product.sale_price || product.discount_price || '',
        stock: product.stock || 0,
        sku: product.sku || '',
        weight: product.weight || '',
        barcode: product.barcode || '',
        image: null,
        current_image: product.image || null,
        gallery: [],
        existing_gallery_images: product.images || [],
        has_variants: product.has_variants || false,
        variant_types: product.variant_types || [],
        product_variants: initialProductVariants,
    });

    const [mainImagePreview, setMainImagePreview] = useState(product.image || null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [variantValueImagePreviews, setVariantValueImagePreviews] = useState(initialVariantPreviews);

    const totalVariantStock = useMemo(() => {
        if (!data.has_variants) return Number(data.stock) || 0;
        return data.product_variants.reduce((sum, pv) => sum + (Number(pv.stock) || 0), 0);
    }, [data.has_variants, data.stock, data.product_variants]);

    const updateVariantTypes = (newTypes) => {
        const generated = generateCombinations(newTypes);

        const mergedVariants = generated.map(newPv => {
            const existingPv = data.product_variants.find(oldPv => {
                const oldIds = oldPv.variant_value_ids ? [...oldPv.variant_value_ids].map(String).sort() : [];
                const newIds = [...newPv.variant_value_ids].map(String).sort();
                return JSON.stringify(oldIds) === JSON.stringify(newIds);
            });
            return existingPv ? { ...existingPv, name: newPv.name } : newPv;
        });

        setData(prev => ({
            ...prev,
            variant_types: newTypes,
            product_variants: mergedVariants
        }));
    };

    const handleMainImageChange = (file) => {
        if (!file) {
            setData('image', null);
            setMainImagePreview(data.current_image);
            return;
        }
        setData('image', file);
        setMainImagePreview(URL.createObjectURL(file));
    };

    const handleGalleryChange = (files) => {
        const fileArray = Array.from(files);
        setData('gallery', [...data.gallery, ...fileArray]);
        setGalleryPreviews(prev => [...prev, ...fileArray.map(f => URL.createObjectURL(f))]);
    };

    const removeExistingGalleryImage = (id) => {
        if (confirm('Delete this gallery image?')) {
            router.delete(route('admin.product-images.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('existing_gallery_images', data.existing_gallery_images.filter(img => img.id !== id));
                },
            });
        }
    };

    const removeNewGalleryImage = (index) => {
        setData('gallery', data.gallery.filter((_, i) => i !== index));
        setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    };

    const addVariantType = () => {
        const newTypes = [...data.variant_types, { id: null, name: '', order: data.variant_types.length, values: [] }];
        updateVariantTypes(newTypes);
    };

    const removeVariantType = (tIndex) => {
        const typeToRemove = data.variant_types[tIndex];
        if (typeToRemove.id && !confirm('Delete option group and associated combinations?')) return;

        const newTypes = data.variant_types.filter((_, idx) => idx !== tIndex);
        updateVariantTypes(newTypes);
    };

    const handleTypeNameChange = (tIndex, val) => {
        const newTypes = [...data.variant_types];
        newTypes[tIndex].name = val;
        updateVariantTypes(newTypes);
    };

    const addVariantValue = (tIndex) => {
        const newTypes = [...data.variant_types];
        newTypes[tIndex].values.push({
            id: `temp_${tIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            value: '',
            order: newTypes[tIndex].values.length,
            image: null,
        });
        updateVariantTypes(newTypes);
    };

    const removeVariantValue = (tIndex, vIndex) => {
        const newTypes = [...data.variant_types];
        newTypes[tIndex].values = newTypes[tIndex].values.filter((_, idx) => idx !== vIndex);
        updateVariantTypes(newTypes);
    };

    const handleValueChange = (tIndex, vIndex, val) => {
        const newTypes = [...data.variant_types];
        newTypes[tIndex].values[vIndex].value = val;
        updateVariantTypes(newTypes);
    };

    const handleValueImageChange = (tIndex, vIndex, file) => {
        if (!file) return;

        const newTypes = [...data.variant_types];
        newTypes[tIndex].values[vIndex].image = file;
        setData('variant_types', newTypes);

        const valObj = newTypes[tIndex].values[vIndex];
        const previewKey = valObj.id || `${tIndex}_${vIndex}`;

        setVariantValueImagePreviews(prev => ({
            ...prev,
            [previewKey]: URL.createObjectURL(file)
        }));
    };

    const handleVariantFieldChange = (pvIndex, field, value) => {
        const updatedVariants = [...data.product_variants];
        updatedVariants[pvIndex][field] = value;
        setData('product_variants', updatedVariants);
    };

    const submit = (e) => {
        e.preventDefault();

        transform((currentData) => {
            if (!currentData.has_variants) {
                return {
                    ...currentData,
                    variant_types: [],
                    product_variants: [],
                };
            }

            const cleanedVariants = currentData.product_variants
                .filter(pv => Array.isArray(pv.variant_value_ids) && pv.variant_value_ids.length > 0)
                .map(pv => ({
                    ...pv,
                    variant_value_ids: pv.variant_value_ids.filter(id => id !== null && id !== undefined && id !== '')
                }));

            return {
                ...currentData,
                product_variants: cleanedVariants
            };
        });

        post(route('admin.products.update', product.id), {
            forceFormData: true,
            onError: (err) => {
                console.log("Validation Errors:", err);
            },
            onSuccess: () => {
                console.log("Updated successfully!");
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Product: ${product.name || ''}`} />

            <form onSubmit={submit} className="mx-auto max-w-7xl space-y-6 pb-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                    <div>
                        <Link href={route('admin.products.index')} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
                            &larr; Back to Products
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Edit: {product.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.products.index')}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                        >
                            {processing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Details */}
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
                                    />
                                </div>
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
                            </div>
                        </div>

                        {/* Product Type Toggle */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Product Type</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${!data.has_variants ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200'}`}>
                                    <input
                                        type="radio"
                                        name="product_type"
                                        checked={!data.has_variants}
                                        onChange={() => setData('has_variants', false)}
                                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                                    />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Simple Product</span>
                                    </div>
                                </label>
                                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${data.has_variants ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200'}`}>
                                    <input
                                        type="radio"
                                        name="product_type"
                                        checked={data.has_variants}
                                        onChange={() => setData('has_variants', true)}
                                        className="mt-0.5 text-slate-900 focus:ring-slate-900"
                                    />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-900">Product with Variants</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Pricing/Stock view depending on variants state */}
                        {!data.has_variants ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="text-base font-semibold text-slate-900">Pricing & Inventory</h2>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Price *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                                        />
                                        <FieldError message={errors.price} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Discount Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.sale_price}
                                            onChange={(e) => setData('sale_price', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                                        />
                                        <FieldError message={errors.sale_price} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Stock *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                                        />
                                        <FieldError message={errors.stock} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-slate-900">Option Groups</h2>
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
                                                    <input
                                                        type="text"
                                                        value={type.name}
                                                        placeholder="Option Name (e.g., Color, Size)"
                                                        onChange={(e) => handleTypeNameChange(tIndex, e.target.value)}
                                                        className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantType(tIndex)}
                                                        className="rounded-lg p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {type.values.map((v, vIndex) => {
                                                        const key = v.id || `${tIndex}_${vIndex}`;
                                                        const previewUrl = variantValueImagePreviews[key];

                                                        return (
                                                            <div key={vIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={v.value}
                                                                    placeholder="Option Value (e.g., Red, XL)"
                                                                    onChange={(e) => handleValueChange(tIndex, vIndex, e.target.value)}
                                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none"
                                                                />

                                                                <label className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition overflow-hidden">
                                                                    {previewUrl ? (
                                                                        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
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
                                                        );
                                                    })}
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

                                {data.product_variants.length > 0 && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <h2 className="text-base font-semibold text-slate-900">Variants Matrix</h2>
                                            <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                                                Total Stock: {totalVariantStock}
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            {data.product_variants.map((pv, pvIndex) => (
                                                <div key={pvIndex} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-slate-900">{pv.name}</span>
                                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={pv.status}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'status', e.target.checked)}
                                                                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                                            />
                                                            Active
                                                        </label>
                                                    </div>

                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">SKU</label>
                                                            <input
                                                                type="text"
                                                                value={pv.sku || ''}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'sku', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.sku`]} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Stock</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={pv.stock}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                            />
                                                            <FieldError message={errors[`product_variants.${pvIndex}.stock`]} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Price Override</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={pv.price || ''}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'price', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-600">Discount Price</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={pv.discount_price || ''}
                                                                onChange={(e) => handleVariantFieldChange(pvIndex, 'discount_price', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                            />
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

                    {/* Sidebar / Media Uploads */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Main Image</h2>
                            <div className="mt-4">
                                {mainImagePreview ? (
                                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                        <img src={mainImagePreview} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('image', null);
                                                setData('current_image', null);
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
                                        <span className="mt-2 text-xs text-slate-500">Upload replacement image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => handleMainImageChange(e.target.files[0])}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-900">Gallery Images</h2>

                            {data.existing_gallery_images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {data.existing_gallery_images.map((img) => (
                                        <div key={img.id} className="relative aspect-square overflow-hidden rounded-md border border-slate-200">
                                            <img src={img.image_path} alt="" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingGalleryImage(img.id)}
                                                className="absolute top-1 right-1 rounded-full bg-red-600 p-0.5 text-white shadow cursor-pointer"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className="mt-4 flex h-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition">
                                <span className="text-xs font-semibold text-slate-700">+ Upload New Images</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => handleGalleryChange(e.target.files)}
                                />
                            </label>

                            {galleryPreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {galleryPreviews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square overflow-hidden rounded-md border border-slate-200">
                                            <img src={src} alt="" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewGalleryImage(idx)}
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
            </form>
        </AdminLayout>
    );
}
