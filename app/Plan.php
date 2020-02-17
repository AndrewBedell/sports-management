<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    //
    public static $SUBSCRIPTION_DEFAULT = 'main';
    public static $PERIOD_YEARLY = 'yearly';
    public static $PERIOD_MONTHLY = 'monthly';

    protected $fillable = [
        'name', 'owner_id', 'plan_type', 'price_per_month',
        'mobile_app_access', 'max_messages',
        'stripe_plan_id', 'period',
        'display_order'
    ];
}
