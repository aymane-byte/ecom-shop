import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs font-medium text-red-700">{message}</p>;
}

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: null,
        gallery: [],
    });

    const [preview, setPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setData('gallery', [...data.gallery, ...files]);
        setGalleryPreviews([...galleryPreviews, ...files.map((file) => URL.createObjectURL(file))]);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/products', { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title="Nouveau produit - Admin" />

            <form onSubmit={submit} className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link href="/admin/products" className="text-sm font-semibold text-slate-500 hover:text-slate-950">Produits</Link>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Ajouter un produit</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/products" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Annuler
                        </Link>
                        <button type="submit" disabled={processing} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {processing ? 'Creation...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="space-y-5">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-950">Informations</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Nom</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="6"
                                        className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                    />
                                    <FieldError message={errors.description} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-950">Tarification et stock</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Prix (DH)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                    />
                                    <FieldError message={errors.price} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Stock</label>
                                    <input
                                        type="number"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                                    />
                                    <FieldError message={errors.stock} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-5">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-950">Image principale</h2>
                            <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                                {preview ? <img src={preview} alt="" className="h-full w-full object-contain" /> : <span className="text-sm font-medium text-slate-400">Apercu image</span>}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 w-full text-sm text-slate-600" />
                            <FieldError message={errors.image} />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="text-base font-semibold text-slate-950">Galerie</h2>
                            <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="mt-4 w-full text-sm text-slate-600" />
                            {galleryPreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {galleryPreviews.map((src, index) => (
                                        <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                                            <img src={src} alt="" className="h-full w-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </form>
        </AdminLayout>
    );
}
