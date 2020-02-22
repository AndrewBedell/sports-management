<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('parent_id');

            $table->string('register_no', 50);
            $table->string('name', 50);
            $table->string('logo', 100);            
            $table->string('email')->unique();
            $table->string('mobile_phone', 50);

            $table->string('addressline1', 50);
            $table->string('addressline2', 50)->default("");
            $table->string('country', 50);
            $table->string('state', 50);
            $table->string('city', 50);
            $table->string('zip_code', 20);

            $table->string('readable_id', 20);
            $table->tinyInteger('level');
            $table->boolean('is_club');
            
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('organizations')->insert(
            array(
                'parent_id' => 0,
                'register_no' => '',
                'name' => 'National Federation',
                'logo' => '',
                'email' => 'admin@gmail.com',
                'mobile_phone' => '',
                'addressline1' => '',
                'addressline2' => '',
                'country' => '',
                'state' => '',
                'city' => '',
                'zip_code' => '',
                'readable_id' => '',
                'level' => 1,
                'is_club' => false,
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
        Schema::dropIfExists('organizations');
    }
}
