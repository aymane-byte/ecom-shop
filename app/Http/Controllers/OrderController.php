<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * 🏁 Page de confirmation après le checkout
     */
    public function success($id): Response
    {
        $order = Order::findOrFail($id);

        /** @var User|null $user */
        $user = Auth::user();

        // 🔒 Sécurisation intelligente: s'assurer que c'est le bon utilisateur ou le bon guest session
        if ($order->user_id) {
            if ($order->user_id !== Auth::id()) {
                abort(403, 'Action non autorisée.');
            }
        } else {
            // Si c'est un Guest, on vérifie s'il a le droit via la session de checkout
            if (session('guest_order_id') !== $order->id && (!$user || !$user->is_admin)) {
                abort(403, 'Accès à la confirmation expiré.');
            }
        }

        return Inertia::render('orders/Success', [
            'order' => [
                'id'           => $order->id,
                'status'       => $order->status ?? 'en_attente',
                'total_amount' => (float) ($order->total_price ?? $order->total_amount ?? 0),
            ]
        ]);
    }

    /**
     * 📜 Liste complète de l'historique de commandes (Réservé aux connectés)
     */
    public function index(): Response
    {
        $orders = Order::with('items.product')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($order) {

                if ($order->relationLoaded('items') || isset($order->items)) {
                    $itemsData = collect($order->items)->map(function ($item) {
                        return [
                            'name'     => $item->product?->name ?? $item->name ?? 'Produit sans nom',
                            'image'    => $item->product?->image ?? $item->image ?? null,
                            'quantity' => (int) ($item->quantity ?? 1),
                            'price'    => (float) ($item->price ?? 0),
                        ];
                    })->values()->all();
                } else {
                    $decoded = is_string($order->items) ? json_decode($order->items, true) : $order->items;
                    $itemsData = is_array($decoded) ? $decoded : [];
                }

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
     * 📑 Afficher la facture dynamic (ANTI-NULL SYSTEM & GUEST COMPATIBLE 🚀)
     */
    public function invoice($id): Response
    {
        $order = Order::with(['items.product', 'user'])->findOrFail($id);

        /** @var User|null $user */
        $user = Auth::user();

        // 🛡️ Vérification des droits d'accès à la facture
        if ($order->user_id) {
            if (Auth::id() !== $order->user_id && (!$user || !$user->is_admin)) {
                abort(403, 'Action non autorisée.');
            }
        } else {
            // Autoriser le Guest propriétaire de la session OU un Admin
            if (session('guest_order_id') !== $order->id && (!$user || !$user->is_admin)) {
                abort(403, 'Lien de facture expiré ou non autorisé.');
            }
        }

        // ✨ Fallbacks dynamiques pour les Guests et Connectés
        $name = $order->customer_name
            ?? $order->user?->name
            ?? 'Client Monocle';

        $email = $order->customer_email
            ?? $order->user?->email
            ?? 'N/A';

        $phone = $order->customer_phone
            ?? $order->phone
            ?? $order->user?->phone
            ?? 'Pas de téléphone';

        $address = $order->customer_address
            ?? $order->address
            ?? $order->user?->address
            ?? 'Maroc';

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
                'items'            => collect($order->items)->map(function ($item) {

                    // 🛠️ FIX IMAGE PATH UNIVERSEL
                    $imagePath = $item->product?->image;

                    if ($imagePath) {
                        // Si c'est déjà une URL absolue, on ne touche à rien
                        if (str_starts_with($imagePath, 'http')) {
                            // Ok
                        } else {
                            // Sinon on s'assure qu'on passe par /storage/
                            $cleanPath = ltrim($imagePath, '/');
                            if (str_starts_with($cleanPath, 'storage/')) {
                                $imagePath = asset($cleanPath);
                            } else {
                                $imagePath = asset('storage/' . $cleanPath);
                            }
                        }
                    }

                    return [
                        'name'     => $item->product?->name ?? $item->name ?? 'Produit sans nom',
                        'image'    => $imagePath,
                        'quantity' => (int) ($item->quantity ?? 1),
                        'price'    => (float) ($item->price ?? 0),
                    ];
                })->all()
            ]
        ]);
    }

    /**
     * 🏷️ Afficher l'étiquette d'emballage / colis (Format compact A6)
     */

}
