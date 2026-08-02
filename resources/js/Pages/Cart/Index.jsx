import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function Index() {
    const { t } = useTranslation();
    const { cart, auth, flash, userShipping, cartCount } = usePage().props;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const cartItems = cart || [];

    const marocCities = [
        "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Meknès",
        "Oujda", "Kenitra", "Tétouan", "Safi", "Temara", "Salé", "Mohammedia",
        "Béni Mellal", "El Jadida", "Taza", "Nador", "Settat", "Larache",
        "Ksar El Kebir", "Khemisset", "Guelmim", "Berrechid", "Ouarzazate"
    ].sort();

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        customer_city: '',
        customer_address: ''
    });

    useEffect(() => {
        if (auth.user) {
            setData(prev => ({
                ...prev,
                customer_name: auth.user.name || '',
                customer_phone: userShipping?.phone || '',
                customer_city: userShipping?.city || '',
                customer_address: userShipping?.address || ''
            }));
        }
    }, [userShipping, auth.user]);

    const totalPrice = cartItems.reduce((total, item) => {
        return total + (Number(item.price) * item.quantity);
    }, 0);

    const handleQuantityChange = (itemKey, currentQty, newQty) => {
        if (newQty < 1) return;
        router.patch(route('cart.update', itemKey), { quantity: newQty }, {
            preserveScroll: true
        });
    };

    const handleRemove = (itemKey) => {
        router.delete(route('cart.remove', itemKey), {
            preserveScroll: true
        });
    };

    const handleCheckout = (e) => {
        e.preventDefault();

        if (!data.customer_name || !data.customer_phone || !data.customer_city || !data.customer_address) {
            alert(t('cart.alert_fill_all_fields'));
            return;
        }

        post(route('cart.checkout'));
    };

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col justify-between">
            <Head title={t('cart.page_title')} />

            {/* HEADER */}
            <header className="sticky top-0 z-50">
                <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 shadow-lg">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-white p-1.5 hover:text-[#C2A65A] transition shrink-0"
                                aria-label="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    )}
                                </svg>
                            </button>

                            <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                                <Link href="/" className="text-white hover:text-[#C2A65A] transition">{t('navbar.explore_products')}</Link>
                                <Link href="/about-us" className="text-white hover:text-[#C2A65A] transition">{t('navbar.about_us')}</Link>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center">
                            <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0 flex-1 justify-end">
                            {!auth?.user ? (
                                <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs px-1 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    <span className="hidden sm:inline">{t('navbar.login')}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                    {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                        <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-[10px] sm:text-xs whitespace-nowrap">
                                            {t('navbar.admin_space')}
                                        </Link>
                                    )}
                                    <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5 hidden sm:inline">
                                        {t('navbar.my_profile')}
                                    </Link>
                                    <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5 hidden sm:inline">
                                        {t('navbar.my_orders')}
                                    </Link>
                                    <div className="hidden sm:block h-4 w-px bg-white/20 shrink-0" />
                                    <span className="hidden sm:inline-flex items-center gap-1 text-white font-bold max-w-[100px] truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2A65A] shrink-0"></span>
                                        {auth.user.name.split(' ')[0]}
                                </span>
                                    <button onClick={() => router.post('/logout')} className="text-white/50 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-[#0A4338] sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-white/20 sm:border-none cursor-pointer text-left transition">
                                        {t('navbar.logout')}
                                    </button>
                                </div>
                            )}

                            <Link href="/cart" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                                <span className="hidden sm:inline">Panier</span>
                                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.11-9L11.25 5.25M7.5 14.25L4.5 20.25m3-6h10.5l1.5-6H5.25l-.383-1.437a1.125 1.125 0 00-1.087-.835H2.25m0 0L4.5 20.25m16.5-6l-1.5 6m-7.5 0v-3.75" />
                                </svg>
                                <span className="bg-[#0A4338] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {cartCount || cartItems.length || 0}
                            </span>
                            </Link>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-[#C2A65A]/20 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.explore_products')}
                            </Link>
                            <Link
                                href="/about-us"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white hover:text-[#C2A65A] transition text-sm font-semibold uppercase tracking-[0.15em] py-1"
                            >
                                {t('navbar.about_us')}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
                {flash?.error && (
                    <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">
                        {t('cart.error_prefix')}{flash.error}{t('cart.error_suffix')}
                    </div>
                )}
                {flash?.warning && (
                    <div className="mb-6 bg-[#C2A65A]/10 border border-[#C2A65A]/30 text-[#0A4338] px-4 py-3 rounded-xl text-xs font-semibold">
                        {t('cart.warning_prefix')}{flash.warning}{t('cart.warning_suffix')}
                    </div>
                )}

                <div className="mb-6 sm:mb-8 border-b border-[#E5E7EB]/60 pb-4 sm:pb-5">
                    <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#0A4338]">{t('cart.title')}</h1>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-1">{t('cart.description')}</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] text-center shadow-sm">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#C2A65A]/10 border border-[#C2A65A]/30 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        <p className="text-[#6B7280] text-xs font-medium mb-4">{t('cart.empty_cart_message')}</p>
                        <Link href="/" className="bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition inline-block uppercase tracking-wider">{t('cart.discover_products')}</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">

                        {/* Cart items */}
                        <div className="md:col-span-7 space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.cart_key} className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex items-center gap-3 sm:gap-4 w-full">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#fcfcfd] border border-[#E5E7EB] rounded-xl overflow-hidden flex items-center justify-center p-2 shadow-inner shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="text-[8px] text-neutral-300 font-bold uppercase">{t('cart.product_image_placeholder')}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xs sm:text-sm font-bold text-[#111111] capitalize truncate">
                                                {item.name}
                                                {item.variant_description && <span className="text-[#6B7280] text-[10px] sm:text-xs font-medium ml-1">({item.variant_description})</span>}
                                            </h3>
                                            {item.sku && <p className="text-[#6B7280] text-[10px] sm:text-xs mt-0.5 font-medium">SKU: {item.sku}</p>}
                                            <div className="flex items-baseline gap-2 mt-0.5">
                                                {item.has_discount ? (
                                                    <>
                                                        <p className="text-rose-600 text-[11px] sm:text-xs font-bold">{Number(item.price).toFixed(2)} DH</p>
                                                        <p className="text-[#6B7280] text-[10px] sm:text-xs line-through font-medium">{Number(item.original_price).toFixed(2)} DH</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[#6B7280] text-[11px] sm:text-xs font-semibold">{Number(item.price).toFixed(2)} DH</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-[#F8F7F4] pt-2 sm:pt-0 sm:border-none w-full sm:w-auto">
                                        <div className="flex items-center border border-[#E5E7EB] rounded-xl bg-[#F8F7F4]/50 h-8">
                                            <button type="button" onClick={() => handleQuantityChange(item.cart_key, item.quantity, item.quantity - 1)} className="px-2.5 h-full bg-white text-[#6B7280] font-bold text-xs border-r border-[#E5E7EB]/60 hover:text-[#0F5C4D] transition">-</button>
                                            <span className="px-3 text-xs font-bold text-[#111111]">{item.quantity}</span>
                                            <button type="button" onClick={() => handleQuantityChange(item.cart_key, item.quantity, item.quantity + 1)} className="px-2.5 h-full bg-white text-[#6B7280] font-bold text-xs border-l border-[#E5E7EB]/60 hover:text-[#0F5C4D] transition">+</button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-[#111111] text-xs w-16 text-right">{(Number(item.price) * item.quantity).toFixed(2)} DH</span>
                                            <button type="button" onClick={() => handleRemove(item.cart_key)} className="text-neutral-300 hover:text-rose-600 text-xs font-bold p-2 transition">{t('cart.remove_item')}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout form */}
                        <form onSubmit={handleCheckout} className="md:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-1">{t('cart.shipping_info_title')}</h2>
                                <p className="text-[11px] text-[#6B7280]">{t('cart.shipping_info_description')}</p>
                            </div>

                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-[#6B7280] mb-1">{t('cart.name_label')}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('cart.name_placeholder')}
                                        className="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                    />
                                    {errors.customer_name && <p className="text-rose-600 text-[10px] mt-1">{errors.customer_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-[#6B7280] mb-1">{t('cart.phone_label')}</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder={t('cart.phone_placeholder')}
                                        className="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition"
                                        value={data.customer_phone}
                                        onChange={e => setData('customer_phone', e.target.value)}
                                    />
                                    {errors.customer_phone && <p className="text-rose-600 text-[10px] mt-1">{errors.customer_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-[#6B7280] mb-1">{t('cart.city_label')}</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-xl p-3 pr-8 text-xs font-medium focus:outline-none focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition cursor-pointer appearance-none"
                                            value={data.customer_city}
                                            onChange={e => setData('customer_city', e.target.value)}
                                        >
                                            <option value="" disabled>{t('cart.city_select_placeholder')}</option>
                                            {marocCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7280]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.customer_city && <p className="text-rose-600 text-[10px] mt-1">{errors.customer_city}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-[#6B7280] mb-1">{t('cart.address_label')}</label>
                                    <textarea
                                        required
                                        rows="2"
                                        placeholder={t('cart.address_placeholder')}
                                        className="w-full bg-[#F8F7F4] border border-[#E5E7EB] rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#C2A65A] focus:bg-white focus:ring-2 focus:ring-[#C2A65A]/20 transition resize-none"
                                        value={data.customer_address}
                                        onChange={e => setData('customer_address', e.target.value)}
                                    />
                                    {errors.customer_address && <p className="text-rose-600 text-[10px] mt-1">{errors.customer_address}</p>}
                                </div>
                            </div>

                            <div className="border-t border-[#E5E7EB] pt-4">
                                <div className="flex justify-between mb-4 items-baseline">
                                    <span className="text-[#6B7280] text-xs font-medium">{t('cart.total_amount_label')}</span>
                                    <span className="text-xl font-black text-[#0A4338] tracking-tight">{totalPrice.toFixed(2)} DH</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full text-xs font-bold py-3.5 rounded-xl shadow-md transition uppercase tracking-wider ${
                                        processing
                                            ? 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'
                                            : 'bg-[#0A4338] hover:bg-[#C2A65A] hover:text-[#0A4338] text-white cursor-pointer active:scale-98'
                                    }`}
                                >
                                    {processing ? t('cart.processing') : t('cart.confirm_order')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <Link href="/" className="text-lg font-serif tracking-wide text-white">
                            5witm<span className="text-[#C2A65A]">.</span>
                        </Link>
                        <p className="text-[11px] text-white/50 font-medium">© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
