<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Member;
use App\Organization;
use App\Invitation;

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

    public function store(Request $request)
    {
        $data = $request->all();

        $exist = Invitation::where('email', $data['email'])->first();

        if ($data['code'] == $exist->vcode) {
            $member = Member::where('email', $data['email'])->first();

            User::create(array(
                'member_id' => $member->id,
                'is_super' => $exist->is_super,
                'password' => Hash::make($data['pass']),
                'email' => $data['email']
            ));

            Member::where('email', $data['email'])->update(['active' => 1]);

            Invitation::where('email', $data['email'])->delete();

            return response()->json([
                'status' => 'success'
            ], 200);
        } else {
            $errArr['code'] = 'Invalid Verification Code.';

            return response()->json(
                [
                    'status' => 'error',
                    'data' => $errArr
                ],
                422
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
    public function update(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $data = $request->all();

        $validMember = Validator::make($data, [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
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

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Member::find($id)->update(array(
            'active' => 0
        ));

        User::where('member_id', $id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Deleted Successfully'
        ], 200);
    }

    public function invite()
    {
        $user = JWTAuth::parseToken()->authenticate();
            
        $role = DB::table('roles')->where('is_player', true)->first();

        $members = Member::where('role_id', '!=', $role->id)
                        ->where('members.id', '!=', $user->member_id)
                        ->where('members.active', 0)
                        ->leftJoin('users', 'users.member_id', '=', 'members.id')
                        ->leftJoin('invitations', 'members.email', '=', 'invitations.email')
                        ->select('members.*', 'users.is_super', 'invitations.created_at AS invited')
                        ->orderBy('members.name')
                        ->get();
                        
        for ($i = 0; $i < sizeof($members); $i++) {
            if (is_null($members[$i]->is_super)) {
                $members[$i]['is_super'] = 0;
            }

            if (is_null($members[$i]->invited))
                $members[$i]->invited = 0;
            else
                $members[$i]->invited = 1;
        }

        $users = Member::where('role_id', '!=', $role->id)
                        ->where('members.id', '!=', $user->member_id)
                        ->where('members.active', 1)
                        ->leftJoin('users', 'users.member_id', '=', 'members.id')
                        ->select('members.*', 'users.id AS user_id', 'users.is_super')
                        ->orderBy('members.name')
                        ->get();

        $result = array(
            'members' => $members,
            'users' => $users
        );

        return response()->json($result);
    }
    
    public function invite_send(Request $request)
    {
        $data = $request->all();

        $token = Hash::make($data['email']);
        
        $msg = "You have an invitation to register as a manager in our system.\r\n";
        $msg .= "Please confirm the below url.\r\n";
        $msg .= url('/invite-accept?token=' . $token);
        
        $headers = "From: administrator@sports.org";

        mail($data['email'], "Invitation from LiveMedia", $msg, $headers);
        
        $exist = Invitation::where('email', $data['email'])->count();
        
        if ($exist == 0) {
            Invitation::create(array(
                'email' => $data['email'],
                'token' => $token,
                'is_super' => $data['is_super'],
                'created_at' => date('Y-m-d H:i:s')
            ));
        } else {
            Invitation::where('email', $data['email'])->update(array(
                'email' => $data['email'],
                'token' => $token,
                'is_super' => $data['is_super'],
                'created_at' => date('Y-m-d H:i:s')
            ));
        }        
        
        return response()->json([
            'status' => 'success',
            'message' => 'Invite sent successfully.'
        ], 200);
    }
    
    public function invite_accept(Request $request)
    {
        $token = $request->input('token');
        
        if (is_null($token) || $token == '') {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Empty token.'
                ],
                406
            );
        } else {
            $exist = Invitation::where('token', $token)->get();

            if (sizeof($exist) == 1) {
                $code = '';

                $characters = '0123456789';
                $charactersLength = strlen($characters);

                for ($j = 0; $j < 6; $j++) {
                    $code .= $characters[rand(0, $charactersLength - 1)];
                }

                $msg = "Please use the below verification code to register now.\r\n";
                $msg .= "Verification Code: " . $code;
                
                $headers = "From: administrator@sports.org";

                mail($exist[0]->email, "Invitation from LiveMedia", $msg, $headers);

                Invitation::where('token', $token)->update(array(
                    'email' => $exist[0]->email,
                    'token' => $token,
                    'is_super' => $exist[0]->is_super,
                    'vcode' => $code,
                    'codesent_at' => date('Y-m-d H:i:s')
                ));

                return response()->json([
                    'status' => 'success',
                    'member' => $exist[0]
                ], 200);
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Invalid token.'
                    ],
                    406
                );
            }
        }
    }

    public function change_super(Request $request)
    {
        $data = $request->all();

        User::where('email', $data['email'])->update(array(
            'is_super' => $data['is_super']
        ));

        return response()->json([
            'status' => 'success',
            'data' => $data['is_super']
        ], 200);
    }
}