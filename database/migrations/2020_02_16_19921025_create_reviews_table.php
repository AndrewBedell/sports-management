<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // https://www.google.com/maps/place/?q=place_id:ChIJFRczH9CHUocRpYhLfH_mWLU
        Schema::create('reviews', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('package_id');
            $table->string('name')->nullable();
            $table->string('photo')->nullable();
            $table->string('username')->nullable();
            $table->string('profile_url');
            $table->timestamp('reviewed_at');
            $table->integer('score')->default(0);
            $table->text('text')->nullable();
            $table->string('review_type')->default('google');
            $table->unique(['package_id', 'profile_url']);
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
        Schema::dropIfExists('reviews');
    }
}
