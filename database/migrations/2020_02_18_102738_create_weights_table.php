<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weights', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('name', 20);
            $table->string('weight', 10);
            $table->string('description', 50);
            $table->boolean('gender');
            $table->smallInteger('order');

            $table->timestamps();
            $table->softDeletes();
        });
        DB::table('weights')->insert(
            array(
                'name' => 'All',
                'weight' => 'All',
                'description' => 'All Weights',
                'gender' => 0,
                'order' => 0,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            )
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weights');
    }
}
