<?php

namespace App\Http\Controllers\API;

use App\User;
use App\Member;
use App\Player;
use App\Organization;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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

        $orgIDs = $this->orgIDList();

        $members = Member::where('members.role_id', '!=', $role_id)
                        ->whereIn('members.organization_id', $orgIDs)
                        ->leftJoin('users', 'users.member_id', '=', 'members.id')
                        ->select('members.*', 'users.id AS uid', 'users.deleted_at AS status', 'users.is_super')
                        ->get();

        for ($i = 0; $i < sizeof($members); $i++) {
            if (is_null($members[$i]->status)) {
                if (is_null($members[$i]->is_super)) {
                    $members[$i]['is_admin'] = 0;
                    $members[$i]['is_super'] = 0;
                } else {
                    $members[$i]['is_admin'] = 1;
                }
            } else {
                $members[$i]['is_admin'] = 0;
            }
        }

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
            'gender' => 'required|boolean',
            'birthday' => 'required|date',
            'email' => 'required|string|email|max:255|unique:members',
            'mobile_phone' => 'required|string|max:255',
            'addressline1' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
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
            'dan' => 'required|integer'
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

        $base64_image = $request->input('profile_image');
                    
        if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
            $pos  = strpos($base64_image, ';');
            $type = explode(':', substr($base64_image, 0, $pos))[1];

            if (substr($type, 0, 5) == 'image') {
                $filename = $data['identity'] . '_' . date('Ymd');

                $type = str_replace('image/', '.', $type);

                $image = substr($base64_image, strpos($base64_image, ',') + 1);
                $image = base64_decode($image);
                
                Storage::disk('local')->put($filename . $type, $image);

                $data['profile_image'] = "photos/" . $filename . $type;
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'File type is not image.'
                    ],
                    406
                );
            }
        }

        if (!isset($data['profile_image']) || is_null($data['profile_image']))
            $data['profile_image'] = "";

        if (is_null($data['mid_name']))
            $data['mid_name'] = "";

        if (is_null($data['addressline2']))
            $data['addressline2'] = "";

        if (is_null($data['position']))
            $data['position'] = "";

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
            if (is_null($data['skill']))
                $data['skill'] = "";

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
        $member = Member::where('members.id', $id)
                        ->leftJoin('users', 'users.member_id', '=', 'members.id')
                        ->select('members.*', 'users.id AS uid', 'users.deleted_at AS status', 'users.is_super')
                        ->first();

        if (isset($member)) {
            if ($this->checkPermission($member->organization_id)) {
                $role = DB::table('roles')->where('id', $member->role_id)->first();

                if ($role->is_player) {
                    $member = Member::where('members.id', $id)
                            ->leftJoin('players', 'members.id', '=', 'players.member_id')
                            ->leftJoin('weights', 'players.weight_id', '=', 'players.weight_id')
                            ->select('members.*', 'weights.id AS weight_id', 'weights.name AS weight_name', 'weights.weight',
                                     'players.dan', 'players.skill', 'players.expired_date',
                                     DB::raw("null AS uid, null AS status, 0 AS is_super, 0 AS is_admin"))
                            ->first();
                } else {
                    if (is_null($member->status)) {
                        if (is_null($member->is_super)) {
                            $member['is_super'] = 0;
                            $member['is_admin'] = 0;
                        } else {
                            $member['is_admin'] = 1;
                        }
                    } else {
                        $member['is_admin'] = 0;
                    }
                }

                return response()->json($member);
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Access permission denied.'
                    ],
                    406
                );
            }
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
        $member = Member::find($id);

        if (isset($member)) {
            if ($this->checkPermission($member->organization_id)) {
                $data = $request->all();

                $validMember = Validator::make($data, [
                    'organization_id' => 'required',
                    'role_id' => 'required',
                    'first_name' => 'required|string|max:255',
                    'last_name' => 'required|string|max:255',
                    'gender' => 'required|boolean',
                    'birthday' => 'required|date',
                    'email' => 'required|string|email|max:255',
                    'mobile_phone' => 'required|string|max:255',
                    'addressline1' => 'required|string|max:255',
                    'country' => 'required|string|max:255',
                    'state' => 'required|string|max:255',
                    'city' => 'required|string|max:255',
                    'zip_code' => 'required|string|max:255',
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

                $role = DB::table('roles')->where('id', $data['role_id'])->first();

                if ($role->is_player) {
                    $validPlayer = Validator::make($data, [
                        'weight_id' => 'required',
                        'dan' => 'required|integer'
                    ]);

                    if ($validPlayer->fails()) {
                        return response()->json(
                            [
                                'status' => 'fail',
                                'data' => $validPlayer->errors(),
                            ],
                            422
                        );
                    }
                }

                $exist = Member::where('email', $data['email'])->where('id', '!=', $id)->withTrashed()->count();

                if ($exist == 0) {
                    $current = Member::where('id', $id)->first();

                    if ($current->role_id != $role->id) {
                        if ($role->is_player) {
                            User::where('member_id', $id)->delete();
    
                            $checkDeleted = Player::withTrashed()->where('member_id', $id)->count();
    
                            if ($checkDeleted == 0) {
                                if (is_null($data['skill']))
                                    $data['skill'] = "";
                                
                                Player::create(array(
                                    'member_id' => $id,
                                    'weight_id' => $data['weight_id'],
                                    'dan' => $data['dan'],
                                    'skill' => $data['skill']
                                ));
                            } else {
                                Player::withTrashed()->where('member_id', $id)->restore();
                            }
                        } else {
                            Player::where('member_id', $id)->delete();
                        }
                    }

                    $base64_image = $request->input('profile_image');
                    
                    if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
                        $pos  = strpos($base64_image, ';');
                        $type = explode(':', substr($base64_image, 0, $pos))[1];

                        if (substr($type, 0, 5) == 'image') {
                            $filename = $data['identity'] . '_' . date('Ymd');

                            $type = str_replace('image/', '.', $type);

                            $image = substr($base64_image, strpos($base64_image, ',') + 1);
                            $image = base64_decode($image);
                            
                            Storage::disk('local')->delete(str_replace('photos/', '', $current->profile_image));
                            Storage::disk('local')->put($filename . $type, $image);

                            $data['profile_image'] = "photos/" . $filename . $type;
                        } else {
                            return response()->json(
                                [
                                    'status' => 'error',
                                    'message' => 'File type is not image.'
                                ],
                                406
                            );
                        }
                    }

                    if (!isset($data['profile_image']) || is_null($data['profile_image'])) {
                        $data['profile_image'] = "";
                    }
    
                    if (is_null($data['mid_name']))
                        $data['mid_name'] = "";
    
                    if (is_null($data['addressline2']))
                        $data['addressline2'] = "";
    
                    if (is_null($data['position']))
                        $data['position'] = "";

                    Member::where('id', $id)->update(array(
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
                        'register_date' => $data['register_date']
                    ));
                } else {
                    return response()->json(
                        [
                            'status' => 'error',
                            'message' => 'Email already exist.'
                        ],
                        406
                    );
                }

                $member_id = $member->id;

                if ($role->is_player) {
                    if (is_null($data['skill']))
                        $data['skill'] = "";

                    Player::where('member_id', $member_id)->update(array(
                        'weight_id' => $data['weight_id'],
                        'dan' => $data['dan'],
                        'skill' => $data['skill']
                    ));
                } else {
                    User::where('member_id', $member_id)->update(array(
                        'email' => $data['email']
                    ));
                }

                return response()->json([
                    'status' => 'success',
                    'data' => $data
                ], 200);
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'Access permission denied.'
                    ],
                    406
                );
            }
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $member = Member::find($id);

        if ($this->checkPermission($member->organization_id)) {
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
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Access permission denied.'
                ],
                406
            );
        }
    }

    /**
     * Sub function to get a sub list structure of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    function findChildren($parent_id, $parent_name)
    {
        $child_org = Organization::where('parent_id', $parent_id)->get();

        $orgs = array();

        foreach ($child_org as $child) {
            if ($parent_name == "")
                $parent_name = $child->name;
            else
                $parent_name = $child->name . ", " . $parent_name;

            $child->label = $parent_name;

            array_push($orgs, $child);

            if (!$child->is_club) {
                $orgs = array_merge($orgs, $this->findChildren($child->id, $parent_name));
            }
        }

        return $orgs;
    }

    /**
     * Get Available List of Organization.
     *
     * @return \Illuminate\Http\Response
     */
    public function orgIDList()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $member = Member::find($user->member_id);

        $parent_id = $member->organization_id;

        $own = Organization::find($parent_id);
        $chidren = $this->findChildren($parent_id, '');

        $orgs = array($own);
        $orgs = array_merge($orgs, $chidren);

        $orgIDs = array();

        foreach ($orgs as $org) {
            array_push($orgIDs, $org->id);
        }

        return $orgIDs;
    }

    /**
     * Check Permission to get the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function checkPermission($id)
    {
        $orgIDs = $this->orgIDList();

        return in_array($id, $orgIDs);
    }

    /**
     * Display a list of Member's Role.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function roles()
    {
        $roles = DB::table('roles')->orderBy('order')->get();

        return response()->json($roles);
    }
}