import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-4 sm:p-6 antialiased font-sans">
            <Head title="Créer un compte - monocle." />

            {/* 📱 RESPONSIVE WIDTH & PADDING FOR CONTAINER */}
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">

                {/* Brand Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 inline-flex items-center gap-1.5 justify-center">
                        <span className="bg-slate-900 text-white p-1.5 rounded-lg text-xs shadow-2xs">👓</span>
                        <span>monocle<span className="text-blue-600 font-black">.</span></span>
                    </Link>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-2 font-medium px-2">Créez votre accès client pour suivre vos commandes d'optique.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                    {/* Nom Complet */}
                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wide">Nom Complet</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full mt-1.5 border border-slate-200 bg-[#fbfbfc] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white transition"
                            placeholder="Ex: Aymane El-Khair"
                        />
                        {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wide">Adresse Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full mt-1.5 border border-slate-200 bg-[#fbfbfc] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white transition"
                            placeholder="nom@exemple.com"
                        />
                        {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.email}</p>}
                    </div>

                    {/* 📱 GRID RESPONSIVE: Stacked on mobile, 2 columns on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wide">Mot de passe</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full mt-1.5 border border-slate-200 bg-[#fbfbfc] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wide">Confirmation</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="w-full mt-1.5 border border-slate-200 bg-[#fbfbfc] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.password}</p>}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition shadow-xs mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-99 truncate"
                    >
                        {processing ? 'Création en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                {/* Footer Link Switcher */}
                <div className="text-center mt-6 pt-4 border-t border-slate-100">
                    <Link href="/login" className="text-xs text-slate-400 hover:text-blue-600 font-semibold transition block">
                        Déjà inscrit ? <span className="underline text-slate-600 hover:text-blue-600">Se connecter</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
