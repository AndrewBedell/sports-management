<?php

namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Setting;
use App\Organization;
use App\Transaction;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use DB;

class TransactionController extends Controller
{
    public function finance()
    {
      $nfs = array();
      $clubs = array();

      $data = array();
      $detail = array();
      $total = array();
      $subtotal = array();

      $nfs = Organization::where('parent_id', 0)->get();

      for ($i = 0; $i < sizeof($nfs); $i++) {
        $clubs[$i] = array();

        $orgs = Organization::where('parent_id', $nfs[$i]->id)->get();

        foreach ($orgs as $org) {
          $club = Organization::where('parent_id', $org->id)->get();

          foreach ($club as $c) {
            array_push($clubs[$i], $c->id);
          }
        }

        $detail[$i] = Transaction::whereIn('club_id', $clubs[$i])
                     ->leftJoin('organizations AS org1', 'org1.id', '=', 'transactions.club_id')
                     ->leftJoin('organizations AS org2', 'org2.id', '=', 'org1.parent_id')
                     ->leftJoin('members', 'members.id', '=', 'transactions.payer_id')
                     ->where('transactions.created_at', 'like', date('Y') . '%')
                     ->select('transactions.*', 'org2.name_o AS Reg', 'org1.name_o AS Club',
                              'members.name', 'members.surname')
                     ->orderBy('transactions.created_at', 'desc')
                     ->get();

        $data[$i] = Transaction::whereIn('club_id', $clubs[$i])
                     ->where('created_at', 'like', date('Y') . '%')
                     ->select('club_id', DB::raw('DATE_FORMAT(created_at, "%Y-%m") new_date'), DB::raw('sum(amount) as amount'))
                     ->groupBy('club_id', 'new_date')
                     ->get();

        $subtotal[$i] = Transaction::whereIn('club_id', $clubs[$i])
                     ->where('created_at', 'like', date('Y') . '%')
                     ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") new_date'), DB::raw('sum(amount) as amount'))
                     ->groupBy('new_date')
                     ->get();
      }

      for ($i = 0; $i < sizeof($clubs); $i++) {
        $sum = Transaction::whereIn('club_id', $clubs[$i])
                    ->where('created_at', 'like', date('Y') . '%')
                    ->select(DB::raw('sum(amount) as amount'))
                    ->groupBy('club_id')
                    ->get();

        $total[$i] = 0;
        foreach ($sum as $value) {
          $total[$i] += round($value->amount * 100);
        }
      }

      return response()->json([
        'status' => 'success',
        'total' => $total,
        'subtotal' => $subtotal,
        'detail' => $detail,
        'data' => $data,
        'nfs' => $nfs
      ], 200);
    }

    public function detail($id)
    {
      $trans = Transaction::find($id);
      $players = $trans->players;

      $players = explode(',', $players);

      $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                  ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                  ->whereIn('members.id', $players)
                  ->select('members.*', 'weights.weight', 'players.dan')
                  ->get();

      return response()->json([
        'status' => 'success',
        'members' => $members
      ]);
    }

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

      
      
      $club = Organization::find($data['club_id']);
      $org = Organization::find($club->parent_id);
      $nf = Organization::find($org->parent_id);

      $settings = Setting::where('organization_id', $nf->id)->get();

      if (sizeOf($settings) > 0) {
        $setting = $settings[0];
      } else {
        return response()->json(
          [
              'status' => 'error',
              'message' => 'Please setting per price.'
          ],
          406
        );
      }

      Transaction::create(array(
        'club_id' => $data['club_id'],
        'payer_id' => $data['payer_id'],
        'players' => $players,
        'amount' => $data['amount'],
        'price' => $setting['price'],
        'percent' => $setting['percent']
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

    public function cost($id)
    {
      $club = Organization::find($id);
      $org = Organization::find($club->parent_id);
      $nf = Organization::find($org->parent_id);

      $data = Setting::where('organization_id', $nf->id)->select('price')->get();

      $cost = 0.00;
      if (sizeof($data) > 0)
        $cost = $data[0]['price'];

      return response()->json($cost);
    }
}