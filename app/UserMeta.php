<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserMeta extends Model
{
    protected $table = 'user_meta';
    //
    protected $fillable = [
        'user_id', 'requests_sent', 'requests_accepted'
    ];
}
