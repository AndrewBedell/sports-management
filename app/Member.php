<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use SoftDeletes;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'organization_id',
        'role_id',
        'first_name',
        'last_name',
        'profile_image',
        'gender',
        'birthday',
        'email',
        'mobile_phone',
        'addressline1',
        'addressline2',
        'country',
        'state',
        'city',
        'zip_code',
        'position',
        'identity',
        'active',
        'register_date'
    ];
}
