import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function Show({ product: rawProduct }) {
    const product = rawProduct?.data || rawProduct;

    if (!product) {
        return (
            <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-bold text-[#111111]">Produit introuvable</h1>
                    <Link href="/" className="mt-4 inline-block text-[#0F5C4D] hover:text-[#2D7A69] font-semibold">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    const { t, i18n } = useTranslation();
    const { cartCount, auth, userShipping } = usePage().props;

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const marocCities = [
        "Agadir", "Béni Mellal", "Berrechid", "Casablanca", "El Jadida", "Fès",
        "Guelmim", "Kenitra", "Khemisset", "Ksar El Kebir", "Larache", "Marrakech",
        "Meknès", "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi",
        "Salé", "Settat", "Tanger", "Taza", "Temara", "Tétouan"
    ];

    const [selectedVariantValues, setSelectedVariantValues] = useState({});

    useEffect(() => {
        if (product?.has_variants && product?.variant_types?.length > 0) {
            const firstAvailableVariant = product?.product_variants?.find(pv => pv.status && pv.stock > 0) || product?.product_variants?.[0];

            if (firstAvailableVariant && firstAvailableVariant.variant_values) {
                const initialSelection = {};
                firstAvailableVariant.variant_values.forEach(vv => {
                    const typeName = vv.variant_type?.name || product.variant_types.find(vt => vt.values?.some(val => val.id === vv.id))?.name;
                    if (typeName) {
                        initialSelection[typeName] = vv;
                    }
                });
                setSelectedVariantValues(initialSelection);
            } else {
                const initialSelection = {};
                product.variant_types.forEach(vt => {
                    if (vt.values && vt.values.length > 0) {
                        initialSelection[vt.name] = vt.values[0];
                    }
                });
                setSelectedVariantValues(initialSelection);
            }
        } else {
            setSelectedVariantValues({});
        }
    }, [product]);

    const selectedProductVariant = useMemo(() => {
        if (!product?.has_variants || !product?.variant_types?.length || !product?.product_variants?.length) {
            return null;
        }

        const selectedValueIds = Object.values(selectedVariantValues).map(vv => vv.id).sort();
        if (selectedValueIds.length < product.variant_types.length) {
            return null;
        }

        return product.product_variants.find(pv => {
            const pvValueIds = pv.variant_values?.map(vv => vv.id).sort() || [];
            return JSON.stringify(selectedValueIds) === JSON.stringify(pvValueIds);
        });
    }, [selectedVariantValues, product]);

    const activePrices = useMemo(() => {
        let originalPrice = 0;
        let discountPrice = null;
        let hasValidDiscount = false;
        let currentPrice = 0;
        let discountPercentage = 0;

        if (product?.has_variants && selectedProductVariant) {
            originalPrice = selectedProductVariant.price !== null && selectedProductVariant.price !== undefined
                ? Number(selectedProductVariant.price)
                : Number(product?.original_price || 0);
            discountPrice = selectedProductVariant.discount_price !== null && selectedProductVariant.discount_price !== undefined
                ? Number(selectedProductVariant.discount_price)
                : null;
        } else {
            originalPrice = Number(product?.original_price || 0);
            discountPrice = product?.computed_discount_price !== null && product?.computed_discount_price !== undefined
                ? Number(product.computed_discount_price)
                : null;
        }

        hasValidDiscount = discountPrice !== null && !isNaN(discountPrice) && discountPrice > 0 && discountPrice < originalPrice;
        currentPrice = hasValidDiscount ? discountPrice : originalPrice;
        discountPercentage = hasValidDiscount && originalPrice > 0
            ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
            : 0;

        return {
            originalPrice,
            discountPrice,
            hasValidDiscount,
            currentPrice,
            discountPercentage,
        };
    }, [product, selectedProductVariant]);

    const getDisplayStock = useCallback(() => {
        if (product?.has_variants) {
            if (selectedProductVariant) {
                return selectedProductVariant.stock;
            }
            return product?.total_stock || 0;
        }
        return product?.stock || 0;
    }, [product, selectedProductVariant]);

    const getDisplayImage = useCallback(() => {
        if (product?.has_variants) {
            for (const vv of Object.values(selectedVariantValues)) {
                if (vv?.images && vv.images.length > 0 && vv.images[0]?.image_path) {
                    return vv.images[0].image_path;
                }
            }
        }
        if (product?.image) {
            return product.image;
        }
        if (product?.images && product.images.length > 0) {
            return product.images[0].image_path;
        }
        return null;
    }, [product, selectedVariantValues]);

    const [activeImage, setActiveImage] = useState(getDisplayImage());
    const [quantity, setQuantity] = useState(1);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    useEffect(() => {
        setActiveImage(getDisplayImage());
        const currentStock = getDisplayStock();
        if (quantity > currentStock && currentStock > 0) {
            setQuantity(currentStock);
        } else if (currentStock === 0) {
            setQuantity(0);
        } else if (quantity === 0 && currentStock > 0) {
            setQuantity(1);
        }
    }, [selectedProductVariant, product, selectedVariantValues]);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_city: '',
        customer_address: ''
    });

    useEffect(() => {
        if (auth?.user) {
            setFormData(prev => ({
                ...prev,
                customer_name: auth.user.name || '',
                customer_phone: userShipping?.phone || '',
                customer_city: userShipping?.city || '',
                customer_address: userShipping?.address || ''
            }));
        }
    }, [userShipping, auth]);

    const allImages = useMemo(() => {
        const images = [];

        Object.values(selectedVariantValues).forEach(vv => {
            if (vv.images && vv.images.length > 0) {
                vv.images.forEach(img => images.push({ id: `vv-${vv.id}-${img.id}`, path: img.image_path }));
            }
        });

        if (product?.images) {
            product.images.forEach(img => {
                if (!images.some(existingImg => existingImg.path === img.image_path)) {
                    images.push({ id: `prod-img-${img.id}`, path: img.image_path });
                }
            });
        }

        if (product?.image && !images.some(existingImg => existingImg.path === product.image)) {
            images.unshift({ id: 'main-prod-img', path: product.image });
        }

        return images.filter(img => img.path);
    }, [product, selectedVariantValues]);

    const handleAddToCart = () => {
        const dataToSend = { quantity: quantity };
        if (product?.has_variants && selectedProductVariant) {
            dataToSend.product_variant_id = selectedProductVariant.id;
        }
        router.post(route('cart.add', product.id), dataToSend, { preserveScroll: true });
    };

    const handleDirectOrder = (e) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.customer_phone || !formData.customer_city || !formData.customer_address) {
            alert(t('product.show.alert_fill_all_fields'));
            return;
        }

        const dataToSend = {
            ...formData,
            quantity: quantity
        };
        if (product?.has_variants && selectedProductVariant) {
            dataToSend.product_variant_id = selectedProductVariant.id;
        }

        router.post(route('cart.directCheckout', product.id), dataToSend);
    };

    const specs = product?.description
        ? product.description.split('\n').filter(line => line.trim() !== '')
        : [t('product.show.no_detailed_description')];

    const formattedPrice = (price) => {
        return `${Number(price).toFixed(2)} dh`;
    };

    const currentStock = getDisplayStock();
    const isOutOfStock = currentStock <= 0;
    const isAddToCartDisabled = isOutOfStock || quantity === 0 || (product?.has_variants && !selectedProductVariant);

    return (
        <div className="bg-[#F8F7F4] min-h-screen text-[#111111] antialiased font-sans selection:bg-[#C2A65A]/30 pb-20 lg:pb-0">
            <Head title={t('product.show.page_title', { productName: product?.name || 'Product' })} />

            {/* STICKY HEADER */}
            <header className="sticky top-0 z-40">
                <div className="bg-[#0F5C4D] text-white text-center py-2.5 px-4">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                        Livraison gratuite partout au Maroc
                    </p>
                </div>

                <nav className="bg-[#0A4338]/95 backdrop-blur-md border-b border-[#C2A65A]/20 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                        <Link href="/" className="text-base sm:text-xl font-serif tracking-wide text-white flex items-center gap-1.5 shrink-0">
                            <span>5witm<span className="text-[#C2A65A]">.</span></span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                            <Link href="/" className="text-white hover:text-[#C2A65A] transition">{t('navbar.explore_products')}</Link>
                            <Link href="/about-us" className="text-white hover:text-[#C2A65A] transition">{t('navbar.about_us')}</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => changeLanguage('fr')} className={`text-xs font-semibold ${i18n.language === 'fr' ? 'text-[#C2A65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                            FR
                        </button>
                        <span className="text-white/30">|</span>
                        <button onClick={() => changeLanguage('ar')} className={`text-xs font-semibold ${i18n.language === 'ar' ? 'text-[#C2A65A] font-bold' : 'text-white/50'} hover:text-[#C2A65A] transition`}>
                            AR
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-5 text-xs font-medium text-white/60 min-w-0">
                        {!auth?.user ? (
                            <Link href="/login" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs px-1 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-[#C2A65A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <span>{t('navbar.login')}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                {(auth.user && (auth.user.is_admin == 1 || auth.user.is_admin === true)) && (
                                    <Link href="/admin/products" className="bg-[#C2A65A]/10 text-[#C2A65A] px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[#C2A65A]/20 transition font-bold border border-[#C2A65A]/30 text-[10px] sm:text-xs whitespace-nowrap">
                                        {t('navbar.admin_space')}
                                    </Link>
                                )}
                                <Link href="/profile" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.my_profile')}
                                </Link>
                                <Link href="/orders" className="hover:text-[#C2A65A] transition font-semibold text-[11px] sm:text-xs whitespace-nowrap px-0.5">
                                    {t('navbar.my_orders')}
                                </Link>
                                <div className="hidden sm:block h-4 w-px bg-white/20 shrink-0" />
                                <span className="hidden sm:inline-flex items-center gap-1 text-white font-bold max-w-[100px] truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2A65A] shrink-0"></span>
                                    {auth.user.name.split(' ')[0]}
                                </span>
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="text-white/50 hover:text-red-400 font-bold text-[10px] sm:text-xs bg-[#0A4338] sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg border border-white/15 sm:border-none cursor-pointer text-left transition"
                                >
                                    {t('navbar.logout')}
                                </button>
                            </div>
                        )}

                        <Link href="/cart" className="bg-[#0F5C4D] hover:bg-[#2D7A69] text-white px-2.5 sm:px-4 py-2 rounded-xl font-bold relative flex items-center gap-1.5 transition shadow-sm shrink-0 active:scale-98">
                            <span>Panier</span>
                            <span className="bg-[#0A4338] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {cartCount || 0}
                            </span>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <nav className="mb-4 sm:mb-8 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-[#6B7280] tracking-wide uppercase">
                    <Link href="/" className="hover:text-[#0F5C4D] transition">{t('product.show.explore_products')}</Link>
                    <span>/</span>
                    <span className="text-[#111111] font-extrabold truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-start">
                    {/* LEFT IMAGE GALLERY */}
                    <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-5">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-14 min-h-[40vh] sm:min-h-[50vh] aspect-auto sm:aspect-square flex items-center justify-center shadow-sm relative group overflow-hidden">
                            {activeImage ? (
                                <img
                                    key={activeImage}
                                    src={activeImage}
                                    alt={product.name}
                                    className="max-h-[40vh] sm:max-h-[50vh] lg:max-h-full max-w-full object-contain transition-all duration-700 ease-out group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-[#6B7280] font-bold text-xs uppercase tracking-widest">{t('product.show.image_not_available')}</div>
                            )}

                            <div className="absolute top-2 sm:top-5 left-2 sm:left-5 bg-[#C2A65A]/10 backdrop-blur-md px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full border border-[#C2A65A]/30 flex items-center gap-1.5 sm:gap-2">
                                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#C2A65A] animate-ping"></span>
                                <span className="text-[8px] sm:text-[10px] font-extrabold text-[#0F5C4D] uppercase tracking-wider">{t('product.show.quality_certified')}</span>
                            </div>
                        </div>

                        {allImages.length > 0 && (
                            <div className="relative group/gallery mt-2">
                                <div className="flex gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1">
                                    {allImages.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.path)}
                                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white border-2 p-1 sm:p-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                                                activeImage === img.path
                                                    ? 'border-[#0F5C4D] ring-4 ring-[#0F5C4D]/10 shadow-md scale-95'
                                                    : 'border-[#E5E7EB] opacity-60 hover:opacity-100 hover:border-[#6B7280]'
                                            }`}
                                        >
                                            <img src={img.path} className="max-h-full max-w-full object-contain" alt={t('product.show.image_preview_alt')} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT DETAILS & PURCHASE */}
                    <div className="lg:col-span-5 flex flex-col space-y-4 sm:space-y-7">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <span className={`inline-flex items-center gap-1 sm:gap-1.5 font-bold px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] border uppercase tracking-wider ${
                                    isOutOfStock
                                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                                        : (currentStock < 5 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                                }`}>
                                    <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : (currentStock < 5 ? 'bg-amber-500' : 'bg-emerald-500')}`}></span>
                                    {isOutOfStock ? t('product.show.out_of_stock_status') : (currentStock < 5 ? t('product.show.limited_stock_status', { count: currentStock }) : t('product.show.in_stock_status'))}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#111111] tracking-tight leading-tight capitalize">
                                {product?.name || 'Product'}
                                {selectedProductVariant && selectedProductVariant.variant_values && (
                                    <span className="text-[#6B7280] text-lg sm:text-xl lg:text-2xl font-normal"> ({selectedProductVariant.variant_values.map(vv => vv.value).join(' / ')})</span>
                                )}
                            </h1>

                            <div className="flex items-baseline flex-wrap gap-2 sm:gap-3 pt-1">
                                <span className="text-2xl sm:text-3xl font-black text-[#0F5C4D] tracking-tight">
                                    {formattedPrice(activePrices.currentPrice)}
                                </span>
                                {activePrices.hasValidDiscount && (
                                    <>
                                        <span className="text-sm sm:text-base font-bold text-[#6B7280] line-through">
                                            {formattedPrice(activePrices.originalPrice)}
                                        </span>
                                        <span className="bg-[#0F5C4D] text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full">
                                            -{activePrices.discountPercentage}%
                                        </span>
                                    </>
                                )}
                                <span className="text-[10px] sm:text-xs font-semibold text-[#6B7280]">{t('product.show.vat_included')}</span>
                            </div>
                        </div>
                        {!isOutOfStock && (
                            <div className="flex items-center justify-between bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-[#E5E7EB] shadow-sm">
                                <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wider">{t('product.show.desired_quantity')}</span>
                                <div className="flex items-center gap-2 sm:gap-3 bg-neutral-50 border border-[#E5E7EB] rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white shadow-sm font-bold text-[#111111] hover:bg-neutral-100 flex items-center justify-center transition active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="w-5 sm:w-6 text-center text-[11px] sm:text-xs font-black text-[#111111] font-mono">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white shadow-sm font-bold text-[#111111] hover:bg-neutral-100 flex items-center justify-center transition active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* BOUTONS D'ACTION */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isAddToCartDisabled}
                                className={`w-full py-3.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer ${
                                    !isAddToCartDisabled
                                        ? 'bg-[#0A4338] text-white hover:bg-[#0F5C4D] shadow-[#0A4338]/10'
                                        : 'bg-neutral-100 text-[#6B7280] border border-[#E5E7EB] cursor-not-allowed shadow-none'
                                }`}
                            >
                                <span>{t('product.show.add_to_cart')}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOrderModalOpen(true)}
                                disabled={isAddToCartDisabled}
                                className={`w-full py-3.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer ${
                                    !isAddToCartDisabled
                                        ? 'bg-[#C2A65A] hover:bg-[#b5984a] text-white shadow-[#C2A65A]/10'
                                        : 'bg-neutral-100 text-[#6B7280] border border-[#E5E7EB] cursor-not-allowed shadow-none'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                <span>ACHETER MAINTENANT</span>
                            </button>
                        </div>

                        {/* Variant selector */}
                        {product?.has_variants && product?.variant_types && product.variant_types.length > 0 && (
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-sm space-y-4">
                                {product.variant_types.map(vt => (
                                    <div key={vt.id}>
                                        <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#6B7280] border-b border-[#E5E7EB] pb-2 mb-3">
                                            {t('product.show.choose_variant_type', { type: vt.name })}
                                        </h2>
                                        <div className="flex flex-wrap gap-3">
                                            {vt.values && vt.values.map(vv => {
                                                const isSelected = selectedVariantValues[vt.name]?.id === vv.id;
                                                return (
                                                    <button
                                                        key={vv.id}
                                                        onClick={() => setSelectedVariantValues(prev => ({ ...prev, [vt.name]: vv }))}
                                                        className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                                            isSelected
                                                                ? 'border-[#0F5C4D] ring-2 ring-[#0F5C4D]/40 scale-105'
                                                                : 'border-[#E5E7EB] hover:border-[#6B7280]'
                                                        }`}
                                                        title={vv.value}
                                                    >
                                                        {vv.images && vv.images.length > 0 ? (
                                                            <img src={vv.images[0].image_path} alt={vv.value} className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <span className="text-xs font-semibold text-[#111111]">{vv.value}</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-sm space-y-3">
                            <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#6B7280] border-b border-[#E5E7EB] pb-2">
                                {t('product.show.detailed_features')}
                            </h2>
                            <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs font-semibold text-[#6B7280]">
                                {specs.map((spec, index) => (
                                    <li key={index} className="flex items-start gap-2 sm:gap-2.5">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F5C4D] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="leading-relaxed">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#E5E7EB] text-center">
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#E5E7EB] space-y-1">
                                <svg className="w-5 h-5 mx-auto text-[#0F5C4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-[#111111] uppercase">{t('product.show.fast_delivery_title')}</h4>
                                <p className="text-[8px] sm:text-[9px] text-[#6B7280] font-medium">{t('product.show.fast_delivery_description')}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#E5E7EB] space-y-1">
                                <svg className="w-5 h-5 mx-auto text-[#0F5C4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.06 60.06 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H3.375a1.125 1.125 0 00-1.125 1.125v.375m15.75 0v.375c0 .621-.504 1.125-1.125 1.125H9.75m4.5-9.75v.375c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125V4.5h6.75z" />
                                </svg>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-[#111111] uppercase">{t('product.show.cash_on_delivery_title')}</h4>
                                <p className="text-[8px] sm:text-[9px] text-[#6B7280] font-medium">{t('product.show.cash_on_delivery_description')}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-[#E5E7EB] space-y-1">
                                <svg className="w-5 h-5 mx-auto text-[#0F5C4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h4 className="text-[9px] sm:text-[10px] font-bold text-[#111111] uppercase">{t('product.show.quality_guaranteed_title')}</h4>
                                <p className="text-[8px] sm:text-[9px] text-[#6B7280] font-medium">{t('product.show.quality_guaranteed_description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* STICKY BOTTOM BAR FOR MOBILE */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 shadow-lg flex items-center gap-2 sm:gap-4 lg:hidden">
                <div className="flex-1 min-w-0 px-1">
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{product.name}</div>
                    <div className="text-sm font-black text-[#0F5C4D]">{formattedPrice(activePrices.currentPrice)}</div>
                </div>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled}
                    className="p-3 bg-[#0A4338] text-white rounded-xl font-bold text-xs uppercase hover:bg-[#0F5C4D] transition active:scale-95 disabled:opacity-50"
                    title={t('product.show.add_to_cart')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(true)}
                    disabled={isAddToCartDisabled}
                    className="px-4 py-3 bg-[#C2A65A] hover:bg-[#b5984a] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-50"
                >
                    ACHETER MAINTENANT
                </button>
            </div>

            {/* MODAL COMMANDE */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#E5E7EB] my-auto relative">
                        {/* Header Modal */}
                        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-[#111111]">
                                Commande avec paiement à la livraison
                            </h3>
                            <button
                                onClick={() => setIsOrderModalOpen(false)}
                                className="text-[#6B7280] hover:text-[#111111] p-1 rounded-full hover:bg-neutral-100 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* Product Item Card */}
                            <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-[#E5E7EB]">
                                <div className="relative w-14 h-14 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-center shrink-0 overflow-hidden">
                                    {activeImage ? (
                                        <img src={activeImage} alt={product.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-200" />
                                    )}
                                    <span className="absolute -top-1 -right-1 bg-[#0F5C4D] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                        {quantity}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs sm:text-sm font-semibold text-[#111111] truncate">
                                        {product?.name}
                                        {selectedProductVariant && selectedProductVariant.variant_values && (
                                            <span className="text-[#6B7280] font-normal"> ({selectedProductVariant.variant_values.map(vv => vv.value).join(' / ')})</span>
                                        )}
                                    </h4>
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-[#111111]">
                                    {formattedPrice(activePrices.currentPrice * quantity)}
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="bg-neutral-100/70 rounded-xl p-3.5 space-y-2 text-xs text-[#6B7280] font-medium">
                                <div className="flex justify-between items-center">
                                    <span>Sous-total</span>
                                    <span className="font-bold text-[#111111]">{formattedPrice(activePrices.currentPrice * quantity)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
                                    <span>Livraison</span>
                                    <span className="font-bold text-[#111111]">Gratuit</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-sm font-bold text-[#0F5C4D]">
                                    <span>Total</span>
                                    <span>{formattedPrice(activePrices.currentPrice * quantity)}</span>
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-[#111111]">Mode de livraison</label>
                                <div className="border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2.5">
                                        <input type="radio" checked readOnly className="accent-[#0F5C4D] w-4 h-4 cursor-pointer" />
                                        <span>Livraison gratuite</span>
                                    </div>
                                    <span className="font-bold text-[#111111]">Gratuit</span>
                                </div>
                            </div>

                            {/* Order Form */}
                            <form onSubmit={handleDirectOrder} className="space-y-3.5">
                                <h4 className="text-xs sm:text-sm font-bold text-[#111111] text-center pt-2">
                                    Insérez votre adresse de livraison
                                </h4>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#111111] mb-1">
                                        Nom et prénom <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:border-[#0F5C4D] transition">
                                        <div className="bg-neutral-100 px-3.5 flex items-center justify-center text-[#6B7280] border-r border-[#E5E7EB]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nom et prénom"
                                            className="w-full bg-white px-3 py-2.5 text-xs text-[#111111] focus:outline-none"
                                            value={formData.customer_name}
                                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#111111] mb-1">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:border-[#0F5C4D] transition">
                                        <div className="bg-neutral-100 px-3.5 flex items-center justify-center text-[#6B7280] border-r border-[#E5E7EB]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.828-1.015-5.183-3.37-6.198-6.198l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Téléphone"
                                            className="w-full bg-white px-3 py-2.5 text-xs text-[#111111] focus:outline-none"
                                            value={formData.customer_phone}
                                            onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#111111] mb-1">
                                        Adresse <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:border-[#0F5C4D] transition">
                                        <div className="bg-neutral-100 px-3.5 flex items-center justify-center text-[#6B7280] border-r border-[#E5E7EB]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Adresse"
                                            className="w-full bg-white px-3 py-2.5 text-xs text-[#111111] focus:outline-none"
                                            value={formData.customer_address}
                                            onChange={e => setFormData({ ...formData, customer_address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#111111] mb-1">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:border-[#0F5C4D] transition">
                                        <div className="bg-neutral-100 px-3.5 flex items-center justify-center text-[#6B7280] border-r border-[#E5E7EB]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m-6-18h12a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0119.5 21h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 014.5 3z" />
                                            </svg>
                                        </div>
                                        <select
                                            required
                                            className="w-full bg-white px-3 py-2.5 text-xs text-[#111111] focus:outline-none cursor-pointer"
                                            value={formData.customer_city}
                                            onChange={e => setFormData({ ...formData, customer_city: e.target.value })}
                                        >
                                            <option value="" disabled>Sélectionnez votre ville</option>
                                            {marocCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isAddToCartDisabled}
                                    className={`w-full bg-[#0F5C4D] hover:bg-[#2D7A69] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition active:scale-98 cursor-pointer mt-4 ${
                                        !isAddToCartDisabled ? '' : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Valider la commande
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="bg-[#0A4338] text-white mt-16 sm:mt-24">
                <div className="border-b border-[#C2A65A]/15">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-full border border-[#C2A65A]/40 flex items-center justify-center shrink-0 text-[#C2A65A]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('product.show.footer_fast_delivery_title')}</h4>
                                <p className="text-[11px] text-white/60 font-medium mt-0.5">{t('product.show.footer_fast_delivery_description')}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-full border border-[#C2A65A]/40 flex items-center justify-center shrink-0 text-[#C2A65A]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.06 60.06 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H3.375a1.125 1.125 0 00-1.125 1.125v.375m15.75 0v.375c0 .621-.504 1.125-1.125 1.125H9.75m4.5-9.75v.375c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125V4.5h6.75z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('product.show.footer_cash_on_delivery_title')}</h4>
                                <p className="text-[11px] text-white/60 font-medium mt-0.5">{t('product.show.footer_cash_on_delivery_description')}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3.5">
                            <div className="w-10 h-10 rounded-full border border-[#C2A65A]/40 flex items-center justify-center shrink-0 text-[#C2A65A]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('product.show.footer_quality_guaranteed_title')}</h4>
                                <p className="text-[11px] text-white/60 font-medium mt-0.5">{t('product.show.footer_quality_guaranteed_description')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                        <div className="md:col-span-5 space-y-3.5">
                            <Link href="/" className="text-xl font-serif tracking-wide text-white flex items-center gap-2">
                                <span>5witm<span className="text-[#C2A65A]">.</span></span>
                            </Link>
                            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                                {t('product.show.footer_brand_description')}
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
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
