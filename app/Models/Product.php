<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'discount_price',
        'stock',
        'image',
        'has_variants'
    ];

    /**
     * Relation: Un produit peut avoir plusieurs images supplémentaires (Galerie)
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->whereNull('variant_value_id');
    }

    /**
     * Relation: Un produit peut avoir plusieurs types de variantes (ex: Couleur, Taille)
     */
    public function variantTypes(): HasMany
    {
        return $this->hasMany(VariantType::class)->orderBy('order');
    }

    /**
     * Relation: Un produit peut avoir plusieurs variantes (combinaisons spécifiques)
     */
    public function productVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Computed fields for pricing and stock

    public function getOriginalPriceAttribute(): float
    {
        if ($this->has_variants && $this->relationLoaded('productVariants') && $this->productVariants->count() > 0) {
            $enabledVariants = $this->productVariants->where('status', true);
            $prices = $enabledVariants->map(fn($pv) => $pv->price ?? $this->price)->filter(fn($p) => $p !== null && $p > 0);
            return $prices->min() ?? (float)($this->price ?? 0);
        }
        return (float)($this->price ?? 0);
    }

    public function getComputedDiscountPriceAttribute(): ?float
    {
        if ($this->has_variants && $this->relationLoaded('productVariants') && $this->productVariants->count() > 0) {
            $enabledVariants = $this->productVariants->where('status', true);
            $discountPrices = $enabledVariants->map(fn($pv) => $pv->discount_price)->filter(fn($p) => $p !== null && $p > 0);
            if ($discountPrices->count() > 0) {
                return $discountPrices->min();
            }
        }
        $discount = $this->discount_price;
        return ($discount !== null && $discount > 0) ? (float)$discount : null;
    }

    public function getFinalPriceAttribute(): float
    {
        $discount = $this->computed_discount_price;
        if ($discount !== null && $discount > 0) {
            return (float)$discount;
        }
        return $this->original_price;
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        $discount = $this->computed_discount_price;
        $original = $this->original_price;
        if ($discount !== null && $discount > 0 && $original > 0 && $discount < $original) {
            return (int)round((($original - $discount) / $original) * 100);
        }
        return null;
    }

    public function getHasDiscountAttribute(): bool
    {
        return $this->discount_percentage !== null;
    }

    public function getTotalStockAttribute(): int
    {
        if ($this->has_variants && $this->relationLoaded('productVariants') && $this->productVariants->count() > 0) {
            return (int)$this->productVariants->where('status', true)->sum('stock');
        }
        return (int)($this->stock ?? 0);
    }

    public function getInStockAttribute(): bool
    {
        return $this->total_stock > 0;
    }

    public function getFirstVariantAttribute(): ?ProductVariant
    {
        if ($this->has_variants && $this->relationLoaded('productVariants') && $this->productVariants->count() > 0) {
            return $this->productVariants->where('status', true)->where('stock', '>', 0)->first()
                ?? $this->productVariants->where('status', true)->first()
                ?? $this->productVariants->first();
        }
        return null;
    }

    public function getDisplayPriceAttribute(): float
    {
        $discount = $this->computed_discount_price;
        if ($discount !== null && $discount > 0) {
            return (float)$discount;
        }
        return $this->original_price;
    }
}
