<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    public static $SETUP_PLAN = '/setup/plan';
    public static $SETUP_PROFILE = '/setup/profile';
    public static $SETUP_MEMBERS = '/setup/members';
    public static $SETUP_FINAL = '/';
    //
    protected $fillable = [
        'name', 'owner_id', 'setup'
    ];

    public function package()
    {
        return $this->hasOne('App\Package');
    }

    public function packages()
    {
        return $this->hasMany('App\Package');
    }

    public function owner()
    {
        return $this->belongsTo('App\User');
    }

    public function forward()
    {
        if ($this->setup === self::$SETUP_PLAN) {
            $this->setup = self::$SETUP_PROFILE;
            $this->save();
        } elseif ($this->setup === self::$SETUP_PROFILE) {
            $this->step = self::$SETUP_MEMBERS;
            $this->save();
        } elseif ($this->step === self::$SETUP_MEMBERS) {
            $this->step = self::$SETUP_FINAL;
            $this->save();
        }
    }
}
