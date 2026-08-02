<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class CartController extends Controller
{
    public function show(): \Inertia\Response
    {
        $sessionCart = session()->get('Cart', []);
        $cart = [];
        $userShipping = null;

        foreach ($sessionCart as $cartKey => $item) {
            $product = Product::with([
                'images',
                'productVariants.variantValues.variantType',
                'variantTypes.variantValues.images'
            ])->find($item['product_id']);

            if (!$product) {
                unset($sessionCart[$cartKey]);
                session()->put('Cart', $sessionCart);
                continue;
            }

            $cartItem = [
                'cart_key'            => $cartKey,
                'product_id'          => $product->id,
                'name'                => $product->name,
                'quantity'            => $item['quantity'],
                'price'               => $product->display_price,
                'original_price'      => $product->original_price,
                'discount_price'      => $product->computed_discount_price,
                'discount_percentage' => $product->discount_percentage,
                'has_discount'        => $product->has_discount,
                'image'               => $product->image,
                'sku'                 => null,
                'variant_description' => null,
                'product_variant_id'  => null,
                'stock'               => $product->total_stock,
                'in_stock'            => $product->in_stock,
            ];

            if (!empty($item['product_variant_id'])) {
                $productVariant = ProductVariant::with('variantValues.variantType')->find($item['product_variant_id']);

                if (!$productVariant) {
                    unset($sessionCart[$cartKey]);
                    session()->put('Cart', $sessionCart);
                    continue;
                }

                $variantOriginalPrice = $productVariant->price ?? $product->price;
                $variantDiscountPrice = $productVariant->discount_price;
                $variantPrice = $variantDiscountPrice ?? $variantOriginalPrice;
                $variantDiscountPercentage = null;

                if ($variantDiscountPrice && $variantDiscountPrice > 0 && $variantDiscountPrice < $variantOriginalPrice) {
                    $variantDiscountPercentage = (int) round((($variantOriginalPrice - $variantDiscountPrice) / $variantOriginalPrice) * 100);
                }

                $cartItem['product_variant_id']  = $productVariant->id;
                $cartItem['price']               = $variantPrice;
                $cartItem['original_price']      = $variantOriginalPrice;
                $cartItem['discount_price']      = $variantDiscountPrice;
                $cartItem['discount_percentage'] = $variantDiscountPercentage;
                $cartItem['has_discount']        = $variantDiscountPercentage !== null;
                $cartItem['stock']               = $productVariant->stock;
                $cartItem['in_stock']            = $productVariant->stock > 0;
                $cartItem['sku']                 = $productVariant->sku;
                $cartItem['variant_description'] = $productVariant->name;
            }

            $cart[] = $cartItem;
        }

        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            $userShipping = [
                'phone'   => $user->phone ?? '',
                'address' => $user->address ?? '',
                'city'    => $user->city ?? '',
            ];
        }

        return Inertia::render('Cart/Index', [
            'cart'         => $cart,
            'userShipping' => $userShipping
        ]);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'quantity'           => 'required|integer|min:1',
            'product_variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $quantityToAdd    = (int) $request->input('quantity', 1);
        $productVariantId = $request->input('product_variant_id');

        $cart    = session()->get('Cart', []);
        $cartKey = $product->id . ($productVariantId ? '-' . $productVariantId : '');

        $itemPrice              = $product->display_price;
        $itemStock              = $product->total_stock;
        $itemSku                = null;
        $itemVariantDescription = null;

        if ($productVariantId) {
            $productVariant = ProductVariant::with('variantValues.variantType')->find($productVariantId);
            if (!$productVariant) {
                return back()->with('error', 'La variante de produit sélectionnée est introuvable.');
            }
            $itemPrice              = $productVariant->discount_price ?? $productVariant->price ?? $product->price;
            $itemStock              = $productVariant->stock;
            $itemSku                = $productVariant->sku;
            $itemVariantDescription = $productVariant->name;
        }

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] += $quantityToAdd;
        } else {
            $cart[$cartKey] = [
                "product_id"          => $product->id,
                "product_variant_id"  => $productVariantId,
                "name"                => $product->name,
                "quantity"            => $quantityToAdd,
                "price"               => $itemPrice,
                "image"               => $product->image,
                "sku"                 => $itemSku,
                "variant_description" => $itemVariantDescription,
            ];
        }

        if ($cart[$cartKey]['quantity'] > $itemStock) {
            $cart[$cartKey]['quantity'] = $itemStock;
            session()->put('Cart', $cart);
            return back()->with('warning', "Seulement {$itemStock} unités de ce produit sont disponibles. Votre quantité a été ajustée.");
        }

        session()->put('Cart', $cart);
        return back()->with('success', 'Produit ajouté au panier !');
    }

    public function updateQuantity(Request $request, $cartKey): RedirectResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = session()->get('Cart', []);

        if (isset($cart[$cartKey])) {
            $item    = $cart[$cartKey];
            $product = Product::find($item['product_id']);

            if (!$product) {
                unset($cart[$cartKey]);
                session()->put('Cart', $cart);
                return back()->with('error', 'Le produit associé à cet article est introuvable.');
            }

            $availableStock = $product->total_stock;
            if (!empty($item['product_variant_id'])) {
                $productVariant = ProductVariant::find($item['product_variant_id']);
                if (!$productVariant) {
                    unset($cart[$cartKey]);
                    session()->put('Cart', $cart);
                    return back()->with('error', 'La variante de produit associée à cet article est introuvable.');
                }
                $availableStock = $productVariant->stock;
            }

            if ($request->quantity > $availableStock) {
                $cart[$cartKey]['quantity'] = $availableStock;
                session()->put('Cart', $cart);
                return back()->with('warning', "Seulement {$availableStock} unités de ce produit sont disponibles en stock.");
            }

            $cart[$cartKey]['quantity'] = $request->quantity;
            session()->put('Cart', $cart);
        }

        return back();
    }

    public function remove($cartKey): RedirectResponse
    {
        $cart = session()->get('Cart', []);

        if (isset($cart[$cartKey])) {
            unset($cart[$cartKey]);
            session()->put('Cart', $cart);
        }

        return back()->with('success', 'Article retiré du panier.');
    }

    public function checkout(Request $request): RedirectResponse
    {
        $cart = session()->get('Cart', []);

        if (empty($cart)) {
            return redirect()->back()->with('error', 'Votre panier est vide.');
        }

        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|min:8',
            'customer_city'    => 'required|string',
            'customer_address' => 'required|string|min:4',
            'customer_email'   => 'nullable|email',
        ]);

        try {
            DB::beginTransaction();
            $total = 0;
            $orderItemsData = [];

            foreach ($cart as $cartKey => $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    throw new \Exception("Produit introuvable : " . $item['name']);
                }

                $currentStock   = $product->total_stock;
                $itemPrice      = $product->display_price;
                $productVariant = null;

                if (!empty($item['product_variant_id'])) {
                    $productVariant = ProductVariant::find($item['product_variant_id']);
                    if (!$productVariant) {
                        throw new \Exception("Variante introuvable pour : " . $item['name']);
                    }
                    $currentStock = $productVariant->stock;
                    $itemPrice    = $productVariant->discount_price ?? $productVariant->price ?? $product->price;
                }

                if ($currentStock < $item['quantity']) {
                    throw new \Exception("Stock insuffisant pour {$item['name']}. Disponible : {$currentStock}.");
                }

                // Synchronisation des stocks
                if ($productVariant) {
                    $productVariant->decrement('stock', $item['quantity']);
                }
                $product->decrement('stock', $item['quantity']);

                $total += $itemPrice * $item['quantity'];

                $orderItemsData[] = [
                    'product_id'          => $product->id,
                    'product_variant_id'  => $productVariant ? $productVariant->id : null,
                    'quantity'            => $item['quantity'],
                    'price'               => $itemPrice,
                    'variant_description' => $item['variant_description'],
                    'variant_sku'         => $item['sku'],
                    'variant_price'       => $itemPrice,
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ];
            }

            if (Auth::check()) {
                /** @var User $user */
                $user = Auth::user();
                $user->update([
                    'phone'   => $request->customer_phone,
                    'city'    => $request->customer_city,
                    'address' => $request->customer_address,
                ]);
            }

            $order = Order::create([
                'user_id'          => Auth::id(),
                'total_price'      => $total,
                'status'           => 'en_attente',
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'customer_city'    => $request->customer_city,
                'customer_address' => $request->customer_address,
                'customer_email'   => Auth::check() ? Auth::user()->email : $request->customer_email,
                'is_guest'         => !Auth::check(),
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->orderItems()->create($itemData);
            }

            DB::commit();

            if (!Auth::check()) {
                session(['guest_order_id' => $order->id]);
            }

            session()->forget('Cart');
            return redirect()->route('orders.success', ['id' => $order->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la commande : ' . $e->getMessage());
        }
    }

    public function directCheckout(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'quantity'           => 'required|integer|min:1',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'customer_name'      => 'required|string|max:255',
            'customer_phone'     => 'required|string|min:8',
            'customer_city'      => 'required|string',
            'customer_address'   => 'required|string|min:4',
            'customer_email'     => 'nullable|email',
        ]);

        $quantity         = (int) $request->input('quantity', 1);
        $productVariantId = $request->input('product_variant_id');

        try {
            DB::beginTransaction();

            $currentStock           = $product->total_stock;
            $itemPrice              = $product->display_price;
            $itemSku                = null;
            $itemVariantDescription = null;
            $productVariant         = null;

            if ($productVariantId) {
                $productVariant = ProductVariant::with('variantValues.variantType')->find($productVariantId);
                if (!$productVariant) {
                    throw new \Exception("La variante sélectionnée est introuvable.");
                }
                $currentStock           = $productVariant->stock;
                $itemPrice              = $productVariant->discount_price ?? $productVariant->price ?? $product->price;
                $itemSku                = $productVariant->sku;
                $itemVariantDescription = $productVariant->name;
            }

            if ($currentStock < $quantity) {
                throw new \Exception("Stock insuffisant pour {$product->name}. Disponible : {$currentStock}.");
            }

            $total = $itemPrice * $quantity;

            // Decrement stock
            if ($productVariant) {
                $productVariant->decrement('stock', $quantity);
            }
            $product->decrement('stock', $quantity);

            if (Auth::check()) {
                /** @var User $user */
                $user = Auth::user();
                $user->update([
                    'phone'   => $request->customer_phone,
                    'city'    => $request->customer_city,
                    'address' => $request->customer_address,
                ]);
            }

            $order = Order::create([
                'user_id'          => Auth::id(),
                'total_price'      => $total,
                'status'           => 'en_attente',
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'customer_city'    => $request->customer_city,
                'customer_address' => $request->customer_address,
                'customer_email'   => Auth::check() ? Auth::user()->email : $request->customer_email,
                'is_guest'         => !Auth::check(),
            ]);

            OrderItem::create([
                'order_id'            => $order->id,
                'product_id'          => $product->id,
                'product_variant_id'  => $productVariant ? $productVariant->id : null,
                'quantity'            => $quantity,
                'price'               => $itemPrice,
                'variant_description' => $itemVariantDescription,
                'variant_sku'         => $itemSku,
                'variant_price'       => $itemPrice,
            ]);

            DB::commit();

            if (!Auth::check()) {
                session(['guest_order_id' => $order->id]);
            }

            return redirect()->route('orders.success', ['id' => $order->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la commande : ' . $e->getMessage());
        }
    }
}
