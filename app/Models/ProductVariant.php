<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'stock',
        'price',
        'discount_price',
        'weight',
        'barcode',
        'status',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variantValues(): BelongsToMany
    {
        return $this->belongsToMany(VariantValue::class, 'product_variant_value');
    }

    // Helper to get a descriptive name for the variant
    public function getNameAttribute(): string
    {
        return $this->variantValues->map(function ($value) {
            return $value->variantType->name . ': ' . $value->value;
        })->implode(', ');
    }
}
