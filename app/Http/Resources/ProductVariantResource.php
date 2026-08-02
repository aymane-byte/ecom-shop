<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'weight' => $this->weight,
            'barcode' => $this->barcode,
            'status' => (bool) $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'variant_values' => VariantValueResource::collection($this->whenLoaded('variantValues')),
            'name' => $this->name, // Accessor from model
        ];
    }
}
