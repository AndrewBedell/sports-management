<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLimitationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('limitations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->tinyInteger('year');
            $table->tinyInteger('month');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('package_id');
            $table->integer('messages_max')->default(500);
            $table->integer('messages_available')->default(500);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('limitations');
    }
}
