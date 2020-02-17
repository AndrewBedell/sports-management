<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'package_id', 'username', 'photo', 'profile_url', 'reviewed_at', 'score', 'text', 'review_type'
    ];

    public function compnay()
    {
        return $this->belongsTo('App\Company');
    }

    public function package()
    {
        return $this->belongsTo('App\Package');
    }
}
