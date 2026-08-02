<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VariantValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'variant_type_id',
        'value',
        'order',
    ];

    public function variantType(): BelongsTo
    {
        return $this->belongsTo(VariantType::class);
    }

    public function productVariants(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_variant_value');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
