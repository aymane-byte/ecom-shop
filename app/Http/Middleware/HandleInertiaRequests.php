<?php

namespace App\Http\Middleware;

use App\Models\Order; // 👈 1. Ajout de l'import du modèle Order
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // On récupère la session 'Cart' avec le C majuscule
        $cart = session()->get('Cart', []);

        $cartCount = 0;
        foreach ($cart as $item) {
            $cartCount += $item['quantity'];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                // Hna ghadi n-forciw l-cast b (bool) b7al hka bach l-Front t-wslo true/false pure
                'isAdmin' => $request->user() ? (bool) $request->user()->is_admin : false,
            ],
            'cart' => $cart,
            'cartCount' => $cartCount,

            // 🚀 2. Partage dynamique du nombre de commandes en attente pour l'admin
            'orders_count' => Order::where('status', 'en_attente')->count(),

            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
