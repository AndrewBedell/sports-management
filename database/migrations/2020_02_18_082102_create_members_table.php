<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('organization_id');
            $table->integer('role_id');

            $table->string('name', 20);
            $table->string('surname', 20);
            $table->string('patronymic', 20)->default("");
            
            $table->string('profile_image', 100);
            $table->boolean('gender');
            $table->date('birthday');
            $table->string('email')->unique();
            $table->string('mobile_phone', 15);

            $table->string('addressline1', 50);
            $table->string('addressline2', 50)->default("");
            $table->string('country', 50);
            $table->string('state', 50);
            $table->string('city', 50);
            $table->string('zip_code', 20);
            
            $table->string('position', 50);
            $table->string('identity', 50)->unique();
            $table->boolean('active');
            $table->date('register_date', 0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('members');
    }
}
