<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MessageRequest extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'requester_id', 'name', 'mobile'
    ];
}
