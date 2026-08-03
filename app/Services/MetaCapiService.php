<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCapiService
{
    protected string $pixelId;
    protected string $token;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id');
        $this->token = config('services.meta.capi_token');
    }

    public function sendEvent(string $eventName, array $customData = [], array $userData = [], ?string $eventId = null)
    {
        $url = "https://graph.facebook.com/v19.0/{$this->pixelId}/events";

        $payload = [
            'data' => [
                [
                    'event_name' => $eventName,
                    'event_time' => time(),
                    'event_id' => $eventId,
                    'action_source' => 'website',
                    'user_data' => array_merge([
                        'client_ip_address' => request()->ip(),
                        'client_user_agent' => request()->userAgent(),
                    ], $userData),
                    'custom_data' => $customData,
                ]
            ],
            'test_event_code' => 'TEST99862', // <-- كود الاختبار ديالك فـ Meta
            'access_token' => $this->token,
        ];

        try {
            $response = Http::post($url, $payload);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('Meta CAPI Error: ' . $e->getMessage());
            return null;
        }
    }
}
