<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    /**
     * Liste des commandes pour l'admin
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $search = $request->input('search');

        $orders = Order::with(['user', 'orderItems.product', 'orderItems.productVariant.variantValues.variantType'])
            ->when($status && $status !== 'all', function ($query) use ($status) {
                return $query->where('status', $status);
            })
            ->when($search, function ($query) use ($search) {
                return $query->where('id', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($order) => [
                'id'                 => $order->id,
                'customer_name'      => $order->user?->name ?? $order->customer_name ?? $order->client_name ?? 'Client Invité',
                'customer_phone'     => $order->customer_phone ?? $order->phone ?? $order->user?->phone ?? 'Non renseigné',
                'customer_address'   => $order->customer_address ?? $order->address ?? $order->user?->address ?? 'Non renseignée',
                'customer_city'      => $order->customer_city ?? $order->city ?? '',
                'created_at'         => $order->created_at->format('d/m/Y H:i'),
                'total_price'        => (float) $order->total_price,
                'payment_status'     => $order->payment_status ?? 'payé',
                'status'             => $order->status ?? 'en_attente',
                'items_count'        => $order->orderItems ? $order->orderItems->sum('quantity') : 0,
                'is_printed'         => (bool) $order->is_printed,
                'items'              => $order->orderItems->map(function ($item) {
                    $itemName = $item->product?->name ?? 'Produit sans nom';
                    $variantDetails = null;
                    if ($item->productVariant) {
                        $variantDetails = $item->variant_description;
                        $itemName .= ' (' . $variantDetails . ')';
                    }
                    return [
                        'name'     => $itemName,
                        'quantity' => (int) ($item->quantity ?? 1),
                        'price'    => (float) ($item->price ?? 0),
                        'variant_description' => $variantDetails,
                        'sku'      => $item->variant_sku,
                    ];
                })->all(),
            ]);

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'filters' => [
                'status' => $status ?? 'all',
                'search' => $search ?? '',
            ]
        ]);
    }

    /**
     * Changement de statut individuel avec réapprovisionnement du stock si annulé
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:en_attente,payé,expédié,livré,annulé',
        ]);

        $newStatus = $validated['status'];

        DB::transaction(function () use ($order, $newStatus) {
            // Restituer le stock seulement si le statut change vers 'annulé'
            if ($newStatus === 'annulé' && $order->status !== 'annulé') {
                $this->restockOrderItems($order);
            }

            $order->update(['status' => $newStatus]);
        });

        return back();
    }

    /**
     * Action groupée sur les statuts avec réapprovisionnement du stock si annulé
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array',
            'status' => 'required|string|in:en_attente,payé,expédié,livré,annulé',
        ]);

        $newStatus = $validated['status'];

        DB::transaction(function () use ($validated, $newStatus) {
            $orders = Order::whereIn('id', $validated['ids'])->get();

            foreach ($orders as $order) {
                if ($newStatus === 'annulé' && $order->status !== 'annulé') {
                    $this->restockOrderItems($order);
                }
                $order->update(['status' => $newStatus]);
            }
        });

        return back();
    }

    /**
     * Remet en stock les articles d'une commande
     */
    private function restockOrderItems(Order $order): void
    {
        $order->loadMissing('orderItems.productVariant', 'orderItems.product');

        foreach ($order->orderItems as $item) {
            $qty = (int) ($item->quantity ?? 1);

            // Si c'est un produit avec variante
            if ($item->productVariant) {
                $item->productVariant->increment('stock', $qty);
            }
            // Si c'est un produit simple
            elseif ($item->product) {
                $item->product->increment('stock', $qty);
            }
        }
    }

    /**
     * Marquer comme imprimée
     */
    public function markAsPrinted(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
        ]);
        Order::whereIn('id', $validated['ids'])->update(['is_printed' => true]);
        return back();
    }

    public function shippingLabel($id): Response
    {
        $order = Order::with(['orderItems.product', 'orderItems.productVariant.variantValues.variantType', 'user'])->findOrFail($id);
        return Inertia::render('Admin/orders/ShippingLabel', [
            'order' => $this->formatLabelOrder($order),
        ]);
    }

    public function bulkShippingLabels(Request $request): Response
    {
        $idsParam = $request->query('ids');

        if ($idsParam === 'all') {
            $orders = Order::with(['orderItems.product', 'orderItems.productVariant.variantValues.variantType', 'user'])
                ->where('status', 'en_attente')
                ->latest()
                ->get();
        } else {
            $ids = explode(',', (string) $idsParam);
            $orders = Order::with(['orderItems.product', 'orderItems.productVariant.variantValues.variantType', 'user'])->whereIn('id', $ids)->get();
        }

        return Inertia::render('Admin/orders/ShippingLabels', [
            'orders' => $orders->map(fn ($o) => $this->formatLabelOrder($o))->all(),
        ]);
    }

    private function formatLabelOrder(Order $order): array
    {
        return [
            'id'               => $order->id,
            'created_at'       => $order->created_at->format('d/m/Y'),
            'customer_name'    => $order->customer_name ?? $order->user?->name ?? 'Client',
            'customer_phone'   => $order->customer_phone ?? $order->phone ?? $order->user?->phone ?? 'N/A',
            'customer_address' => $order->customer_address ?? $order->address ?? $order->user?->address ?? 'N/A',
            'customer_city'    => $order->customer_city ?? $order->city ?? 'N/A',
            'total_price'      => (float) $order->total_price,
            'items_count'      => $order->orderItems->sum('quantity'),
            'items'            => $order->orderItems->map(fn($item) => [
                'name' => $item->product?->name . ($item->variant_description ? ' (' . $item->variant_description . ')' : ''),
                'quantity' => $item->quantity,
                'sku' => $item->variant_sku,
            ])->all(),
        ];
    }
}
