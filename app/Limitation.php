<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Limitation extends Model
{
    //
    protected $fillable = [
        'year', 'month', 'company_id', 'package_id', 'messages_max', 'messages_available'
    ];
}
