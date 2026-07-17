<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 📊 🔥 FIX STATS : Le CA ne prend en compte QUE les commandes payées, expédiées ou livrées
        $chiffreAffaires = (float) Order::whereIn('status', ['payé', 'expédié', 'livré'])->sum('total_price');

        // Commandes globales (on garde le total ou tu peux aussi filtrer selon ton choix)
        $totalOrders = Order::count();

        // Nombre de clients inscrits
        $totalClients = User::count();

        // Articles en rupture
        $outOfStockCount = Product::where('stock', 0)->count();

        // 🏆 Top produits vendus (uniquement dans les commandes payées/validées)
        $topProducts = DB::table('order_items')
            ->select('products.name', 'products.image', 'products.price', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', ['payé', 'expédié', 'livré']) // Filter hna f top products
            ->groupBy('products.id', 'products.name', 'products.image', 'products.price')
            ->orderByDesc('total_sold')
            ->take(3)
            ->get();

        // 🔄 FIX GUEST VISUALISATION : Affichage propre des Guests dans l'activité récente
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($order) {
                // Fallback direct ila kan Guest (user_id === null)
                $name = $order->user?->name
                    ?? $order->customer_name
                    ?? $order->client_name
                    ?? 'Client Invité';

                return [
                    'id' => $order->id,
                    'client_name' => $name,
                    'total_price' => (float) $order->total_price,
                    'status' => $order->status ?? 'en_attente',
                    'created_at' => $order->created_at->format('d/m/Y H:i'),
                ];
            });

        // ⚡ FIX PANIER MOYEN : Uniquement sur les commandes traitées/payées
        $paidOrdersCount = Order::whereIn('status', ['payé', 'expédié', 'livré'])->count();
        $panierMoyen = $paidOrdersCount > 0 ? ($chiffreAffaires / $paidOrdersCount) : 0;

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'chiffre_affaires'  => $chiffreAffaires,
                'total_orders'      => $totalOrders,
                'total_clients'     => $totalClients,
                'out_of_stock'      => $outOfStockCount,
                'top_products'      => $topProducts,
                'recent_orders'     => $recentOrders,
                'panier_moyen'      => (float) $panierMoyen
            ]
        ]);
    }
}
