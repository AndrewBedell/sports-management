<?php

namespace App\Http\Controllers\API;

use App\Organization;
use App\Member;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

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
            'register_no' => 'required',
            'name' => 'required|string|max:255',
            'logo' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:organizations',
            'mobile_phone' => 'required|string|max:255',
            'addressline1' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'readable_id' => 'required|string|max:255',
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
            if (is_null($data['addressline2']))
                $data['addressline2'] = "";
                
            Organization::create(array(
                'parent_id' => $data['parent_id'],
                'register_no' => $data['register_no'],
                'name' => $data['name'],
                'logo' => $data['logo'],
                'email' => $data['email'],
                'mobile_phone' => $data['mobile_phone'],
                'addressline1' => $data['addressline1'],
                'addressline2' => $data['addressline2'],
                'country' => $data['country'],
                'state' => $data['state'],
                'city' => $data['city'],
                'zip_code' => $data['zip_code'],
                'readable_id' => $data['readable_id'],
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

            $validator = Validator::make($data, [
                'register_no' => 'required',
                'name' => 'required|string|max:255',
                'logo' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'mobile_phone' => 'required|string|max:255',
                'addressline1' => 'required|string|max:255',
                'country' => 'required|string|max:255',
                'state' => 'required|string|max:255',
                'city' => 'required|string|max:255',
                'zip_code' => 'required|string|max:255',
                'readable_id' => 'required|string|max:255',
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
                $exist = Organization::where('email', $data['email'])->where('id', '!=', $id)->get();

                if (sizeof($exist) == 0) {
                    if (is_null($data['addressline2']))
                        $data['addressline2'] = "";
                        
                    Organization::where('id', $id)->update($data);

                    return response()->json([
                        'status' => 'success'
                    ], 200);
                } else {
                    return response()->json(
                        [
                            'status' => 'error',
                            'message' => 'Email already exist.'
                        ],
                        406
                    );
                }
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
        $chidren = $this->findChildren($parent_id, '');

        $orgs = array($own);
        $orgs = array_merge($orgs, $chidren);

        $orgIDs = array();

        foreach ($orgs as $org) {
            array_push($orgIDs, $org->id);
        }

        return in_array($id, $orgIDs);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function list()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $parent_id = $member->organization_id;

        $own = Organization::find($parent_id);
        $own->label = $own->name;

        $chidren = $this->findChildren($parent_id, '');

        $orgs = array();

        if ($own->parent_id != 0) {
            $orgs[0] = $own;
            
        }

        $orgs = array_merge($orgs, $chidren);

        return response()->json($orgs);
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
        $type = $request->input('type');
        $org = $request->input('org');
        $name = $request->input('name');
        $weight = $request->input('weight');
        $dan = $request->input('dan');

        // $parent_id = ($org == '') ? 1 : $org;

        // $own = Organization::find($parent_id);
        // $chidren = $this->findChildren($parent_id, '');

        // $orgs = array($own);
        // $orgs = array_merge($orgs, $chidren);

        // $orgIDs = array();

        // foreach ($orgs as $org) {
        //     if ($type == 'org') {
        //         array_push($orgIDs, $org->id);
        //     } else {
        //         if ($org->is_club)
        //             array_push($orgIDs, $org->id);
        //     }
        // }

        // $result = array();

        // switch ($type) {
        //     case 'org':
        //     case 'club':
        //         $result = Organization::whereIn('id', $orgIDs)
        //                             ->where('name', 'like', '%' . $name . '%')
        //                             ->get();
        //         break;
        //     case 'player':
        //         $result = Member::whereIn('members.organization_id', $orgIDs)
        //                         ->where(function($query) use ($name){
        //                             $query->where('members.first_name', 'like', '%' . $name. '%');
        //                             $query->orWhere('members.mid_name', 'like', '%' . $name. '%');
        //                             $query->orWhere('members.last_name', 'like', '%' . $name . '%');
        //                         });
                
        //         if ($weight != '')
        //             $result = $result->where('players.weight_id', $weight);

        //         if ($dan != '')
        //             $result = $result->where('players.dan', $dan);

        //         $result = $result->leftJoin('players', 'members.id', '=', 'players.member_id')
        //                         ->leftJoin('weights', 'players.weight_id', '=', 'players.weight_id')
        //                         ->select('members.*', 'weights.name', 'weights.weight', 'players.dan', 'players.skill', 'players.expired_date')
        //                         ->get();
        //         break;
        // }

        return response()->json($result);
    }
}