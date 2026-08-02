import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function Welcome({ products, categories }) {
    const { cartCount, flash, auth } = usePage().props;
    const { t } = useTranslation();

    const [selectedVariantValuesPerProduct, setSelectedVariantValuesPerProduct] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [toastMessage, setToastMessage] = useState(null);
    const [isLoading] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('5witm_wishlist');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('5witm_wishlist', JSON.stringify(wishlist));
        } catch (e) {
            console.error('Failed to save wishlist', e);
        }
    }, [wishlist]);

    useEffect(() => {
        if (!products) return;
        const initialSelections = {};
        products.forEach(product => {
            if (product?.has_variants && product?.product_variants?.length > 0) {
                const firstActiveVariant = product.product_variants.find(pv => pv.status && pv.stock > 0) || product.product_variants[0];
                const productInitialSelection = {};
                if (firstActiveVariant?.variant_values) {
                    firstActiveVariant.variant_values.forEach(vv => {
                        if (vv.variant_type?.name) {
                            productInitialSelection[vv.variant_type.name] = vv;
                        }
                    });
                }
                initialSelections[product.id] = productInitialSelection;
            } else {
                initialSelections[product.id] = {};
            }
        });
        setSelectedVariantValuesPerProduct(initialSelections);
    }, [products]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddToCart = useCallback((productId, productVariantId = null) => {
        const data = productVariantId ? { product_variant_id: productVariantId } : {};
        router.post(route('cart.add', productId), data, {
            preserveScroll: true,
            onSuccess: () => {
                showToast("Produit ajouté au panier.");
            }
        });
    }, []);

    const toggleWishlist = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getProductDisplayData = useCallback((product) => {
        const selectedValues = selectedVariantValuesPerProduct[product?.id] || {};
        let displayImage = product?.image;
        let selectedProductVariant = null;
        let isCombinationAvailable = true;

        if (product?.has_variants && product?.variant_types?.length > 0) {
            const selectedValueIds = Object.values(selectedValues).map(vv => vv?.id).filter(Boolean).sort();
            const allTypesSelected = product.variant_types.every(vt => selectedValues[vt.name]);

            if (allTypesSelected && selectedValueIds.length === product.variant_types.length) {
                selectedProductVariant = product?.product_variants?.find(pv => {
                    const pvValueIds = pv.variant_values?.map(vv => vv.id).sort() || [];
                    return JSON.stringify(selectedValueIds) === JSON.stringify(pvValueIds);
                });

                if (selectedProductVariant) {
                    let selectedVariantValueImage = null;
                    for (const vv of Object.values(selectedValues)) {
                        if (vv?.images && vv.images.length > 0 && vv.images[0]?.image_path) {
                            selectedVariantValueImage = vv.images[0].image_path;
                            break;
                        }
                    }

                    if (selectedVariantValueImage) {
                        displayImage = selectedVariantValueImage;
                    } else if (product?.images && product.images.length > 0) {
                        displayImage = product.images[0].image_path;
                    }
                } else {
                    isCombinationAvailable = false;
                }
            } else {
                if (!displayImage && product?.images && product.images.length > 0) {
                    displayImage = product.images[0].image_path;
                }
            }
        } else {
            if (!displayImage && product?.images && product.images.length > 0) {
                displayImage = product.images[0].image_path;
            }
        }

        return {
            displayImage,
            selectedProductVariant,
            isCombinationAvailable
        };
    }, [selectedVariantValuesPerProduct]);

    const getColorSwatches = useCallback((product) => {
        if (!product?.has_variants || !Array.isArray(product?.variant_types)) return [];
        const colorType = product.variant_types.find(vt =>
            vt.name.toLowerCase().includes('couleur') ||
            vt.name.toLowerCase().includes('color') ||
            vt.name.toLowerCase().includes('لون')
        );
        if (!colorType) return [];

        const colors = new Set();
        product.product_variants?.forEach(pv => {
            pv.variant_values?.forEach(vv => {
                if (vv.variant_type_id === colorType.id && vv.value) {
                    colors.add(vv.value);
                }
            });
        });
        return Array.from(colors).slice(0, 4);
    }, []);

    const isNewProduct = useCallback((product) => {
        if (!product?.created_at) return false;
        const created = new Date(product.created_at);
        const now = new Date();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }, []);

    const categoryOptions = useMemo(() => {
        if (categories && Array.isArray(categories) && categories.length > 0) {
            return ['Tous', ...categories.map(c => typeof c === 'string' ? c : c.name)];
        }
        return ['Tous', 'Montres', 'Bijoux', 'Lunettes', 'Accessoires'];
    }, [categories]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(product => {
            const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const productCategory = product.category;
            const matchesCategory = selectedCategory === 'Tous' ||
                (productCategory && productCategory.toLowerCase() === selectedCategory.toLowerCase());

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex flex-col justify-between overflow-x-hidden">
            <div>
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 bg-[#0A4338] text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce border border-[#C2A65A]/30">
                        <span className="text-[#C2A65A]">✓</span>
                        {toastMessage}
                    </div>
                )}

                {/* Quick View Modal */}
                {quickViewProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}>
                        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 sm:p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="font-serif text-xl text-[#111111]">{quickViewProduct.name}</h2>
                                    <button onClick={() => setQuickViewProduct(null)} className="p-2 hover:bg-neutral-100 rounded-full transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="aspect-square bg-neutral-50 rounded-2xl flex items-center justify-center mb-4">
                                    {quickViewProduct.image ? (
                                        <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-contain p-8" />
                                    ) : (
                                        <span className="text-neutral-300">Image non disponible</span>
                                    )}
                                </div>
                                <p className="text-sm text-[#6B7280] mb-4">{quickViewProduct.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-[#0F5C4D]">{quickViewProduct.display_price?.toFixed(2)} DH</span>
                                    <Link href={`/products/${quickViewProduct.id}`} className="bg-[#0F5C4D] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#2D7A69] transition">
                                        Voir le produit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes marquee-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-track {
                        display: flex;
                        width: max-content;
                        animation: marquee-scroll 32s linear infinite;
                    }
                    .marquee-track:hover {
                        animation-play-state: paused;
                    }
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.5s ease-out forwards;
                    }
                `}</style>

                {/* HEADER & NAVBAR */}
                <header className="sticky top-0 z-40">
                    {/* Announcement Bar */}
                    <div className="bg-[#0F5C4D] text-white text-center py-2 px-4 shadow-inner">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                            Livraison gratuite partout au Maroc
                        </p>
                    </div>

                    <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-3.5 sm:py-4 shadow-lg transition-all">
                        <div className="flex items-center justify-between max-w-7xl mx-auto">

                            {/* Left: Hamburger (Mobile) + Desktop Links */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="md:hidden text-white hover:text-[#C2A65A] p-2 -ml-2 transition-colors focus:outline-none"
                                    aria-label="Open Menu"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                </button>

                                <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em]">
                                    <a href="#products-grid" onClick={(e) => handleSmoothScroll(e, 'products-grid')} className="text-white/80 hover:text-[#C2A65A] transition">
                                        {t('navbar.explore_products')}
                                    </a>
                                    <Link href="/about-us" className="text-white/80 hover:text-[#C2A65A] transition">
                                        {t('navbar.about_us')}
                                    </Link>
                                </div>
                            </div>

                            {/* Center: Brand Logo */}
                            <div className="flex-1 flex justify-center text-center">
                                <Link href="/" className="text-xl sm:text-2xl font-serif tracking-widest text-white hover:opacity-90 transition">
                                    5witm<span className="text-[#C2A65A]">.</span>
                                </Link>
                            </div>

                            {/* Right Section: Actions & Desktop Auth */}
                            <div className="flex items-center gap-3 sm:gap-5 justify-end">
                                {/* Desktop Auth Links */}
                                <div className="hidden md:flex items-center gap-4 text-xs font-medium text-white/80">
                                    {!auth?.user ? (
                                        <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            {t('navbar.login')}
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                                <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-xs">
                                                    {t('navbar.admin_space')}
                                                </Link>
                                            )}
                                            <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider">
                                                {t('navbar.my_profile')}
                                            </Link>
                                            <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] uppercase tracking-wider">
                                                {t('navbar.my_orders')}
                                            </Link>
                                            <button
                                                onClick={() => router.post('/logout')}
                                                className="text-white/50 hover:text-rose-400 font-bold text-xs cursor-pointer transition"
                                            >
                                                {t('navbar.logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cart Icon (Mobile & Desktop) */}
                                <Link
                                    href="/cart"
                                    className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-3 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition shadow-md active:scale-95 border border-[#C2A65A]/20"
                                >
                                    <svg className="w-5 h-5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">Panier</span>
                                    <span className="bg-[#C2A65A] text-[#0A4338] text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                                        {cartCount || 0}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Mobile Drawer (Slide-Over Navigation) */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex">
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            />

                            {/* Drawer Panel */}
                            <div className="relative w-4/5 max-w-xs bg-[#0A4338] text-white h-full shadow-2xl flex flex-col justify-between z-10 border-r border-[#C2A65A]/20 p-6 overflow-y-auto animate-fade-in-up">
                                <div>
                                    {/* Drawer Header */}
                                    <div className="flex items-center justify-between pb-6 border-b border-[#C2A65A]/20">
                                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif tracking-widest text-white">
                                            5witm<span className="text-[#C2A65A]">.</span>
                                        </Link>
                                        <button
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="p-2 text-white/70 hover:text-white rounded-lg transition"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="mt-6 flex flex-col gap-4">
                                        <a
                                            href="#products-grid"
                                            onClick={(e) => { handleSmoothScroll(e, 'products-grid'); setMobileMenuOpen(false); }}
                                            className="text-white/90 hover:text-[#C2A65A] transition text-xs font-bold uppercase tracking-widest py-2 border-b border-white/5 flex items-center justify-between"
                                        >
                                            <span>{t('navbar.explore_products')}</span>
                                            <span className="text-[#C2A65A]">→</span>
                                        </a>
                                        <Link
                                            href="/about-us"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-white/90 hover:text-[#C2A65A] transition text-xs font-bold uppercase tracking-widest py-2 border-b border-white/5 flex items-center justify-between"
                                        >
                                            <span>{t('navbar.about_us')}</span>
                                            <span className="text-[#C2A65A]">→</span>
                                        </Link>
                                    </div>

                                    {/* User Auth Section inside Drawer */}
                                    <div className="mt-8 pt-6 border-t border-[#C2A65A]/20">
                                        {auth?.user ? (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2 mb-2 bg-[#0F5C4D] p-3 rounded-xl border border-[#C2A65A]/20">
                                                    <div className="w-8 h-8 rounded-full bg-[#C2A65A] text-[#0A4338] font-bold flex items-center justify-center text-xs">
                                                        {auth.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{auth.user.name}</p>
                                                        <p className="text-[10px] text-white/60 truncate">{auth.user.email}</p>
                                                    </div>
                                                </div>

                                                {(auth.user.is_admin == 1 || auth.user.is_admin === true) && (
                                                    <Link
                                                        href="/admin/products"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className="bg-[#C2A65A]/10 text-[#C2A65A] px-4 py-2.5 rounded-xl transition font-bold border border-[#C2A65A]/30 text-xs text-center"
                                                    >
                                                        {t('navbar.admin_space')}
                                                    </Link>
                                                )}

                                                <Link
                                                    href="/profile"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="text-xs font-medium text-white/80 hover:text-[#C2A65A] py-2 transition flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                                    {t('navbar.my_profile')}
                                                </Link>

                                                <Link
                                                    href="/orders"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="text-xs font-medium text-white/80 hover:text-[#C2A65A] py-2 transition flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5l-1.5-4.5H5.25l-1.5 4.5z" /></svg>
                                                    {t('navbar.my_orders')}
                                                </Link>

                                                <button
                                                    onClick={() => { setMobileMenuOpen(false); router.post('/logout'); }}
                                                    className="mt-4 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 transition text-center"
                                                >
                                                    {t('navbar.logout')}
                                                </button>
                                            </div>
                                        ) : (
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="w-full py-3 bg-[#C2A65A] text-[#0A4338] font-bold text-xs rounded-xl transition text-center uppercase tracking-widest block shadow-lg"
                                            >
                                                {t('navbar.login')}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Drawer Footer */}
                                <div className="pt-6 border-t border-white/10 text-center">
                                    <p className="text-[10px] text-white/50">© 5witm. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                <main className="w-full">
                    {/* Hero Section */}
                    <div
                        className="relative bg-cover bg-center bg-no-repeat text-center flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-28 overflow-hidden"
                        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
                    >
                        <div className="relative flex flex-col items-center bg-[#0A4338]/50 backdrop-blur-md border border-[#C2A65A]/30 p-8 sm:p-12 rounded-3xl max-w-4xl mx-4 shadow-2xl">
                            <span className="text-[10px] sm:text-xs font-semibold text-[#C2A65A] uppercase tracking-[0.35em]">
                                Collection Exclusive
                            </span>
                            <div className="mt-4 mb-5 h-px w-16 bg-[#C2A65A]" />

                            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white max-w-3xl leading-[1.15] text-balance">
                                L&apos;élégance intemporelle,<br className="hidden sm:block" /> pensée au Maroc
                            </h1>

                            <p className="text-xs sm:text-base text-neutral-100 mt-6 max-w-xl mx-auto leading-relaxed text-pretty">
                                Des créations haut de gamme en acier inoxydable, livrées gratuitement partout au royaume.
                            </p>

                            <a
                                href="#products-grid"
                                onClick={(e) => handleSmoothScroll(e, 'products-grid')}
                                className="mt-8 inline-flex items-center gap-2 border border-[#C2A65A] bg-[#C2A65A] text-[#0A4338] hover:bg-transparent hover:text-[#C2A65A] transition px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
                            >
                                Découvrir la collection
                            </a>
                        </div>
                    </div>

                    {/* Marquee Features */}
                    <div className="bg-[#0F5C4D] text-white overflow-hidden py-3.5 border-y border-[#0A4338]/30">
                        <div className="marquee-track">
                            {[0, 1].map((loop) => (
                                <div key={loop} className="flex items-center shrink-0" aria-hidden={loop === 1}>
                                    {[
                                        { icon: 'heart', label: 'Acier Inoxydable' },
                                        { icon: 'truck', label: 'Livraison Gratuite' },
                                        { icon: 'gift', label: '+400 Clients Satisfaits' },
                                        { icon: 'star', label: 'Bijoux Haute Qualité' },
                                    ].map((item, i) => (
                                        <div key={`${loop}-${i}`} className="flex items-center gap-2.5 px-6 sm:px-10 shrink-0 border-r border-white/15">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                {item.icon === 'heart' && (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                )}
                                                {item.icon === 'truck' && (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                )}
                                                {item.icon === 'gift' && (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.626 2.626 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18.75a.375.375 0 00.375-.375V8.25a.375.375 0 00-.375-.375H3.375A.375.375 0 003 8.25v2.625c0 .207.168.375.375.375z" />
                                                )}
                                                {item.icon === 'star' && (
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                )}
                                            </svg>
                                            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full px-4 sm:px-6 md:px-14 py-8 sm:py-12 max-w-7xl mx-auto">
                        {flash && (flash.success || flash.error || flash.warning) && (
                            <div className={`mb-8 p-4 rounded-xl text-xs font-semibold border ${
                                flash.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                    flash.warning ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                        'bg-rose-50 border-rose-200 text-rose-800'
                            }`}>
                                {flash.success || flash.warning || flash.error}
                            </div>
                        )}

                        {/* SEARCH + CATEGORY FILTER */}
                        <div id="products-grid" className="mb-8 sm:mb-10 flex flex-col gap-4">
                            <div className="relative max-w-md mx-auto w-full">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un produit..."
                                    className="w-full bg-white border border-[#E5E7EB] rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm font-medium text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0F5C4D] focus:ring-2 focus:ring-[#0F5C4D]/20 transition shadow-sm"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                                {categoryOptions.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition border ${
                                            selectedCategory === cat
                                                ? 'bg-[#0F5C4D] text-white border-[#0F5C4D] shadow-md'
                                                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0F5C4D] hover:text-[#0F5C4D]'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRODUCT GRID */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <div key={n} className="bg-white border border-[#E5E7EB] rounded-2xl p-3.5 animate-pulse space-y-3">
                                        <div className="bg-neutral-100 aspect-square rounded-xl" />
                                        <div className="h-3 bg-neutral-100 rounded w-3/4" />
                                        <div className="h-3 bg-neutral-100 rounded w-1/2" />
                                        <div className="h-8 bg-neutral-100 rounded-xl mt-4" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB]">
                                <p className="text-[#6B7280] text-xs sm:text-sm font-medium">Aucun produit ne correspond à votre recherche.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 items-stretch">
                                {filteredProducts.map((product, index) => {
                                    const {
                                        displayImage,
                                        selectedProductVariant,
                                        isCombinationAvailable
                                    } = getProductDisplayData(product);

                                    const isWishlisted = !!wishlist[product.id];
                                    const displayPrice = product.display_price;
                                    const originalPrice = product.original_price;
                                    const discountPercentage = product.discount_percentage;
                                    const hasDiscount = product.has_discount;
                                    const inStock = product.in_stock;
                                    const totalStock = product.total_stock;
                                    const colorSwatches = getColorSwatches(product);
                                    const isNew = isNewProduct(product);

                                    return (
                                        <div
                                            key={product.id}
                                            className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-[#0F5C4D]/40 hover:shadow-2xl hover:-translate-y-2 h-full relative animate-fade-in-up"
                                            style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                                        >
                                            {/* IMAGE CONTAINER */}
                                            <div className="relative bg-gradient-to-b from-neutral-50 to-white aspect-square overflow-hidden flex items-center justify-center p-4 sm:p-6">
                                                {/* Badges */}
                                                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                                                    {isNew && (
                                                        <span className="bg-[#0F5C4D] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                    {hasDiscount && inStock && (
                                                        <span className="bg-[#0F5C4D] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                                            <span>-{discountPercentage}%</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Wishlist */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => toggleWishlist(e, product.id)}
                                                    className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 active:scale-90 cursor-pointer ${
                                                        isWishlisted
                                                            ? 'bg-[#0F5C4D] border-[#0F5C4D] text-white shadow-lg shadow-[#0F5C4D]/30'
                                                            : 'bg-white/80 border-white/50 text-[#6B7280] hover:text-[#0F5C4D] hover:border-[#0F5C4D]/20 shadow-md'
                                                    }`}
                                                    title="Ajouter aux favoris"
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transition-transform ${isWishlisted ? 'scale-110' : ''}`}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="2"
                                                        fill={isWishlisted ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                    </svg>
                                                </button>

                                                {/* Stock Badge */}
                                                <span className={`absolute bottom-3 left-3 z-20 text-[9px] font-bold uppercase px-2 py-1 rounded-lg border backdrop-blur-sm ${
                                                    !inStock
                                                        ? 'bg-rose-100/90 border-rose-200 text-rose-700'
                                                        : totalStock <= 3
                                                            ? 'bg-amber-100/90 border-amber-200 text-amber-800'
                                                            : 'bg-emerald-100/90 border-emerald-200 text-emerald-800'
                                                }`}>
                                                    {!inStock ? 'Rupture' : totalStock <= 3 ? `Plus que ${totalStock}` : 'En stock'}
                                                </span>

                                                {/* Product Image */}
                                                {displayImage ? (
                                                    <img
                                                        src={displayImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300 text-xs font-medium">{t('welcome_page.image_not_available')}</span>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-[#0A4338]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setQuickViewProduct(product);
                                                        }}
                                                        className="bg-white text-[#111111] px-4 py-2.5 rounded-xl text-[11px] font-bold hover:bg-[#C2A65A] hover:text-[#0A4338] transition transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl"
                                                    >
                                                        Aperçu rapide
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CONTENT */}
                                            <div className="flex flex-col flex-1 p-3.5 sm:p-4">
                                                <Link href={`/products/${product.id}`} className="block min-w-0 flex-1">
                                                    <h3 className="font-serif text-[#111111] text-xs sm:text-sm tracking-tight capitalize line-clamp-2 group-hover:text-[#0F5C4D] transition leading-snug font-medium">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-[#6B7280] text-[11px] mt-1 line-clamp-2 leading-relaxed">
                                                        {product.description || t('welcome_page.default_description')}
                                                    </p>
                                                </Link>

                                                {/* Color Swatches */}
                                                {colorSwatches.length > 0 && (
                                                    <div className="flex items-center gap-1.5 mt-2.5">
                                                        {colorSwatches.map((color, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-4 h-4 rounded-full border border-[#E5E7EB] shadow-sm"
                                                                style={{ backgroundColor: color.toLowerCase() }}
                                                                title={color}
                                                            />
                                                        ))}
                                                        {colorSwatches.length >= 4 && (
                                                            <span className="text-[9px] text-[#6B7280] font-medium ml-0.5">+</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Stock Progress Bar */}
                                                {inStock && totalStock <= 10 && totalStock > 0 && (
                                                    <div className="mt-2.5">
                                                        <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${totalStock <= 3 ? 'bg-rose-500 w-1/4' : 'bg-[#0F5C4D] w-1/2'}`}
                                                            />
                                                        </div>
                                                        <p className="text-[9px] text-[#6B7280] mt-0.5 font-medium">
                                                            {totalStock <= 3 ? 'Stock presque épuisé' : 'Stock limité'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* PRICE & ACTION */}
                                                <div className="mt-auto pt-3 border-t border-slate-100 mt-3">
                                                    <div className="flex items-baseline gap-2 mb-2.5">
                                                        {hasDiscount ? (
                                                            <>
                                                                <span className="text-sm sm:text-lg font-black text-[#0F5C4D] tracking-tight">
                                                                    {displayPrice.toFixed(2)} <span className="text-xs">DH</span>
                                                                </span>
                                                                <span className="text-[10px] sm:text-xs text-[#6B7280] line-through font-medium">
                                                                    {originalPrice.toFixed(2)} DH
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm sm:text-lg font-black text-[#111111] tracking-tight">
                                                                {displayPrice.toFixed(2)} <span className="text-xs">DH</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {product.has_variants ? (
                                                        <Link
                                                            href={`/products/${product.id}`}
                                                            className="w-full py-2.5 px-3 text-[11px] sm:text-xs font-bold rounded-xl text-center bg-[#0A4338] hover:bg-[#0F5C4D] text-white transition border border-[#0A4338] hover:border-[#0F5C4D] shadow-lg active:scale-95 block"
                                                        >
                                                            Choisir les options
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleAddToCart(product.id, selectedProductVariant ? selectedProductVariant.id : null);
                                                            }}
                                                            disabled={!inStock || !isCombinationAvailable}
                                                            className={`w-full py-2.5 px-3 text-[11px] sm:text-xs font-bold rounded-xl transition border shadow-lg text-center active:scale-95 select-none ${
                                                                inStock && isCombinationAvailable
                                                                    ? 'bg-[#0F5C4D] text-white border-[#0F5C4D] hover:bg-[#2D7A69] hover:border-[#2D7A69] cursor-pointer'
                                                                    : 'bg-neutral-100 text-[#6B7280] border-[#E5E7EB] cursor-not-allowed shadow-none'
                                                            }`}
                                                        >
                                                            {!inStock ? 'Rupture de stock' : 'Ajouter au panier'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* TRUST & FOOTER SECTION */}
            <section id="trust-section" className="bg-[#0A4338] text-white mt-16 sm:mt-24">
                <div className="border-b border-[#C2A65A]/15">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        {[
                            { title: 'Livraison rapide', desc: 'Partout au Maroc en 24h-48h' },
                            { title: 'Paiement à la livraison', desc: 'Payez après vérification' },
                            { title: 'Retour facile', desc: 'Échange garanti sous 7 jours' },
                            { title: 'Produits de qualité', desc: 'Sélection rigoureuse et vérifiée' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-center justify-center md:justify-start gap-3.5">
                                <div className="w-10 h-10 rounded-full border border-[#C2A65A]/40 flex items-center justify-center shrink-0 text-[#C2A65A]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                                    <p className="text-[11px] text-white/60 font-medium mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                        <div className="md:col-span-4 space-y-4">
                            <Link href="/" className="text-xl font-serif tracking-wide text-white flex items-center gap-2">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                                Votre boutique officielle pour des produits premium sélectionnés avec soin. Service client réactif et expérience d'achat 100% sécurisée.
                            </p>
                            <div className="pt-2 flex items-center gap-3">
                                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="WhatsApp">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                                    </svg>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Facebook">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="Instagram">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#C2A65A] hover:text-[#0A4338] flex items-center justify-center text-white/70 transition" title="TikTok">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.51-1.28 2.55.02.82.42 1.61 1.08 2.09.8.59 1.87.7 2.81.42.94-.27 1.71-1.02 1.98-1.96.22-.72.23-1.49.23-2.24V.02z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Navigation</h5>
                            <ul className="space-y-2 text-xs font-semibold text-white/60">
                                <li><Link href="/" className="hover:text-[#C2A65A] transition">Accueil</Link></li>
                                <li><Link href="/cart" className="hover:text-[#C2A65A] transition">Panier</Link></li>
                                <li><a href="#FAQ" className="hover:text-[#C2A65A] transition">FAQ</a></li>
                                <li><a href="#Contact" className="hover:text-[#C2A65A] transition">Contact</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Informations Légales</h5>
                            <ul className="space-y-2 text-xs font-semibold text-white/60">
                                <li><a href="#CGV" className="hover:text-[#C2A65A] transition">Conditions générales</a></li>
                                <li><a href="#Retour" className="hover:text-[#C2A65A] transition">Politique de retour</a></li>
                                <li><a href="#Livraison" className="hover:text-[#C2A65A] transition">Politique de livraison</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#C2A65A]">Besoin d&apos;aide ?</h5>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Notre équipe est disponible du lundi au samedi de 9h à 19h pour vous accompagner.
                            </p>
                            <div className="pt-1 text-xs font-bold text-white">support@5witm.com</div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-[#C2A65A]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-medium text-white/50">
                        <p>© {new Date().getFullYear()} 5witm. Tous droits réservés.</p>
                        <div className="flex items-center gap-4">
                            <a href="#CGV" className="hover:text-[#C2A65A] transition">Mentions légales</a>
                            <span>•</span>
                            <a href="#Retour" className="hover:text-[#C2A65A] transition">Confidentialité</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
