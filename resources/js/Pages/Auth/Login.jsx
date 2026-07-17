import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, errors, processing } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center p-4 sm:p-6 antialiased font-sans">
            <Head title="Connexion - monocle." />

            {/* 📱 RESPONSIVE WIDTH & PADDING FOR LOGIN CONTAINER */}
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">

                {/* Brand Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 inline-flex items-center gap-1.5 justify-center">
                        <span className="bg-slate-900 text-white p-1.5 rounded-lg text-xs shadow-2xs">👓</span>
                        <span>monocle<span className="text-blue-600 font-black">.</span></span>
                    </Link>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-2 font-medium px-2">Authentification requise pour accéder à votre espace.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                    {/* Adresse Email */}
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

                    {/* Mot de passe */}
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wide">Mot de passe</label>
                        </div>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full mt-1.5 border border-slate-200 bg-[#fbfbfc] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white transition"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.password}</p>}
                    </div>

                    {/* Submit Main Button Slate Style */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition shadow-xs mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-99 truncate"
                    >
                        {processing ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                {/* Footer Switch Link */}
                <div className="text-center mt-6 pt-4 border-t border-slate-100">
                    <Link href="/register" className="text-xs text-slate-400 hover:text-blue-600 font-semibold transition block">
                        Pas encore de compte ? <span className="underline text-slate-600 hover:text-blue-600">S'inscrire</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
