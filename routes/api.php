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
    Route::post('reg-user', 'UserController@store');

    Route::group(['middleware' => ['jwt.verify']], function () {
        Route::get('search', 'OrganizationController@search');
        Route::get('organizations', 'OrganizationController@index');
        Route::get('organizations-list', 'OrganizationController@list');
        Route::get('organization/{id}', 'OrganizationController@show');
        Route::get('organization-child/{id}', 'OrganizationController@child');
        Route::get('countryclubs/{id}', 'OrganizationController@country_clubs');
        Route::get('reg-clubs-list', 'OrganizationController@regClubList');
        Route::get('clubs-list', 'OrganizationController@clubList');
        Route::get('clubs', 'OrganizationController@clubs');
        Route::get('club-players/{id}', 'OrganizationController@players');
        Route::post('reg-organization', 'OrganizationController@store');
        Route::put('organization/{id}', 'OrganizationController@update');
        Route::delete('organization/{id}', 'OrganizationController@destroy');

        Route::post('members', 'MemberController@index');
        Route::post('competition-members', 'MemberController@competitionClubMember');
        // Route::post('competition-org-members', 'MemberController@competitionOrgMember');
        Route::post('allow-members', 'MemberController@allow');
        Route::post('check-competition', 'MemberController@check');
        Route::get('member/{id}', 'MemberController@show');
        Route::get('roles', 'MemberController@roles');
        Route::post('reg-member', 'MemberController@store');
        Route::put('member/{id}', 'MemberController@update');
        Route::delete('member/{id}', 'MemberController@destroy');

        Route::get('competitions', 'CompetitionController@index');
        Route::get('competition/{id}', 'CompetitionController@show');
        // Route::get('competition-orgs/{id}', 'CompetitionController@orgs');
        Route::post('competition-clubs', 'CompetitionController@clubs');
        // Route::post('competition-add-members', 'CompetitionController@addMembers');
        Route::get('all-competitions', 'CompetitionController@all');
        Route::get('accept-competition/{id}', 'CompetitionController@accept');
        Route::post('reg-competition', 'CompetitionController@store');
        // Route::post('add-club-competition', 'CompetitionController@addClub');
        // Route::post('add-member-competition', 'CompetitionController@addMember');
        Route::post('attend-members', 'CompetitionController@attend');
        // Route::delete('competition-club', 'CompetitionController@destroyClub');
        // Route::delete('competition-member', 'CompetitionController@removeMember');

        Route::get('notifications', 'NotificationController@index');
        Route::get('notification/unread', 'NotificationController@unread');
        Route::get('notification/{id}', 'NotificationController@show');

        Route::get('profile', 'UserController@profile');
        Route::get('setting', 'UserController@setting');
        Route::put('setting/{id}', 'UserController@update');
        Route::get('allsetting', 'UserController@allsetting');
        Route::post('resetpass/{token}', 'UserController@reset');
        Route::get('invite-users', 'UserController@invite');
        Route::get('invite-send', 'UserController@invite_send');
        Route::get('change-super', 'UserController@change_super');
        Route::delete('user/{id}', 'UserController@destroy');

        Route::get('weights', 'PlayerController@weights');
        Route::post('competion-weights', 'PlayerController@comp_weights');

        Route::get('cost/{id}', 'TransactionController@cost');
        Route::post('pay-now', 'TransactionController@store');
        Route::get('finance', 'TransactionController@finance');
        Route::get('transdetail/{id}', 'TransactionController@detail');
        // Route::get('playerdetail/{id}', 'TransactionController@players');

        Route::get('all-nf', 'NationalController@list');
        Route::post('create-nf', 'NationalController@store');
    });
});