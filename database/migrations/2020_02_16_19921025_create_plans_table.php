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
            $table->double('price_per_month')->default(0);
            $table->boolean('mobile_app_access')->default(false);
            $table->integer('max_messages')->default(500);
            $table->string('stripe_plan_id');
            $table->enum('period', ['monthly', 'yearly'])->default('monthly');
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        DB::table('plans')->insert([
            [
                'id' => 1,
                'name' => 'Basic',
                'plan_type' => 'basic',
                'price_per_month' => 29,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-basic-monthly',
                'period' => 'monthly',
                'display_order' => 1,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 2,
                'name' => 'Basic',
                'plan_type' => 'basic',
                'price_per_month' => 29,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-basic-yearly',
                'period' => 'yearly',
                'display_order' => 2,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 3,
                'name' => 'Premium',
                'plan_type' => 'premium',
                'price_per_month' => 99,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-premium-monthly',
                'period' => 'monthly',
                'display_order' => 3,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 4,
                'name' => 'Premium',
                'plan_type' => 'premium',
                'price_per_month' => 99,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-premium-yearly',
                'period' => 'yearly',
                'display_order' => 4,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 5,
                'name' => 'Enterprise',
                'plan_type' => 'enterprise',
                'price_per_month' => 199,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-enterprise-monthly',
                'period' => 'monthly',
                'display_order' => 5,
                'created_at' => new \Carbon\Carbon(),
                'updated_at' => new \Carbon\Carbon()
            ],
            [
                'id' => 6,
                'name' => 'Enterprise',
                'plan_type' => 'enterprise',
                'price_per_month' => 199,
                'mobile_app_access' => true,
                'max_messages' => 500,
                'stripe_plan_id' => 'soapbox-enterprise-yearly',
                'period' => 'yearly',
                'display_order' => 6,
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
