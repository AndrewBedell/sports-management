<?php

namespace App\Http\Controllers\API;

use App\User;
use App\Member;
use App\Player;
use App\Organization;
use App\Setting;
use App\Notification;
use App\Competition;
use App\CompetitionMembers;

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
    public function index(Request $request)
    {
        $input = $request->all();
        
        $user_id = $input['user_id'];
        $org_id = $input['org_id'];
        $level = $input['level'];

        $org_ids = array((int)$org_id);

        switch ($level) {
            case 1:
                $orgs = Organization::where('parent_id', $org_id)->get();

                foreach ($orgs as $org) {
                    array_push($org_ids, $org->id);

                    $clubs = Organization::where('parent_id', $org->id)->get();

                    foreach ($clubs as $club) {
                        array_push($org_ids, $club->id);
                    }
                }
                break;
            case 2:
                $clubs = Organization::where('parent_id', $org_id)->get();

                foreach ($clubs as $club) {
                    array_push($org_ids, $club->id);
                }
                break;
            default:
                break;
        }

        $members = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                        ->whereIn('organization_id', $org_ids)
                        ->where('members.id', '!=', $user_id)
                        ->select('members.*', 'organizations.name_o', 'organizations.level', 'roles.name AS role_name')
                        ->orderBy('name')
                        ->orderBy('surname')
                        ->get();

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
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'gender' => 'required|boolean',
            'birthday' => 'required|date',
            'email' => 'required|string|email|max:255|unique:members',
            // 'mobile_phone' => 'required|string|max:255',
            // 'addressline1' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            // 'state' => 'required|string|max:255',
            // 'city' => 'required|string|max:255',
            // 'zip_code' => 'required|string|max:255',
            // 'identity' => 'required|string|max:255|unique:members',
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
            'dan' => 'required'
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

        // if (is_null($data['patronymic']))
        //     $data['patronymic'] = "";

        // if (is_null($data['addressline2']))
        //     $data['addressline2'] = "";

        if (is_null($data['position']))
            $data['position'] = "";

        $identity = '';

        $exist = Member::where('country', $data['country'])->orderBy('id', 'DESC')->first();

        for ($i = 0; $i < 8 - strlen($exist->id); $i++) {
            $identity .= '0';
        }

        $identity .= ($exist->id + 1);

        $member = Member::create(array(
            'organization_id' => $data['organization_id'],
            'role_id' => $data['role_id'],
            'name' => $data['name'],
            'patronymic' => "", //$data['patronymic'],
            'surname' => $data['surname'],
            'profile_image' => $data['profile_image'],
            'gender' => $data['gender'],
            'birthday' => $data['birthday'],
            'email' => $data['email'],
            'mobile_phone' => "", //$data['mobile_phone'],
            'addressline1' => "", //$data['addressline1'],
            'addressline2' => "", //$data['addressline2'],
            'country' => $data['country'],
            'state' => "", //$data['state'],
            'city' => "", //$data['city'],
            'zip_code' => "", //$data['zip_code'],
            'position' => $data['position'],
            'identity' => $identity, //$data['identity'],
            'active' => $data['active'],
            'register_date' => $data['register_date']
        ));
        
        $member_id = $member->id;

        if ($role->is_player && !$validPlayer->fails()) {
            // if (is_null($data['skill']))
            //     $data['skill'] = "";

            Player::create(array(
                'member_id' => $member_id,
                'weight_id' => $data['weight_id'],
                'dan' => $data['dan'],
                // 'skill' => $data['skill']
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
                        ->leftJoin('organizations AS club', 'club.id', '=', 'members.organization_id')
                        ->leftJoin('organizations AS org', 'org.id', '=', 'club.parent_id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                        ->leftJoin('users', 'users.member_id', '=', 'members.id')
                        ->select('members.*', 
                                 'org.name_o AS org_name', 'org.id AS org_id',
                                 'club.name_o AS club_name', 'club.id AS club_id',
                                 'club.level', 'roles.name AS role_name', 'roles.is_player',
                                 'users.id AS uid', 'users.deleted_at AS status')
                        ->first();

        if (isset($member)) {
            $role = DB::table('roles')->find($member->role_id);
            
            if ($role->is_player) {
                $member = Member::where('members.id', $id)
                        ->leftJoin('organizations AS club', 'club.id', '=', 'members.organization_id')
                        ->leftJoin('organizations AS org', 'org.id', '=', 'club.parent_id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                        ->leftJoin('players', 'players.member_id', '=', 'members.id')
                        ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                        ->select('members.*',
                                 'org.name_o AS org_name', 'org.id AS org_id',
                                 'club.name_o AS club_name', 'club.id AS club_id',
                                 'club.level', 'roles.name AS role_name', 'roles.is_player',
                                 'weights.id AS weight_id', 'weights.weight',
                                 'players.dan', 'players.skill', 'players.expired_date',
                                DB::raw("null AS uid, null AS status"))
                        ->first();
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
        $member = Member::find($id);

        if (isset($member)) {
            $data = $request->all();

            $validMember = Validator::make($data, [
                'org_id' => 'required',
                'role_id' => 'required',
                'name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'gender' => 'required|boolean',
                'birthday' => 'required|date',
                'email' => 'required|string|email|max:255',
                // 'mobile_phone' => 'required|string|max:255',
                // 'addressline1' => 'required|string|max:255',
                // 'country' => 'required|string|max:255',
                // 'state' => 'required|string|max:255',
                // 'city' => 'required|string|max:255',
                // 'zip_code' => 'required|string|max:255',
                'identity' => 'required|string|max:255',
                // 'active' => 'required|boolean',
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
                    'dan' => 'required'
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

            $exist1 = Member::where('email', $data['email'])->where('id', '!=', $id)->withTrashed()->count();
            $exist2 = Member::where('identity', $data['identity'])->where('id', '!=', $id)->withTrashed()->count();

            $errArr = array();
            $exist = 0;

            if ($exist1 > 0) {
                $errArr['email'] = 'Email already exist.';
                $exist += $exist1;
            }

            // if ($exist2 > 0) {
            //     $errArr['identity'] = 'Identity No already exist.';
            //     $exist += $exist2;
            // }

            if ($exist > 0) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'data' => $errArr
                    ],
                    422
                );
            }

            $current = Member::where('id', $id)->first();

            if ($current->role_id != $role->id) {
                if ($role->is_player) {
                    User::where('member_id', $id)->delete();

                    $checkDeleted = Player::withTrashed()->where('member_id', $id)->count();

                    if ($checkDeleted == 0) {
                        // if (is_null($data['skill']))
                        //     $data['skill'] = "";
                        
                        Player::create(array(
                            'member_id' => $id,
                            'weight_id' => $data['weight_id'],
                            'dan' => $data['dan'],
                            // 'skill' => $data['skill']
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

            // if (is_null($data['patronymic']))
            //     $data['patronymic'] = "";

            // if (is_null($data['addressline2']))
            //     $data['addressline2'] = "";

            // if (is_null($data['position']))
            //     $data['position'] = "";

            $orgID = '';

            if (($data['role_id'] == 2 || $data['role_id'] == 3) && $data['club_id'] != '')
                $orgID = $data['club_id'];
            else
                $orgID = $data['org_id'];

            Member::where('id', $id)->update(array(
                'organization_id' => $orgID,
                'role_id' => $data['role_id'],
                'name' => $data['name'],
                'patronymic' => "", //$data['patronymic'],
                'surname' => $data['surname'],
                'profile_image' => $data['profile_image'],
                'gender' => $data['gender'],
                'birthday' => $data['birthday'],
                'email' => $data['email'],
                'mobile_phone' => "", //$data['mobile_phone'],
                'addressline1' => "", //$data['addressline1'],
                'addressline2' => "", //$data['addressline2'],
                'country' => 'kz',
                // 'country' => $data['country'],
                'state' => "", //$data['state'],
                'city' => "", //$data['city'],
                'zip_code' => "", //$data['zip_code'],
                'position' => "", //$data['position'],
                'identity' => $data['identity'],
                'register_date' => $data['register_date']
            ));

            $member_id = $member->id;

            if ($role->is_player) {
                // if (is_null($data['skill']))
                //     $data['skill'] = "";

                Player::where('member_id', $member_id)->update(array(
                    'weight_id' => $data['weight_id'],
                    'dan' => $data['dan'],
                    // 'skill' => $data['skill']
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

        $user = JWTAuth::parseToken()->authenticate();

        if (isset($user)) {
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
                $parent_name = $child->name_o;
            else
                $parent_name = $child->name_o . ", " . $parent_name;

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

    public function competitionClubMember(Request $request)
    {
        $data = $request->all();

        $ids = array();

        $competition = CompetitionMembers::where('competition_id', $data['competition_id'])
                        ->where('club_id', $data['club_id'])
                        ->get();

        if (sizeof($competition) > 0)
            $ids = explode(',', $competition[0]->member_ids);

        $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                        ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                        ->whereIn('members.id', $ids)
                        ->where('members.active', 1)
                        ->select('members.*', 'roles.name as role_name', 'weights.weight', 'players.dan')
                        ->orderBy('players.weight_id')
                        ->orderBy('members.surname')
                        ->get();

        return response()->json([
            'status' => 200,
            'data' => $members
        ]);
    }

    // public function competitionOrgMember(Request $request)
    // {
    //     $data = $request->all();

    //     $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
    //                     ->where('club_id', $data['org_id'])
    //                     ->get();

    //     $ids = array();

    //     $arr = explode(',', $compMembers[0]->member_ids);
    //     for ($i = 0; $i < sizeof($arr); $i++) {
    //         array_push($ids, $arr[$i]);
    //     }

    //     $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
    //                     ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
    //                     ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
    //                     ->leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
    //                     ->whereIn('members.id', $ids)
    //                     ->where('members.active', 1)
    //                     ->select('members.*', 'organizations.name_o', 'roles.name as role_name', 'weights.weight', 'players.dan')
    //                     ->orderBy('players.weight_id')
    //                     ->orderBy('members.name')
    //                     ->get();

    //     return response()->json([
    //         'status' => 200,
    //         'data' => $members
    //     ]);
    // }

    public function allow(Request $request)
    {
        $data = $request->all();

        $competition = Competition::find($data['competition_id']);

        $compMember = CompetitionMembers::where('competition_id', $data['competition_id'])
                            ->where('club_id', $data['club_id'])
                            ->get();

        $ids = array();
        if (sizeof($compMember) > 0)
            $ids = explode(',', $compMember[0]->member_ids);
        
        $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
                        ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
                        ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                        ->whereNotIn('members.id', $ids)
                        ->where('organization_id', $data['club_id'])
                        ->where('members.active', 1)
                        ->select('members.*', 'roles.name as role_name', 'weights.weight', 'players.dan')
                        ->orderBy('players.weight_id')
                        ->orderBy('members.name')
                        ->get();

        $result = array();

        foreach ($members as $member) {
            if ($member->role_id == 3) {
                $birthday = date_create($member->birthday);
                $today = date_create(Date('Y-m-d'));

                $diff = date_diff($birthday, $today);

                if ($competition->level == 'cadet') {
                    if ($diff->y < 18 || ($diff->y == 18 && $diff->m == 0 && $diff->d == 0)) {
                        array_push($result, $member);
                    }
                } else {
                    if ($diff->y > 18 || ($diff->y == 18 && ($diff->m > 0 || $diff->d > 0))) {
                        array_push($result, $member);
                    }
                }
            } else {
                array_push($result, $member);
            }    
        }

        return response()->json([
            'status' => 200,
            'data' => $result
        ]);
    }

    public function check(Request $request)
    {
        $data = $request->all();

        $competition = CompetitionMembers::where('competition_id', $data['competition_id'])
                            ->where('club_id', $data['club_id'])
                            ->get();

        $status = 2;

        if (sizeof($competition) > 0)
            $status = $competition[0]->status;

        return response()->json([
            'status' => 200,
            'data' => $status
        ]);
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