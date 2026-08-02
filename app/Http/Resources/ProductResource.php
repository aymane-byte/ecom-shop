<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'description'         => $this->description,
            'category'            => $this->category ?? null,
            'categories'          => $this->whenLoaded('categories'),
            'brand'               => $this->brand ?? null,
            'reference'           => $this->reference ?? null,
            'status'              => $this->status ?? 'Active',
            'featured'            => (bool) ($this->featured ?? false),
            'price'               => $this->price,
            'discount_price'      => $this->discount_price,
            'stock'               => $this->stock,
            'sku'                 => $this->sku ?? null,
            'weight'              => $this->weight ?? null,
            'barcode'             => $this->barcode ?? null,
            'image'               => $this->image,
            'has_variants'        => (bool) $this->has_variants,
            'created_at'          => $this->created_at?->format('Y-m-d H:i:s'),

            // Computed fields
            'original_price'      => $this->original_price,
            'final_price'         => $this->final_price,
            'discount_percentage' => $this->discount_percentage,
            'has_discount'        => $this->has_discount,
            'total_stock'         => $this->total_stock,
            'in_stock'            => $this->in_stock,
            'first_variant'       => $this->whenLoaded('productVariants', fn() => $this->first_variant ? new ProductVariantResource($this->first_variant) : null),
            'display_price'       => $this->display_price,
            'computed_discount_price' => $this->computed_discount_price,

            // Formatted relations
            'images'              => ProductImageResource::collection($this->whenLoaded('images')),
            'variant_types'       => VariantTypeResource::collection($this->whenLoaded('variantTypes')),
            'product_variants'    => ProductVariantResource::collection($this->whenLoaded('productVariants')),
        ];
    }
}
