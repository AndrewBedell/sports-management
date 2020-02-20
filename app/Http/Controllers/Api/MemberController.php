<?php

namespace App\Http\Controllers\API;

use App\User;
use App\Member;
use App\Player;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

use DB;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $role = DB::table('roles')->where('is_player', true)->first();

        $role_id = $role->id;

        $members = Member::where('role_id', '!=', $role_id)->get();

        return response()->json($members);
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

        $validMember = Validator::make($data, [
            'organization_id' => 'required',
            'role_id' => 'required',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'profile_image' => 'required|string|max:255',
            'gender' => 'required|boolean',
            'birthday' => 'required|date',
            'email' => 'required|string|email|max:255|unique:members',
            'mobile_phone' => 'required|string|max:255',
            'addressline1' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'identity' => 'required|string|max:255',
            'active' => 'required|boolean',
            'register_date' => 'required|date'
        ]);

        if ($validMember->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validMember->errors(),
                ],
                422
            );
        }

        $validPlayer = Validator::make($data, [
            'weight_id' => 'required',
            'dan' => 'required|integer',
            'skill' => 'required|string|max:255'
        ]);
        
        $role = DB::table('roles')->where('id', $data['role_id'])->first();

        if ($role->is_player && $validPlayer->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validPlayer->errors(),
                ],
                422
            );
        }

        if (is_null($data['mid_name']))
                $data['mid_name'] = "";

        if (is_null($data['addressline2']))
            $data['addressline2'] = "";

        $member = Member::create(array(
            'organization_id' => $data['organization_id'],
            'role_id' => $data['role_id'],
            'first_name' => $data['first_name'],
            'mid_name' => $data['mid_name'],
            'last_name' => $data['last_name'],
            'profile_image' => $data['profile_image'],
            'gender' => $data['gender'],
            'birthday' => $data['birthday'],
            'email' => $data['email'],
            'mobile_phone' => $data['mobile_phone'],
            'addressline1' => $data['addressline1'],
            'addressline2' => $data['addressline2'],
            'country' => $data['country'],
            'state' => $data['state'],
            'city' => $data['city'],
            'zip_code' => $data['zip_code'],
            'position' => $data['position'],
            'identity' => $data['identity'],
            'active' => $data['active'],
            'register_date' => $data['register_date']
        ));
        
        $member_id = $member->id;

        if ($role->is_player && !$validPlayer->fails()) {
            Player::create(array(
                'member_id' => $member_id,
                'weight_id' => $data['weight_id'],
                'dan' => $data['dan'],
                'skill' => $data['skill']
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
        $member = Member::find($id);

        if (isset($member)) {
            $role = DB::table('roles')->where('id', $member->role_id)->first();

            if ($role->is_player) {
                $member = Member::where('members.id', $id)
                        ->leftJoin('players', 'members.id', '=', 'players.member_id')
                        ->leftJoin('weights', 'players.weight_id', '=', 'players.weight_id')
                        ->select('members.*', 'weights.name', 'weights.weight', 'players.dan', 'players.skill', 'players.expired_date')
                        ->get();
            }

            return response()->json($member);
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Invalid Member ID'
                ],
                406
            );
        }
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
        $user = JWTAuth::parseToken()->authenticate();

        if (isset($user) && $user->is_super) {
            $member = Member::find($id);

            if (isset($member)) {
                $role = DB::table('roles')->where('id', $member->role_id)->first();

                if ($role->is_player) {
                    Player::where('member_id', $id)->delete();
                } else {
                    User::where('member_id', $id)->delete();
                }

                Member::where('id', $id)->delete();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Deleted Successfully'
                ], 200);
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Invalid Member ID'
                    ],
                    406
                );
            }
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Invalid credentials.'
                ],
                406
            );
        }
    }
}
