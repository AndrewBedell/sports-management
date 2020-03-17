<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    //
    public static $SUBSCRIPTION_DEFAULT = 'main';

    protected $fillable = [
        'name', 'owner_id', 'plan_type', 'price_per_yearly',
        'stripe_plan_id', 'period',
        'display_order'
    ];
}
