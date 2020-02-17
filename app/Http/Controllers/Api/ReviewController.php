<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Review;

class ReviewController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    //
    public function index()
    {
        //
        $user = auth()->user();
        $package = $user->company->package;
        $paginate = Review::where('package_id', $package->id)->orderBy('reviewed_at', 'DESC')->paginate(30);
        return response()->json([
            'status' => 'success',
            'data' => $paginate
        ]);
    }
}
