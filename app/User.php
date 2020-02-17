<?php

namespace App;

use Illuminate\Notifications\Notifiable;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Plan;

use Laravel\Cashier\Billable;

class User extends Authenticatable implements JWTSubject
{

    public static $ROLE_OWNER = 'owner';
    public static $ROLE_SUBSCRIBER = 'subscriber';

    use Notifiable;
    use Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'company_id', 'email', 'password', 'mobile', 'photo', 'role'
    ];

    protected $appends = [
        'subscribed'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function company()
    {
        return $this->belongsTo('App\Company');
    }

    public function getSubscribedAttribute()
    {
        return $this->subscribed(Plan::$SUBSCRIPTION_DEFAULT);
    }

    public function meta()
    {
        return $this->hasOne('App\UserMeta', 'user_id');
    }
}
