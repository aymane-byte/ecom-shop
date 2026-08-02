<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('variant_description')->nullable()->after('price');
            $table->string('variant_sku')->nullable()->after('variant_description');
            $table->decimal('variant_price', 10, 2)->nullable()->after('variant_sku');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['variant_description', 'variant_sku', 'variant_price']);
        });
    }
};
