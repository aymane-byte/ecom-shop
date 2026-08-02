<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (!Schema::hasColumn('product_images', 'variant_value_id')) {
                $table->foreignId('variant_value_id')->nullable()->constrained('variant_values')->onDelete('cascade')->after('product_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            if (Schema::hasColumn('product_images', 'variant_value_id')) {
                $table->dropForeign(['variant_value_id']);
                $table->dropColumn('variant_value_id');
            }
        });
    }
};
