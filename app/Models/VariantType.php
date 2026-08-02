<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VariantType extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'order',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variantValues(): HasMany
    {
        return $this->hasMany(VariantValue::class)->orderBy('order');
    }
}
