<?php

namespace App\Http\Controllers\API;

use App\Transaction;
use App\Member;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;

class PayController extends Controller
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
      $data = $request->all();
      $player_list = $request->input('players');
      $players = implode(',', $player_list);
      $price_data = array();
      if ($data['pay_method'] === 'basic_card') {
        $price_data = $request->input('price_data');
      } else if ($data['pay_method'] === 'payme') {
        $price_data = $request->input('payme_data');
      }

      Transaction::create(array(
        'club_id' => $data['club_id'],
        'payer_id' => $data['payer_id'],
        'players' => $players,
        'amount' => $data['amount'],
        'price' => 1.99,
        'percent' => 1.0
      ));

      foreach ($player_list as $player) {
          Member::where('id', $player)->update(array(
            'active' => 2
        ));
      }

      return response()->json([
        'status' => 'success'
      ], 200);
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
}
