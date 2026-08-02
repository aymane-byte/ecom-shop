<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\VariantType;
use App\Models\VariantValue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    /**
     * CÔTÉ ADMIN : Liste des produits
     */
    public function adminIndex()
    {
        $products = Product::with([
            'images',
            'productVariants.variantValues.variantType',
            'variantTypes.variantValues.images'
        ])->latest()->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($products)
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
        // Normalize request data
        $requestData = $request->all();

        // If has_variants is true, remove price and stock from validation
        if (isset($requestData['has_variants']) && filter_var($requestData['has_variants'], FILTER_VALIDATE_BOOLEAN)) {
            unset($requestData['price']);
            unset($requestData['stock']);
        } else {
            // Otherwise, normalize empty strings to null
            if (array_key_exists('price', $requestData) && $requestData['price'] === '') {
                $requestData['price'] = null;
            }
            if (array_key_exists('stock', $requestData) && $requestData['stock'] === '') {
                $requestData['stock'] = null;
            }
        }

        $request->merge($requestData);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'category'     => 'nullable|string|max:255',
            'has_variants' => 'boolean',
            'price'        => 'required_if:has_variants,false|nullable|numeric|min:0',
            'stock'        => 'required_if:has_variants,false|nullable|integer|min:0',
            'image'        => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'current_image'=> 'nullable|string',
            'gallery.*'    => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',

            // Variant Types
            'variant_types'                  => 'array|required_if:has_variants,true',
            'variant_types.*.id'             => 'nullable',
            'variant_types.*.name'           => 'required_if:has_variants,true|string|max:255',
            'variant_types.*.order'          => 'nullable|integer',
            'variant_types.*.values'         => 'array|required_if:has_variants,true|min:1',
            'variant_types.*.values.*.id'    => 'nullable',
            'variant_types.*.values.*.value' => 'required_if:has_variants,true|string|max:255',
            'variant_types.*.values.*.order' => 'nullable|integer',
            'variant_types.*.values.*.image' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'variant_types.*.values.*.current_image_path' => 'nullable|string',

            // Product Variants
            'product_variants'                        => 'array|required_if:has_variants,true',
            'product_variants.*.id'                   => 'nullable',
            'product_variants.*.variant_value_ids'    => 'required_if:has_variants,true|array|min:1',
            'product_variants.*.variant_value_ids.*'  => 'required',

            // SKU Rule Secured
            'product_variants.*.sku' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    preg_match('/product_variants\.(\d+)\.sku/', $attribute, $matches);
                    $index = $matches[1] ?? null;

                    if ($index !== null && !empty($value)) {
                        $exists = DB::table('product_variants')
                            ->where('sku', $value)
                            ->exists();

                        if ($exists) {
                            $fail("SKU '{$value}' déjà utilisé.");
                        }
                    }
                },
            ],
            'product_variants.*.stock'          => 'required_if:has_variants,true|integer|min:0',
            'product_variants.*.price'          => 'nullable|numeric|min:0',
            'product_variants.*.discount_price' => 'nullable|numeric|min:0|lte:product_variants.*.price',
            'product_variants.*.weight'         => 'nullable|numeric|min:0',
            'product_variants.*.barcode'        => 'nullable|string|max:255',
            'product_variants.*.status'         => 'boolean',
        ]);

        DB::transaction(function () use ($request, $validated) {
            // Handle main product image upload
            $mainImagePath = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $mainImagePath = '/storage/' . $path;
            }

            $product = Product::create([
                'name'         => $validated['name'],
                'description'  => $validated['description'],
                'category'     => $validated['category'] ?? null,
                'price'        => $validated['price'] ?? 0,
                'stock'        => $validated['stock'] ?? 0,
                'image'        => $mainImagePath,
                'has_variants' => $validated['has_variants'],
            ]);

            // Handle gallery images
            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $file) {
                    $galleryPath = $file->store('products/gallery', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => '/storage/' . $galleryPath,
                        'variant_value_id' => null,
                    ]);
                }
            }

            if ($validated['has_variants']) {
                $variantValueIdMap = [];

                foreach ($validated['variant_types'] as $typeIndex => $vtData) {
                    $variantType = $product->variantTypes()->create([
                        'name'  => $vtData['name'],
                        'order' => $vtData['order'] ?? 0,
                    ]);

                    foreach ($vtData['values'] as $valueIndex => $vvData) {
                        $variantValue = $variantType->variantValues()->create([
                            'value' => $vvData['value'],
                            'order' => $vvData['order'] ?? 0,
                        ]);

                        if (isset($vvData['id'])) {
                            $variantValueIdMap[$vvData['id']] = $variantValue->id;
                        }
                        $variantValueIdMap["{$typeIndex}_{$valueIndex}"] = $variantValue->id;

                        if (isset($vvData['image']) && $vvData['image'] instanceof \Illuminate\Http\UploadedFile) {
                            $imagePath = $vvData['image']->store('products/variant_values', 'public');
                            ProductImage::create([
                                'product_id' => $product->id,
                                'image_path' => '/storage/' . $imagePath,
                                'variant_value_id' => $variantValue->id,
                            ]);
                        }
                    }
                }

                foreach ($validated['product_variants'] as $pvData) {
                    $mappedVariantValueIds = collect($pvData['variant_value_ids'])->map(function ($tempId) use ($variantValueIdMap) {
                        return $variantValueIdMap[$tempId] ?? (is_numeric($tempId) ? (int)$tempId : null);
                    })->filter()->values()->all();

                    if (count($mappedVariantValueIds) !== count($pvData['variant_value_ids'])) {
                        throw new \Exception("Invalid variant_value_ids provided for product variant.");
                    }

                    $productVariant = $product->productVariants()->create([
                        'sku'            => $pvData['sku'],
                        'stock'          => $pvData['stock'],
                        'price'          => $pvData['price'] ?? null,
                        'discount_price' => $pvData['discount_price'] ?? null,
                        'weight'         => $pvData['weight'] ?? null,
                        'barcode'        => $pvData['barcode'] ?? null,
                        'status'         => $pvData['status'],
                    ]);

                    $productVariant->variantValues()->attach($mappedVariantValueIds);
                }
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Produit créé avec succès ! 🎉');
    }

    /**
     * CÔTÉ ADMIN : Formulaire d'édition
     */
    public function edit(Product $product)
    {
        $product->load([
            'images',
            'variantTypes.variantValues.images',
            'productVariants.variantValues.variantType'
        ]);

        return Inertia::render('Admin/Products/Edit', [
            'product' => ProductResource::make($product)
        ]);
    }

    /**
     * CÔTÉ ADMIN : Mettre à jour un produit
     */
    public function update(Request $request, Product $product)
    {
        // Normalize request data before validation
        $requestData = $request->all();

        if (isset($requestData['has_variants']) && filter_var($requestData['has_variants'], FILTER_VALIDATE_BOOLEAN)) {
            unset($requestData['price']);
            unset($requestData['stock']);
        } else {
            if (array_key_exists('price', $requestData) && $requestData['price'] === '') {
                $requestData['price'] = null;
            }
            if (array_key_exists('stock', $requestData) && $requestData['stock'] === '') {
                $requestData['stock'] = null;
            }
        }

        $request->merge($requestData);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'category'     => 'nullable|string|max:255',
            'has_variants' => 'boolean',
            'price'        => 'required_if:has_variants,false|nullable|numeric|min:0',
            'stock'        => 'required_if:has_variants,false|nullable|integer|min:0',
            'image'        => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'current_image'=> 'nullable|string',
            'gallery.*'    => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',

            // Variant Types
            'variant_types'                  => 'array|required_if:has_variants,true',
            'variant_types.*.id'             => 'nullable',
            'variant_types.*.name'           => 'required_if:has_variants,true|string|max:255',
            'variant_types.*.order'          => 'nullable|integer',
            'variant_types.*.values'         => 'array|required_if:has_variants,true|min:1',
            'variant_types.*.values.*.id'    => 'nullable',
            'variant_types.*.values.*.value' => 'required_if:has_variants,true|string|max:255',
            'variant_types.*.values.*.order' => 'nullable|integer',
            'variant_types.*.values.*.image' => 'nullable|file|mimes:jpeg,png,jpg,webp,avif|max:3072',
            'variant_types.*.values.*.current_image_path' => 'nullable|string',

            // Product Variants
            'product_variants'                        => 'array|required_if:has_variants,true',
            'product_variants.*.id'                   => 'nullable',
            'product_variants.*.variant_value_ids'    => 'required_if:has_variants,true|array|min:1',
            'product_variants.*.variant_value_ids.*'  => 'required',

            // SKU Rule Secured
            'product_variants.*.sku' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    preg_match('/product_variants\.(\d+)\.sku/', $attribute, $matches);
                    $index = $matches[1] ?? null;

                    if ($index !== null && !empty($value)) {
                        $exists = DB::table('product_variants')
                            ->where('sku', $value)
                            ->exists();

                        if ($exists) {
                            $fail("SKU '{$value}' déjà utilisé.");
                        }
                    }
                },
            ],
            'product_variants.*.stock'          => 'required_if:has_variants,true|integer|min:0',
            'product_variants.*.price'          => 'nullable|numeric|min:0',
            'product_variants.*.discount_price' => 'nullable|numeric|min:0|lte:product_variants.*.price',
            'product_variants.*.weight'         => 'nullable|numeric|min:0',
            'product_variants.*.barcode'        => 'nullable|string|max:255',
            'product_variants.*.status'         => 'boolean',
        ]);

        DB::transaction(function () use ($request, $validated, $product) {
            $mainImagePath = $product->image;
            if ($request->hasFile('image')) {
                if ($product->image) {
                    $oldPath = str_replace('/storage/', '', $product->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('image')->store('products', 'public');
                $mainImagePath = '/storage/' . $path;
            } else if ($request->input('current_image') === null) {
                if ($product->image) {
                    $oldPath = str_replace('/storage/', '', $product->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $mainImagePath = null;
            }

            $product->update([
                'name'         => $validated['name'],
                'description'  => $validated['description'],
                'category'     => $validated['category'] ?? null,
                'price'        => $validated['price'] ?? 0,
                'stock'        => $validated['stock'] ?? 0,
                'image'        => $mainImagePath,
                'has_variants' => $validated['has_variants'],
            ]);

            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $file) {
                    $galleryPath = $file->store('products/gallery', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => '/storage/' . $galleryPath,
                        'variant_value_id' => null,
                    ]);
                }
            }

            if (!$validated['has_variants'] && $product->has_variants) {
                $this->deleteProductVariantData($product);
            }

            if ($validated['has_variants']) {
                $this->syncVariantData($product, $validated);
            }
        });

        return redirect()->route('admin.products.index')->with('success', 'Produit mis à jour avec succès ! 🚀');
    }

    /**
     * Helper function to sync variant types, values, and product variants.
     */
    protected function syncVariantData(Product $product, array $validatedData): void
    {
        // 1. Delete Variant Types removed by user
        $existingVariantTypeIds = $product->variantTypes->pluck('id')->toArray();
        $submittedVariantTypeIds = collect($validatedData['variant_types'])
            ->pluck('id')
            ->filter(fn($id) => is_numeric($id))
            ->toArray();

        $variantTypesToDelete = array_diff($existingVariantTypeIds, $submittedVariantTypeIds);
        foreach ($variantTypesToDelete as $vtId) {
            $variantType = VariantType::find($vtId);
            if ($variantType) {
                foreach ($variantType->variantValues as $variantValue) {
                    foreach ($variantValue->images as $image) {
                        $this->deleteImageFile($image->image_path);
                        $image->delete();
                    }
                }
                $variantType->delete();
            }
        }

        // Map to keep track of temporary IDs -> DB IDs
        $valueIdMap = [];
        $currentVariantValueIds = [];

        // 2. Sync Variant Types & Variant Values
        foreach ($validatedData['variant_types'] as $typeIndex => $vtData) {
            $variantType = null;
            if (isset($vtData['id']) && is_numeric($vtData['id'])) {
                $variantType = $product->variantTypes()->find($vtData['id']);
            }

            if ($variantType) {
                $variantType->update([
                    'name'  => $vtData['name'],
                    'order' => $vtData['order'] ?? 0,
                ]);
            } else {
                $variantType = $product->variantTypes()->create([
                    'name'  => $vtData['name'],
                    'order' => $vtData['order'] ?? 0,
                ]);
            }

            // Delete deleted values
            $existingVariantValueIds = $variantType->variantValues->pluck('id')->toArray();
            $submittedVariantValueIds = collect($vtData['values'])
                ->pluck('id')
                ->filter(fn($id) => is_numeric($id))
                ->toArray();

            $variantValuesToDelete = array_diff($existingVariantValueIds, $submittedVariantValueIds);
            foreach ($variantValuesToDelete as $vvId) {
                $variantValue = VariantValue::find($vvId);
                if ($variantValue) {
                    foreach ($variantValue->images as $image) {
                        $this->deleteImageFile($image->image_path);
                        $image->delete();
                    }
                    $variantValue->delete();
                }
            }

            // Upsert Values
            foreach ($vtData['values'] as $valueIndex => $vvData) {
                $variantValue = null;
                $providedId = $vvData['id'] ?? null;

                if ($providedId && is_numeric($providedId)) {
                    $variantValue = $variantType->variantValues()->find($providedId);
                }

                $currentVariantValueImage = $variantValue ? $variantValue->images()->first() : null;
                $newVariantValueImagePath = $currentVariantValueImage ? $currentVariantValueImage->image_path : null;

                if (isset($vvData['image']) && $vvData['image'] instanceof \Illuminate\Http\UploadedFile) {
                    if ($currentVariantValueImage) {
                        $this->deleteImageFile($currentVariantValueImage->image_path);
                        $currentVariantValueImage->delete();
                    }
                    $imagePath = $vvData['image']->store('products/variant_values', 'public');
                    $newVariantValueImagePath = '/storage/' . $imagePath;
                } else if (array_key_exists('current_image_path', $vvData) && $vvData['current_image_path'] === null && $currentVariantValueImage) {
                    $this->deleteImageFile($currentVariantValueImage->image_path);
                    $currentVariantValueImage->delete();
                    $newVariantValueImagePath = null;
                }

                if ($variantValue) {
                    $variantValue->update([
                        'value' => $vvData['value'],
                        'order' => $vvData['order'] ?? 0,
                    ]);
                } else {
                    $variantValue = $product->variantTypes()->find($variantType->id)->variantValues()->create([
                        'value' => $vvData['value'],
                        'order' => $vvData['order'] ?? 0,
                    ]);
                }

                // Register mappings for temp IDs
                if ($providedId) {
                    $valueIdMap[$providedId] = $variantValue->id;
                }
                $valueIdMap["{$typeIndex}_{$valueIndex}"] = $variantValue->id;

                if ($newVariantValueImagePath) {
                    if ($currentVariantValueImage) {
                        $currentVariantValueImage->update(['image_path' => $newVariantValueImagePath]);
                    } else {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $newVariantValueImagePath,
                            'variant_value_id' => $variantValue->id,
                        ]);
                    }
                }

                $currentVariantValueIds[] = $variantValue->id;
            }
        }

        // 3. Delete old product variants
        $existingProductVariantIds = $product->productVariants->pluck('id')->toArray();
        $submittedProductVariantIds = collect($validatedData['product_variants'])
            ->pluck('id')
            ->filter(fn($id) => is_numeric($id))
            ->toArray();

        $productVariantsToDelete = array_diff($existingProductVariantIds, $submittedProductVariantIds);
        ProductVariant::whereIn('id', $productVariantsToDelete)->delete();

        // 4. Save Product Variants
        foreach ($validatedData['product_variants'] as $pvData) {
            $productVariant = null;
            if (isset($pvData['id']) && is_numeric($pvData['id'])) {
                $productVariant = $product->productVariants()->find($pvData['id']);
            }

            // Map any temp IDs or existing numeric IDs to actual DB IDs
            $realVariantValueIds = collect($pvData['variant_value_ids'])->map(function ($valId) use ($valueIdMap) {
                if (is_numeric($valId)) {
                    return (int)$valId;
                }
                return $valueIdMap[$valId] ?? null;
            })->filter()->values()->all();

            $variantData = [
                'sku'            => $pvData['sku'],
                'stock'          => $pvData['stock'],
                'price'          => $pvData['price'] ?? null,
                'discount_price' => $pvData['discount_price'] ?? null,
                'weight'         => $pvData['weight'] ?? null,
                'barcode'        => $pvData['barcode'] ?? null,
                'status'         => $pvData['status'],
            ];

            if ($productVariant) {
                $productVariant->update($variantData);
            } else {
                $productVariant = $product->productVariants()->create($variantData);
            }

            $productVariant->variantValues()->sync($realVariantValueIds);
        }
    }

    /**
     * Helper function to delete all variant-related data for a product.
     */
    protected function deleteProductVariantData(Product $product): void
    {
        foreach ($product->variantTypes as $variantType) {
            foreach ($variantType->variantValues as $variantValue) {
                foreach ($variantValue->images as $image) {
                    $this->deleteImageFile($image->image_path);
                    $image->delete();
                }
            }
        }
        $product->productVariants()->delete();
        $product->variantTypes()->delete();
    }

    /**
     * Helper function to delete image file from storage.
     */
    protected function deleteImageFile(?string $path): void
    {
        if ($path) {
            $relativePath = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
    }

    /**
     * Supprimer une image spécifique de la galerie
     */
    public function deleteImage(ProductImage $image)
    {
        $this->deleteImageFile($image->image_path);
        $image->delete();

        return back()->with('success', 'Image supprimée.');
    }

    /**
     * Supprimer une variante de produit spécifique
     */
    public function destroyVariant(ProductVariant $variant)
    {
        $variant->delete();

        return back()->with('success', 'Variante de produit supprimée.');
    }

    /**
     * CÔTÉ ADMIN : Supprimer un produit
     */
    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product) {
            foreach ($product->images()->whereNull('variant_value_id')->get() as $img) {
                $this->deleteImageFile($img->image_path);
                $img->delete();
            }

            $this->deleteProductVariantData($product);
            $this->deleteImageFile($product->image);

            $product->delete();
        });

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

        $product->load([
            'images',
            'variantTypes.variantValues.images',
            'productVariants.variantValues.variantType'
        ]);

        return Inertia::render('Product/Show', [
            'product' => ProductResource::make($product),
            'userShipping' => $userShipping
        ]);
    }
}
