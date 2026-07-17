<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $orders = Order::with(['user', 'items.product'])
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
                'created_at'         => $order->created_at->format('d/m/Y H:i'),
                'total_price'        => (float) $order->total_price,
                'payment_status'     => $order->payment_status ?? 'payé',
                'status'             => $order->status ?? 'en_attente',
                'items_count'        => $order->items ? $order->items->sum('quantity') : 1,
                'is_printed'         => (bool) $order->is_printed,
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
     * Changement de statut individuel
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:en_attente,payé,expédié,livré,annulé',
        ]);
        $order->update(['status' => $validated['status']]);
        return back();
    }

    /**
     * Action groupée sur les statuts
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array',
            'status' => 'required|string|in:en_attente,payé,expédié,livré,annulé',
        ]);
        Order::whereIn('id', $validated['ids'])->update(['status' => $validated['status']]);
        return back();
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
        $order = Order::with(['items.product', 'user'])->findOrFail($id);
        return Inertia::render('Admin/orders/ShippingLabel', [
            'order' => $this->formatLabelOrder($order),
        ]);
    }

    public function bulkShippingLabels(Request $request): Response
    {
        $idsParam = $request->query('ids');

        if ($idsParam === 'all') {
            $orders = Order::with(['items.product', 'user'])
                ->where('status', 'en_attente')
                ->latest()
                ->get();
        } else {
            $ids = explode(',', (string) $idsParam);
            $orders = Order::with(['items.product', 'user'])->whereIn('id', $ids)->get();
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
            'items_count'      => $order->items->sum('quantity'),
            'items'            => $order->items->map(fn($i) => [
                'name' => $i->product?->name ?? 'Article',
                'quantity' => $i->quantity
            ])->all(),
        ];
    }
}
