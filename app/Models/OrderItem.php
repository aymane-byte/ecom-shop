<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = ['order_id', 'product_id', 'quantity', 'price'];

    /**
     * Relation: Chaque article appartient à un produit (pour récupérer le nom, prix, image)
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relation: Chaque article appartient à une commande principale
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
