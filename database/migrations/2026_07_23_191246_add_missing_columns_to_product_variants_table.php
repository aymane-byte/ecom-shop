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
        Schema::table('product_variants', function (Blueprint $table) {
            // Add missing columns only if they don't exist
            if (!Schema::hasColumn('product_variants', 'sku')) {
                $table->string('sku')->nullable()->after('product_id');
            }
            if (!Schema::hasColumn('product_variants', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->after('sku');
            }
            if (!Schema::hasColumn('product_variants', 'discount_price')) {
                $table->decimal('discount_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('product_variants', 'weight')) {
                $table->decimal('weight', 8, 2)->nullable()->after('discount_price');
            }
            if (!Schema::hasColumn('product_variants', 'barcode')) {
                $table->string('barcode')->nullable()->after('weight');
            }
            if (!Schema::hasColumn('product_variants', 'status')) {
                $table->boolean('status')->default(true)->after('barcode');
            }

            // Drop existing 'color' and 'image' columns if they exist and are no longer needed
            // Based on ProductVariant model, these are not directly on the variant itself
            if (Schema::hasColumn('product_variants', 'color')) {
                $table->dropColumn('color');
            }
            if (Schema::hasColumn('product_variants', 'image')) {
                $table->dropColumn('image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Drop the columns added in 'up'
            $table->dropColumn([
                'sku',
                'price',
                'discount_price',
                'weight',
                'barcode',
                'status',
            ]);

            // Re-add 'color' and 'image' if they were dropped and are still needed
            // (assuming they were part of the original schema before this migration)
            // If these were never intended to be on product_variants, you can remove these lines.
            // For now, I'll add them back as placeholders in case they were part of an older schema.
            // You should adjust this based on your actual schema history.
            // $table->string('color')->nullable();
            // $table->string('image')->nullable();
        });
    }
};
