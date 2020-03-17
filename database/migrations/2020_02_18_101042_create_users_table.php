<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\Hash;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('member_id');

            $table->string('password', 100);
            $table->string('email')->unique();
            $table->string('stripe_id')->nullable()->collation('utf8mb4_bin');
            $table->string('card_brand')->nullable();
            $table->string('card_last_four', 4)->nullable();

            $table->boolean('is_nf');
            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('users')->insert(
            array(
                'member_id' => 0,
                'password' => Hash::make('123456'),
                'email' => 'superadmin@gmail.com',
                'stripe_id' => '',
                'card_brand' => '',
                'card_last_four' => '',
                'is_nf' => 1,
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
        Schema::dropIfExists('users');
    }
}
