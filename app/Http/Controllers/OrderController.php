<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Services\MetaCapiService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Confirmation page after checkout
     */
    public function success($id, MetaCapiService $metaCapi): Response
    {
        $order = Order::with('orderItems')->findOrFail($id);

        /** @var User|null $user */
        $user = Auth::user();

        if ($order->user_id) {
            if ($order->user_id !== Auth::id()) {
                abort(403, 'Action non autorisée.');
            }
        } else {
            if (session('guest_order_id') !== $order->id && (!$user || !$user->is_admin)) {
                abort(403, 'Accès à la confirmation expiré.');
            }
        }

        // --- Envoi de l'événement Purchase à Meta CAPI ---
        $eventId = 'order_' . $order->id;

        $metaCapi->sendEvent(
            eventName: 'Purchase',
            customData: [
                'currency'     => 'MAD',
                'value'        => (float) ($order->total_price ?? 0),
                'content_type' => 'product',
                'content_ids'  => collect($order->orderItems)->pluck('product_id')->filter()->values()->all(),
                'num_items'    => collect($order->orderItems)->sum('quantity'),
            ],
            userData: [
                'ph' => $order->customer_phone ? hash('sha256', trim($order->customer_phone)) : null,
                'fn' => $order->customer_name ? hash('sha256', strtolower(trim($order->customer_name))) : null,
            ],
            eventId: $eventId
        );

        return Inertia::render('orders/Success', [
            'order' => [
                'id'           => $order->id,
                'status'       => $order->status ?? 'en_attente',
                'total_amount' => (float) ($order->total_price ?? 0),
            ]
        ]);
    }

    /**
     * Customer order history
     */
    public function index(): Response
    {
        $orders = Order::with(['orderItems.product', 'orderItems.productVariant.variantValues.variantType'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($order) {
                $itemsData = collect($order->orderItems)->map(function ($item) {
                    $name               = $item->product?->name ?? 'Produit sans nom';
                    $image              = $item->product?->image;
                    $price              = (float) ($item->price ?? 0);
                    $sku                = null;
                    $variantDescription = null;

                    if ($item->productVariant) {
                        if ($item->variant_description) {
                            $name .= ' (' . $item->variant_description . ')';
                        }
                        $price              = (float) ($item->variant_price ?? $item->price ?? 0);
                        $sku                = $item->variant_sku;
                        $variantDescription = $item->variant_description;
                    }

                    return [
                        'id'                  => $item->id,
                        'name'                => $name,
                        'image'               => $image,
                        'quantity'            => (int) ($item->quantity ?? 1),
                        'price'               => $price,
                        'sku'                 => $sku,
                        'variant_description' => $variantDescription,
                    ];
                })->values()->all();

                return [
                    'id'           => $order->id,
                    'created_at'   => $order->created_at->toIso8601String(),
                    'status'       => $order->status ?? 'en_attente',
                    'total_price'  => (float) ($order->total_price ?? 0),
                    'total_amount' => (float) ($order->total_price ?? 0),
                    'items'        => $itemsData
                ];
            });

        return Inertia::render('orders/Index', [
            'orders' => $orders
        ]);
    }

    /**
     * Dynamic Invoice Display
     */
    public function invoice($id): Response
    {
        $order = Order::with(['orderItems.product', 'orderItems.productVariant.variantValues.variantType', 'user'])->findOrFail($id);

        /** @var User|null $user */
        $user = Auth::user();

        if ($order->user_id) {
            if (Auth::id() !== $order->user_id && (!$user || !$user->is_admin)) {
                abort(403, 'Action non autorisée.');
            }
        } else {
            if (session('guest_order_id') !== $order->id && (!$user || !$user->is_admin)) {
                abort(403, 'Lien de facture expiré ou non autorisé.');
            }
        }

        $name    = $order->customer_name ?? $order->user?->name ?? 'Client 5witm';
        $email   = $order->customer_email ?? $order->user?->email ?? 'N/A';
        $phone   = $order->customer_phone ?? $order->user?->phone ?? 'Pas de téléphone';
        $address = $order->customer_address ?? $order->user?->address ?? 'Maroc';

        return Inertia::render('orders/Invoice', [
            'order' => [
                'id'               => $order->id,
                'created_at'       => $order->created_at->format('d/m/Y'),
                'customer_name'    => $name,
                'customer_email'   => $email,
                'customer_phone'   => $phone,
                'customer_address' => $address,
                'total_price'      => (float) ($order->total_price ?? 0),
                'status'           => $order->status ?? 'en_attente',
                'items'            => collect($order->orderItems)->map(function ($item) {
                    $itemName           = $item->product?->name ?? 'Produit sans nom';
                    $itemImage          = $item->product?->image;
                    $itemPrice          = (float) ($item->price ?? 0);
                    $variantDescription = null;
                    $variantSku         = null;

                    if ($item->productVariant) {
                        if ($item->variant_description) {
                            $itemName .= ' (' . $item->variant_description . ')';
                        }
                        $itemPrice          = (float) ($item->variant_price ?? $item->price ?? 0);
                        $variantDescription = $item->variant_description;
                        $variantSku         = $item->variant_sku;
                    }

                    if ($itemImage && !str_starts_with($itemImage, 'http')) {
                        $cleanPath = ltrim($itemImage, '/');
                        $itemImage = str_starts_with($cleanPath, 'storage/') ? asset($cleanPath) : asset('storage/' . $cleanPath);
                    }

                    return [
                        'id'                  => $item->id,
                        'name'                => $itemName,
                        'image'               => $itemImage,
                        'quantity'            => (int) ($item->quantity ?? 1),
                        'price'               => $itemPrice,
                        'variant_description' => $variantDescription,
                        'variant_sku'         => $variantSku,
                    ];
                })->all()
            ]
        ]);
    }
}
