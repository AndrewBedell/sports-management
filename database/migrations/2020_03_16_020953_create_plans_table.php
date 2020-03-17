<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;


class CreatePlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('plan_type');
            $table->double('price_per_yearly', 10, 2)->default(0.00);
            $table->string('stripe_plan_id');
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        DB::table('plans')->insert([
            [
                'id' => 1,
                'name' => 'Basic',
                'plan_type' => 'basic',
                'price_per_yearly' => 10,
                'stripe_plan_id' => 'basic_sportly',
                'display_order' => 1,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 2,
                'name' => 'Premium',
                'plan_type' => 'premium',
                'price_per_yearly' => 20,
                'stripe_plan_id' => 'premium_sportly',
                'display_order' => 2,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 3,
                'name' => 'Enterprise',
                'plan_type' => 'enterprise',
                'price_per_yearly' => 30,
                'stripe_plan_id' => 'enterprise_sportly',
                'display_order' => 3,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('plans');
    }
}
