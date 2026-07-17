<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
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
        $cart = session()->get('Cart', []);
        $userShipping = null;

        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            $userShipping = [
                'phone' => $user->phone ?? '',
                'address' => $user->address ?? '',
                'city' => $user->city ?? '', // Récupérer la ville si existante
            ];
        }

        return Inertia::render('Cart/Index', [
            'cart' => $cart,
            'userShipping' => $userShipping
        ]);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        $quantityToAdd = (int) $request->input('quantity', 1);
        if ($quantityToAdd < 1) $quantityToAdd = 1;

        $cart = session()->get('Cart', []);

        if (isset($cart[$product->id])) {
            $cart[$product->id]['quantity'] += $quantityToAdd;
        } else {
            $cart[$product->id] = [
                "name" => $product->name,
                "quantity" => $quantityToAdd,
                "price" => $product->price,
                "image" => $product->image
            ];
        }

        session()->put('Cart', $cart);
        return back();
    }

    public function updateQuantity(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = session()->get('Cart', []);

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] = $request->quantity;
            session()->put('Cart', $cart);
        }

        return back();
    }

    public function remove($id): RedirectResponse
    {
        $cart = session()->get('Cart', []);

        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('Cart', $cart);
        }

        return back();
    }

    public function checkout(Request $request): RedirectResponse
    {
        $cart = session()->get('Cart', []);

        if (empty($cart)) {
            return redirect()->back()->with('error', 'Votre panier est vide.');
        }

        // Validation standardisée avec le nouveau champ 'city'
        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|min:8',
            'customer_city'    => 'required|string', // Obligatoire pour le tri logistique
            'customer_address' => 'required|string|min:4',
            'customer_email'   => Auth::check() ? 'nullable|email' : 'required|email',
        ]);

        try {
            DB::beginTransaction();
            $total = 0;

            foreach ($cart as $id => $item) {
                $total += $item['price'] * $item['quantity'];

                $product = Product::find($id);
                if ($product) {
                    if ($product->stock < $item['quantity']) {
                        return redirect()->back()->with('error', "Le produit {$product->name} n'a pas assez de stock.");
                    }
                    $product->decrement('stock', $item['quantity']);
                }
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

            // Création de la commande avec Ville et Adresse séparées
            $order = Order::create([
                'user_id'          => Auth::id(),
                'total_price'      => $total,
                'status'           => 'en_attente',
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'city'             => $request->customer_city, // Colonne 'city' en BDD
                'customer_address' => $request->customer_address,
                'customer_email'   => Auth::check() ? Auth::user()->email : $request->customer_email,
                'is_guest'         => !Auth::check(),
            ]);

            foreach ($cart as $id => $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $id,
                    'quantity'   => $item['quantity'],
                    'price'      => $item['price'],
                ]);
            }

            DB::commit();

            if (!Auth::check()) {
                session(['guest_order_id' => $order->id]);
            }

            session()->forget('Cart');
            return redirect()->route('orders.success', ['id' => $order->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }

    public function directCheckout(Request $request, Product $product): RedirectResponse
    {
        $quantity = (int) $request->input('quantity', 1);
        if ($quantity < 1) $quantity = 1;

        // Validation
        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|min:8',
            'customer_city'    => 'required|string',
            'customer_address' => 'required|string|min:4',
            'customer_email'   => Auth::check() ? 'nullable|email' : 'required|email',
            'quantity'         => 'required|integer|min:1|max:' . $product->stock,
        ]);

        try {
            DB::beginTransaction();

            // Vérifier le stock
            if ($product->stock < $quantity) {
                return redirect()->back()->with('error', "Le produit {$product->name} n'a pas assez de stock.");
            }

            $total = $product->price * $quantity;
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

            // Création de la commande directe
            $order = Order::create([
                'user_id'          => Auth::id(),
                'total_price'      => $total,
                'status'           => 'en_attente',
                'customer_name'    => $request->customer_name,
                'customer_phone'   => $request->customer_phone,
                'city'             => $request->customer_city,
                'customer_address' => $request->customer_address,
                'customer_email'   => Auth::check() ? Auth::user()->email : $request->customer_email,
                'is_guest'         => !Auth::check(),
            ]);

            // Création de l'item de commande
            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'quantity'   => $quantity,
                'price'      => $product->price,
            ]);

            DB::commit();

            if (!Auth::check()) {
                session(['guest_order_id' => $order->id]);
            }

            return redirect()->route('orders.success', ['id' => $order->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }
}
