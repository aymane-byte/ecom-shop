<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(10),
            'price' => $this->faker->randomFloat(2, 10, 500), // Prix entre 10 et 500
            'stock' => $this->faker->numberBetween(1, 50),     // Stock entre 1 et 50
        ];
    }
}
