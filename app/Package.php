<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'company_id', 'package_type', 'url', 'message_template'
    ];

    public function compnay()
    {
        return $this->belongsTo('App\Company');
    }
}
