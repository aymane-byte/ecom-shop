<?php

use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Page d'accueil publique
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'products' => Product::with('images')->latest()->get(),
    ]);
})->name('home');

// 2. Auth Pure sur-mesure
Route::middleware('guest')->group(function () {
    // Connexion
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    // Inscription
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// 🚪 Déconnexion sécurisée
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// 3. Consultation des Produits & Actions du Panier
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('/cart', [CartController::class, 'show'])->name('cart.index');
Route::post('/cart/add/{product}', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/update/{id}', [CartController::class, 'updateQuantity'])->name('cart.update');
Route::delete('/cart/remove/{id}', [CartController::class, 'remove'])->name('cart.remove');

Route::get('/orders/{id}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');

Route::post('/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
Route::post('/direct-order/{product}', [CartController::class, 'directCheckout'])->name('cart.directCheckout');
Route::get('/order-success/{id}', [OrderController::class, 'success'])->name('orders.success');

/*
|--------------------------------------------------------------------------
| Routes Sécurisées (Uniquement pour les utilisateurs connectés)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Profil utilisateur
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Historique des commandes pour l'utilisateur connecté
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');

    // --- 🛡️ ESPACE ADMIN ---
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Gestion de stock & produits
        Route::get('/products', [ProductController::class, 'adminIndex'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Supprimer une image de la galerie
        Route::delete('/product-images/{image}', [ProductController::class, 'deleteImage'])->name('product-images.destroy');

        // Gestion globale des Commandes
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/bulk-status', [AdminOrderController::class, 'bulkUpdateStatus'])->name('orders.bulkUpdateStatus');
        Route::post('/orders/mark-printed', [AdminOrderController::class, 'markAsPrinted'])->name('orders.markAsPrinted');
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.updateStatus');

        // 🏷️ Route pour les étiquettes de colis / emballage
        Route::get('/orders/shipping-labels', [AdminOrderController::class, 'bulkShippingLabels'])->name('orders.bulkShippingLabels');
        Route::get('/orders/{id}/shipping-label', [AdminOrderController::class, 'shippingLabel'])->name('orders.shippingLabel');
    });
});
