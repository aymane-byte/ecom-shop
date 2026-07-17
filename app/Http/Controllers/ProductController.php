<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * CÔTÉ ADMIN : Liste des produits
     */
    public function adminIndex()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::with('images')->latest()->get()
        ]);
    }

    /**
     * CÔTÉ ADMIN : Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Admin/Products/Create');
    }

    /**
     * CÔTÉ ADMIN : Enregistrer un produit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'stock'        => 'required|integer|min:0',
            'image'        => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'gallery.*'    => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072', // Images galerie
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $product = Product::create($validated);

        // 🖼️ Galerie d'images supplémentaires
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $galleryPath = $file->store('products/gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => '/storage/' . $galleryPath
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produit créé avec succès ! 🎉');
    }

    /**
     * CÔTÉ ADMIN : Formulaire d'édition
     */
    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product->load('images')
        ]);
    }

    /**
     * CÔTÉ ADMIN : Mettre à jour un produit
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'stock'        => 'required|integer|min:0',
            'image'        => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'gallery.*'    => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                $oldPath = str_replace('/storage/', '', $product->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        $product->update($validated);

        // 🖼️ Ajouter des images à la galerie existante
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $galleryPath = $file->store('products/gallery', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => '/storage/' . $galleryPath
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produit mis à jour avec succès ! 🚀');
    }

    /**
     * Supprimer une image spécifique de la galerie
     */
    public function deleteImage(ProductImage $image)
    {
        $path = str_replace('/storage/', '', $image->image_path);
        Storage::disk('public')->delete($path);
        $image->delete();

        return back()->with('success', 'Image supprimée.');
    }

    /**
     * CÔTÉ ADMIN : Supprimer un produit
     */
    public function destroy(Product $product)
    {
        // Supprimer toutes les images associées
        foreach ($product->images as $img) {
            $path = str_replace('/storage/', '', $img->image_path);
            Storage::disk('public')->delete($path);
        }

        if ($product->image) {
            $path = str_replace('/storage/', '', $product->image);
            Storage::disk('public')->delete($path);
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Produit supprimé.');
    }

    /**
     * CÔTÉ CLIENT : Fiche produit détaillée
     */
    public function show(Product $product)
    {
        $userShipping = null;

        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            $userShipping = [
                'phone' => $user->phone ?? '',
                'address' => $user->address ?? '',
                'city' => $user->city ?? '',
            ];
        }

        return Inertia::render('Product/Show', [
            'product' => $product->load('images'),
            'userShipping' => $userShipping
        ]);
    }
}
