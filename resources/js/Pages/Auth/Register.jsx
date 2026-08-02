import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

export default function Register() {
    const { t } = useTranslation();
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
        <div className="bg-[#F8F7F4] min-h-screen flex flex-col antialiased font-sans relative overflow-hidden">
            <Header />
            <Head title={t('register.page_title')} />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(194,166,90,0.08),transparent_60%)]" />

            <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xl relative z-10">

                <div className="text-center mb-6 sm:mb-8">
                    <Link href="/" className="text-xl font-serif tracking-wide text-[#0A4338] inline-flex items-center gap-1.5 justify-center">
                        <span>5witm<span className="text-[#C2A65A] font-black">.</span></span>
                    </Link>
                    <div className="mt-3 mb-4 h-px w-12 bg-[#C2A65A]/40 mx-auto" />
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-2 font-medium px-2">{t('register.description')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-[#6B7280] tracking-wide">{t('register.name_label')}</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full mt-1.5 border border-[#E5E7EB] bg-[#F8F7F4] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-[#111111] placeholder-[#9CA3AF] focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                            placeholder={t('register.name_placeholder')}
                        />
                        {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-[#6B7280] tracking-wide">{t('register.email_label')}</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full mt-1.5 border border-[#E5E7EB] bg-[#F8F7F4] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-[#111111] placeholder-[#9CA3AF] focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                            placeholder={t('register.email_placeholder')}
                        />
                        {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-bold uppercase text-[#6B7280] tracking-wide">{t('register.password_label')}</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full mt-1.5 border border-[#E5E7EB] bg-[#F8F7F4] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-[#111111] placeholder-[#9CA3AF] focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] sm:text-xs font-bold uppercase text-[#6B7280] tracking-wide">{t('register.confirm_password_label')}</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="w-full mt-1.5 border border-[#E5E7EB] bg-[#F8F7F4] p-3 rounded-xl outline-none text-xs sm:text-sm font-semibold text-[#111111] placeholder-[#9CA3AF] focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">⚠️ {errors.password}</p>}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-xs font-bold py-3 sm:py-3.5 rounded-xl transition shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 uppercase tracking-wider"
                    >
                        {processing ? t('register.creating_account') : t('register.create_account_button')}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-[#E5E7EB]">
                    <Link href="/login" className="text-xs text-[#6B7280] hover:text-[#0F5C4D] font-semibold transition block">
                        {t('register.already_customer_prefix')} <span className="underline text-[#111111] hover:text-[#0F5C4D]">{t('register.login_button')}</span>
                    </Link>
                    <Link href="/about-us" className="text-xs text-[#6B7280] hover:text-[#0F5C4D] font-semibold transition block mt-2">
                        {t('navbar.about_us', 'À propos')}
                    </Link>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
}
