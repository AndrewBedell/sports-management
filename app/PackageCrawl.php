<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PackageCrawl extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'package_id', 'package_type', 'url', 'crawled_at', 'crawling_at'
    ];

    public function compnay()
    {
        return $this->belongsTo('App\Company');
    }
}
