<?php

namespace App\Http\Controllers\Api;
use JWTAuth;
use App\User;
use App\Member;
use App\Setting;
use App\Organization;
use App\Transaction;
use App\Plan;

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
      
      $club = Organization::find($data['club_id']);
      $org = Organization::find($club->parent_id);
      $nf = Organization::find($org->parent_id);

      $settings = Setting::where('organization_id', $nf->id)->get();
      $amount = $request->input('amount');
      $amount1 = 0;
      $amount2 = 0;
      if (sizeOf($settings) > 0) {
        $setting = $settings[0];
        if ($setting['percent']) {
          $amount1 = $amount * ((100 - $setting['percent']) / 100);
          $amount2 = $amount * ($setting['percent'] / 100);
        } else {
          $amount1 = $amount;
          $amount2 = $amount;
        }
      } else {
        return response()->json(
          [
              'status' => 'error',
              'message' => 'Please setting per price.'
          ],
          406
        );
      }

      $plans = Plan::where('price_per_yearly', $setting['price'])->get();

      if ($data['pay_method'] === 'basic_card') {
        $user = auth()->user();
        $card_info = $request->input('card_info');
        $token = $card_info['id'];
        $user->newSubscription(Plan::$SUBSCRIPTION_DEFAULT, $plans[0]->stripe_plan_id)->quantity(sizeOf($player_list))->create($token);

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
      } else if ($data['pay_method'] === 'payme') {
        
        // Transaction::create(array(
        //   'club_id' => $data['club_id'],
        //   'payer_id' => $data['payer_id'],
        //   'players' => $players,
        //   'amount' => $data['amount'],
        //   'price' => $setting['price'],
        //   'percent' => $setting['percent']
        // ));

        // foreach ($player_list as $player) {
        //     Member::where('id', $player)->update(array(
        //       'active' => 2
        //   ));
        // }
        return response()->json([
          'status' => 'error',
          'message' => 'Paid Failed! Please check your payme again.'
        ], 406);
      }
      return response()->json([
        'status' => 'success',
        'message' => 'Paid Successfully! Please wait a message.'
      ], 200);
    }

    public function cost($id)
    {
      $myOrg = Organization::find($id);

      $nf = array();
      
      if ($myOrg->is_club == 1) {
        $org = Organization::find($myOrg->parent_id);
        $nf = Organization::find($org->parent_id);
      } else {
        if ($myOrg->parent_id == 0)
          $nf = $myOrg;
        else
          $nf = Organization::find($myOrg->parent_id);
      }

      $data = Setting::where('organization_id', $nf->id)->select('price')->get();

      $cost = 0.00;
      if (sizeof($data) > 0)
        $cost = $data[0]['price'];

      return response()->json($cost);
    }
}