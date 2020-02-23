<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

use DB;

class UserController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:6',
            ]
        );

        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validator->errors(),
                ],
                422
            );
        }

        $credentials = $request->only('email', 'password');
        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(
                    [
                        'status' => 'error',
                        'message'=> 'Invalid credentials.'
                    ],
                    406
                );
            }
        } catch (JWTException $e) {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Invalid credentials.'
                ],
                406
            );
        }

        $member = Member::where('email', $request->email)->first();
        $user = User::where('member_id', $member->id)->first();

        if ($member->active) {
            $org = Organization::find($member->organization_id);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'member_info' => $member,
                        'is_super' => $user->is_super,
                        'is_club_member' => $org->is_club
                    ]
                ]
            ], 200);
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Account is inactive.'
                ],
                406
            );
        }
    }

    public function profile()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $member = Member::where('id', $user->member_id)->first();

        return response()->json($member);
    }

    public function update(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $data = $request->all();

        $validMember = Validator::make($data, [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'profile_image' => 'required|string|max:255',
            'gender' => 'required|boolean',
            'birthday' => 'required|date',
            'mobile_phone' => 'required|string|max:255',
            'addressline1' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'identity' => 'required|string|max:255',
        ]);

        if ($validMember->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validMember->errors(),
                ],
                422
            );
        } else {
            Member::where('id', $user->member_id)->update($data);

            $member = Member::where('id', $user->member_id)->first();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'member' => $member
                ]
            ], 200);
        }
    }

    public function invite(Request $request)
    {
        $role = DB::table('roles')->where('is_player', true)->first();

        $role_id = $role->id;

        for ($i = 0; $i < sizeof($request['ids']); $i++) {
            $member = Member::where('id', $request['ids'][$i])->first();

            if ($member->role_id != $role_id && !$member->active) {
                User::create(array(
                    'member_id' => $member->id,
                    'is_super' => $request['is_super'][$i],
                    'password' => Hash::make('password'),
                    'email' => $member->email
                ));

                // $msg = "You are registered as a manager in the system.\r\nPlease confirm the below url.\r\n";
                // $headers = "From: administrator@sports.org";

                // mail($member->email, "Invitation from Sport Organization", $msg, $headers);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Invitation sent successfully.'
        ], 200);
    }
}
