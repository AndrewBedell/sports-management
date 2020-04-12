<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Competition;

use DB;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Display a list of Player's weight.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function weights()
    {
        $weights = DB::table('weights')->get();

        return response()->json($weights);
    }

    /**
     * Display a list of Competition Player's weight.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function comp_weights(Request $request)
    {
        $input = $request->all();

        $comp = Competition::find($input['competition_id']);

        $ids = explode(',', $comp->weights);

        array_push($ids, 0);
        
        $weights = DB::table('weights')->whereIn('id', $ids)->get();

        return response()->json($weights);
    }
}
