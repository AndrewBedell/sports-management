<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::namespace('Api')->group(function () {
    Route::post('login', 'UserController@login');
    Route::post('forgot', 'ForgotPasswordController@forgot');
    Route::post('reset/{token}', 'ForgotPasswordController@reset');
    
    Route::get('invite-accept', 'UserController@invite_accept');
    Route::post('register-user', 'UserController@store');

    Route::group(['middleware' => ['jwt.verify']], function () {
        Route::get('search', 'OrganizationController@search');
        Route::get('organizations', 'OrganizationController@index');
        Route::get('organizations-list', 'OrganizationController@list');
        Route::get('organization/{id}', 'OrganizationController@show');
        Route::get('organization-child/{id}', 'OrganizationController@child');
        Route::get('clubs', 'OrganizationController@clubs');
        Route::get('club-players/{id}', 'OrganizationController@players');
        Route::post('register-organization', 'OrganizationController@store');
        Route::put('organization/{id}', 'OrganizationController@update');
        Route::delete('organization/{id}', 'OrganizationController@destroy');

        Route::get('members', 'MemberController@index');
        Route::get('member/{id}', 'MemberController@show');
        Route::get('roles', 'MemberController@roles');
        Route::post('register-member', 'MemberController@store');
        Route::put('member/{id}', 'MemberController@update');
        Route::delete('member/{id}', 'MemberController@destroy');

        Route::get('profile', 'UserController@profile');
        Route::post('update-profile', 'UserController@update');
        Route::get('invite-users', 'UserController@invite');
        Route::get('invite-send', 'UserController@invite_send');
        Route::get('change-super', 'UserController@change_super');
        Route::delete('user/{id}', 'UserController@destroy');

        Route::get('weights', 'PlayerController@weights');

        Route::get('finance', 'UserController@finance');
    });
});