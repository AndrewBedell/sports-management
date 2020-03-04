<?php

namespace App\Http\Controllers\API;

use App\Organization;
use App\Member;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use DB;

class OrganizationController extends Controller
{
    /**
     * Display a tree structure of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $parent_id = $member->organization_id;

        if ($parent_id == 1) $parent_id = 0;
        
        $orgs = array();

        $orgs = $this->findTreeChildren($parent_id);

        return response()->json($orgs);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $data = $request->all();

        if (!isset($data['parent_id'])) {
            $member_id = $user->member_id;
            $member = Member::where('id', $member_id)->first();

            $data['parent_id'] = $member->organization_id;
        }

        $validator = Validator::make($data, [
            'parent_id' => 'required|integer',
            'register_no' => 'required|string|max:255|unique:organizations',
            'name_o' => 'required|string|max:255',
            'name_s' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:organizations',
            'mobile_phone' => 'required|string|max:255',
            'addressline1' => 'required|string|max:255',
            // 'country' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'level' => 'required|integer',
            'is_club' => 'required|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validator->errors(),
                ],
                422
            );
        } else {
            $base64_image = $request->input('logo');
                    
            if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
                $pos  = strpos($base64_image, ';');
                $type = explode(':', substr($base64_image, 0, $pos))[1];

                if (substr($type, 0, 5) == 'image') {
                    $filename = date('Ymd') . '_' . $data['register_no'];

                    $type = str_replace('image/', '.', $type);

                    $image = substr($base64_image, strpos($base64_image, ',') + 1);
                    $image = base64_decode($image);
                    
                    Storage::disk('local')->put($filename . $type, $image);

                    $data['logo'] = "photos/" . $filename . $type;
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
            
            if (!isset($data['logo']) || is_null($data['logo']))
                $data['logo'] = "";

            if (is_null($data['addressline2']))
                $data['addressline2'] = "";
                
            Organization::create(array(
                'parent_id' => $data['parent_id'],
                'register_no' => $data['register_no'],
                'name_o' => $data['name_o'],
                'name_s' => $data['name_s'],
                'logo' => $data['logo'],
                'email' => $data['email'],
                'mobile_phone' => $data['mobile_phone'],
                'addressline1' => $data['addressline1'],
                'addressline2' => $data['addressline2'],
                'country' => 'kz',
                // 'country' => $data['country'],
                'state' => $data['state'],
                'city' => $data['city'],
                'zip_code' => $data['zip_code'],
                'level' => $data['level'],
                'is_club' => $data['is_club']
            ));

            return response()->json([
                'status' => 'success'
            ], 200);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if ($this->checkPermission($id)) {
            $org = Organization::find($id);

            $parent = Organization::find($org['parent_id']);

            $org['parent'] = $parent['name_o'];

            $org['table'] = array();

            if ($org['is_club']) {
                $org['type'] = 'club';

                $players = Member::where('organization_id', $id)
                            ->leftJoin('players', 'players.member_id', '=', 'members.id')
                            ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
                            ->select('members.*', 'weights.weight', 'players.dan')
                            ->get();

                $org['table'] = $players;
            } else {
                $org['type'] = 'org';

                $clubs = Organization::where('parent_id', $id)->get();

                $org['table'] = $clubs;

                $org['president'] = '---';

                $president = Member::where('role_id', '!=',  3)->where('organization_id', $id)->first();

                if ($president && strtolower($president->position) == strtolower('president'))
                    $org['president'] = $president->name . ' ' . $president->surname;

                $org['clubs'] = sizeof($clubs);

                $mplayers = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                                ->where('members.role_id', 3)
                                ->where('members.gender', 1)
                                ->where('organizations.parent_id', $id)
                                ->count();

                $fplayers = Member::leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                                ->where('members.role_id', 3)
                                ->where('members.gender', 0)
                                ->where('organizations.parent_id', $id)
                                ->count();
                
                $org['players'] = $mplayers + $fplayers;
                $org['mplayers'] = $mplayers;
                $org['fplayers'] = $fplayers;
            }

            return response()->json($org);
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Invalid Organization ID'
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
        if ($this->checkPermission($id)) {
            $data = $request->all();

            $data['mobile_phone'] = '';
            $data['zip_code'] = '';

            $validator = Validator::make($data, [
                'register_no' => 'required',
                'name_o' => 'required|string|max:255',
                // 'name_s' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                // 'mobile_phone' => 'required|string|max:255',
                // 'addressline1' => 'required|string|max:255',
                // 'country' => 'required|string|max:255',
                // 'state' => 'required|string|max:255',
                // 'city' => 'required|string|max:255',
                // 'zip_code' => 'required|string|max:255',
                // 'level' => 'required|integer',
                // 'is_club' => 'required|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'data' => $validator->errors(),
                    ],
                    422
                );
            } else {
                $exist1 = Organization::where('email', $data['email'])->where('id', '!=', $id)->withTrashed()->count();
                $exist2 = Organization::where('register_no', $data['register_no'])->where('id', '!=', $id)->withTrashed()->count();

                $errArr = array();
                $exist = 0;

                if ($exist1 > 0) {
                    $errArr['email'] = 'Email already exist.';
                    $exist += $exist1;
                }

                if ($exist2 > 0) {
                    $errArr['register_no'] = 'Register No already exist.';
                    $exist += $exist2;
                }
                
                if ($exist > 0) {
                    return response()->json(
                        [
                            'status' => 'fail',
                            'data' => $errArr
                        ],
                        422
                    );
                }

                $current = Organization::where('id', $id)->first();

                $base64_image = $request->input('logo');
                
                if ($base64_image != '' && preg_match('/^data:image\/(\w+);base64,/', $base64_image)) {
                    $pos  = strpos($base64_image, ';');
                    $type = explode(':', substr($base64_image, 0, $pos))[1];

                    if (substr($type, 0, 5) == 'image') {
                        $filename = date('Ymd') . '_' . $data['register_no'];

                        $type = str_replace('image/', '.', $type);

                        $image = substr($base64_image, strpos($base64_image, ',') + 1);
                        $image = base64_decode($image);
                        
                        Storage::disk('local')->delete(str_replace('photos/', '', $current->logo));
                        Storage::disk('local')->put($filename . $type, $image);

                        $data['logo'] = "photos/" . $filename . $type;
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
                
                if (!isset($data['logo']) || is_null($data['logo']))
                    $data['logo'] = "";

                if (is_null($data['addressline2']))
                    $data['addressline2'] = "";
                    
                Organization::where('id', $id)->update($data);

                return response()->json([
                    'status' => 'success'
                ], 200);
            }
        } else {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Access Permission Denined.'
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
        if ($this->checkPermission($id)) {
            $user = JWTAuth::parseToken()->authenticate();

            if (isset($user) && $user->is_super) {
                $child_org = Organization::where('parent_id', $id)->get();

                if (sizeof($child_org) == 0) {
                    Organization::where('id', $id)->delete();

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Deleted Successfully'
                    ], 200);
                } else {
                    return response()->json(
                        [
                            'status' => 'error',
                            'message' => 'Child Organization exist.'
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
     * Sub function to get a sub tree structure of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    function findTreeChildren($parent_id)
    {
        $child_org = Organization::where('parent_id', $parent_id)->get();

        $orgs = array();

        foreach ($child_org as $child) {
            if (!$child->is_club) {
                $child->sub = $this->findTreeChildren($child->id);
            }

            array_push($orgs, $child);
        }

        return $orgs;
    }

    /**
     * Sub function to get a sub list structure of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    function findChildren($parent_id, $parent_name, $contain_club, $exclude)
    {
        $query = Organization::where('parent_id', $parent_id);
        if ($contain_club == 0) {
            $query = $query->where('is_club', '!=', 1);
        }

        if ($exclude != 0) {
            $query = $query->where('id', '!=', $exclude);
        }

        $child_org = $query->get();

        $orgs = array();

        foreach ($child_org as $child) {
            if ($parent_name == "")
                $parent_name = $child->name_o;
            else
                $parent_name = $child->name_o . ", " . $parent_name;

            $child->label = $parent_name;

            array_push($orgs, $child);

            if (!$child->is_club) {
                $orgs = array_merge($orgs, $this->findChildren($child->id, $parent_name, $contain_club, $exclude));
            }
        }

        return $orgs;
    }

    /**
     * Check Permission to get the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function checkPermission($id)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $member = Member::find($user->member_id);

        $parent_id = $member->organization_id;

        $own = Organization::find($parent_id);
        $children = $this->findChildren($parent_id, '', 1, 0);

        $orgs = array($own);
        $orgs = array_merge($orgs, $children);

        $orgIDs = array();

        foreach ($orgs as $org) {
            array_push($orgIDs, $org->id);
        }

        return in_array($id, $orgIDs);
    }

    /**
     * Display a listing of the clubs.
     *
     * @return \Illuminate\Http\Response
     */
    public function clubs()
    {
        $clubs = Organization::where('is_club', 1)->select('id', 'parent_id', 'name_o')->orderBy('name_o')->get();

        return response()->json($clubs);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function list(Request $request)
    {
        $nf = Organization::where('parent_id', 0)->get();

        $children = Organization::where('parent_id', '!=', 0)->where('is_club', 0)->orderBy('name_o')->get();

        $merged = $nf->merge($children);

        $result = $merged->all();

        return response()->json($result);
    }

    /**
     * Display the child of the resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function child($id)
    {
        if ($this->checkPermission($id)) {
            $orgs = array();

            $childs = Organization::where('parent_id', $id)->get();

            foreach ($childs as $child) {
                $hasChild = Organization::where('parent_id', $child->id)->count();

                $child->children = $hasChild;

                array_push($orgs, $child);
            }

            return response()->json($orgs);
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
     * Display the players of the resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function players($id)
    {
        if ($this->checkPermission($id)) {
            $org = Organization::find($id);

            if ($org->is_club) {
                $role = DB::table('roles')->where('is_player', true)->first();

                $players = Member::where('role_id', $role->id)
                        ->where('organization_id', $org->id)
                        ->leftJoin('players', 'players.member_id', '=', 'members.id')
                        ->leftJoin('weights', 'players.weight_id', '=', 'players.weight_id')
                        ->select('members.*', 'weights.name', 'weights.weight', 'players.dan', 'players.skill', 'players.expired_date')
                        ->get();

                return response()->json($players);
            } else {
                return response()->json(
                    [
                        'status' => 'error',
                        'message' => 'This is not club.'
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
     * Display the search result of the resource.
     *
     * 
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $stype = $request->input('stype');
        $org = $request->input('org');
        $name = $request->input('name');
        $mtype = $request->input('mtype');
        $gender = $request->input('gender');
        $weight = $request->input('weight');
        $dan = $request->input('dan');

        $result = array();

        switch ($stype) {
            case 'org':
                $result = Organization::where('id', '!=', 1)
                                ->where('name_o', 'like', '%' . $name . '%')
                                ->where('is_club', 0)
                                ->get();
                break;
            case 'club':
                $result = Organization::where('name_o', 'like', '%' . $name . '%')
                            ->where('is_club', 1);

                if ($org != '')
                    $result = $result->where('parent_id', $org);
                                
                $result = $result->get();
                break;
            case 'member':
                $result = Member::where('members.id', '!=', 1)
                                ->leftJoin('organizations', 'organizations.id', '=', 'members.organization_id')
                                ->leftJoin('roles', 'roles.id', '=', 'members.role_id');
                
                if ($mtype == 'judoka')
                    $result = $result->leftJoin('players', 'players.member_id', '=', 'members.id')
                                    ->leftJoin('weights', 'weights.id', '=', 'players.weight_id');

                $result = $result->where('roles.description', $mtype);

                if ($org != '') {
                    $clubs = Organization::where('parent_id', $org)->select('id')->get();

                    if ($mtype == 'staff' || $mtype == 'referee')
                        $result = $result->where('members.organization_id', $org);
                    
                    if ($mtype == 'coach' || $mtype == 'judoka')
                        $result = $result->whereIn('members.organization_id', $clubs);
                }

                if ($mtype == 'judoka') {
                    if ($gender == 0 || $gender == 1)
                        $result = $result->where('members.gender', $gender);

                    if ($weight != '')
                        $result = $result->where('players.weight_id', $weight);

                    if ($dan != '')
                        $result = $result->where('players.dan', $dan);

                    $result = $result->select('members.*', 'organizations.name_o', 'weights.weight', 
                                            'players.dan', 'players.skill', 'players.expired_date')
                                ->get();
                } else {
                    $result = $result->select('members.*', 'organizations.name_o', 'roles.name AS role_name')->get();
                }
                
                break;
        }

        return response()->json($result);
    }
}