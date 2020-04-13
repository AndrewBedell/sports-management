<?php

namespace App\Http\Controllers\Api;

use App\Member;
use App\Organization;
use App\Competition;
use App\CompetitionMembers;
use App\Notification;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

use DB;

class CompetitionController extends Controller
{
    public function index()
    {
        $competitions = Competition::where('from', 'like', date('Y') . '-%')
                        ->orderBy('from')
                        ->get();

        return response()->json([
            'status' => 200,
            'competitions' => $competitions
        ]);
    }

    public function all()
    {
        $competitions = Competition::get();

        return response()->json([
            'status' => 200,
            'competitions' => $competitions
        ]);
    }

    public function show($id)
    {
        $competition = Competition::find($id);

        $clubs = CompetitionMembers::where('competition_id', $id)->get();
        $club_ids = sizeof($clubs);

        $regs = array();
        foreach ($clubs as $club) {
            $clubObj = Organization::find($club->club_id);

            if (!in_array($clubObj->parent_id, $regs)) {
                array_push($regs, $clubObj->parent_id);
            }
        }
        $reg_ids = sizeof($regs);

        $competition->reg_ids = $reg_ids;
        $competition->club_ids = $club_ids;

        return response()->json([
            'status' => 200,
            'competition' => $competition
        ]);
    }

    // public function accept($id) {
    //     CompetitionMembers::where('competition_id', $id)->update(['status' => 1]);
        
    //     $result = array();

    //     $competition = Competition::find($id);

    //     $club_ids = explode(',', $competition->club_ids);

    //     $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
    //                         ->whereIn('organizations.id', $club_ids)
    //                         ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
    //                         ->get();

    //     foreach ($clubs as $club) {
    //         $comp = CompetitionMembers::where('competition_id', $id)
    //                         ->where('club_id', $club->id)
    //                         ->get();

    //         $male = 0;
    //         $female = 0;
    //         $officer = 0;
    //         $status = 2;

    //         if (sizeof($comp) > 0) {
    //             $member_ids = explode(',', $comp[0]->member_ids);

    //             $members = Member::whereIn('id', $member_ids)->get();

    //             foreach ($members as $member) {
    //                 if ($member->role_id == 3) {
    //                     if ($member->gender == 1)
    //                         $male++;
    //                     else
    //                         $female++;
    //                 } else {
    //                     $officer++;
    //                 }
    //             }

    //             $status = $comp[0]->status;
    //         }

    //         $club['male'] = $male;
    //         $club['female'] = $female;
    //         $club['officer'] = $officer;
    //         $club['status'] = $status;

    //         array_push($result, $club);
    //     }

    //     return response()->json([
    //         'status' => 200,
    //         'result' => $result
    //     ]);
    // }

    // public function orgs($id) {
    //     $competition = Competition::find($id);

    //     $reg_ids = explode(',', $competition->reg_ids);
    //     $club_ids = explode(',', $competition->club_ids);

    //     $exist = Organization::whereIn('parent_id', $reg_ids)->get();

    //     foreach ($exist as $obj) {
    //         if (!in_array($obj->id, $club_ids)) {
    //             $reg_ids = array_diff($reg_ids, [$obj->parent_id]);
    //         }
    //     }

    //     $regs = array();
    //     $clubs = array();

    //     $creator = Organization::find($competition->creator_id);

    //     if ($creator->parent_id == 0) {
    //         $regs = Organization::whereNotIn('id', $reg_ids)
    //                         ->where('parent_id', $competition->creator_id)
    //                         ->orderBy('name_o')
    //                         ->get();
    //     } else {
    //         if ($creator->is_club == 1) {
    //             $org = Organization::find($creator->parent_id);
    //             $nf = Organization::find($org->parent_id);

    //             $regs = Organization::whereNotIn('id', $reg_ids)
    //                         ->where('parent_id', $nf->id)
    //                         ->orderBy('name_o')
    //                         ->get();
    //         } else {
    //             $regs = Organization::where('id', $creator->id)->get();
    //         }
    //     }

    //     $parents = array();
    //     foreach ($regs as $reg) {
    //         array_push($parents, $reg->id);
    //     }

    //     $clubs = Organization::whereIn('parent_id', $parents)
    //                         ->whereNotIn('id', $club_ids)
    //                         ->orderBy('name_o')
    //                         ->get();

    //     return response()->json([
    //         'status' => 200,
    //         'regs' =>$regs,
    //         'clubs' => $clubs
    //     ]);
    // }

    public function clubs(Request $request)
    {
        $input = $request->all();
        
        if ($input['club_id'] == '' || is_null($input['club_id'])) {
            $comps = CompetitionMembers::where('competition_id', $input['competition_id'])->get();

            $club_ids = array();

            foreach ($comps  as $comp) {
                array_push($club_ids, $comp->club_id);
            }

            $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                                ->whereIn('organizations.id', $club_ids)
                                ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                                ->get();
        } else {
            $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                                ->where('organizations.id', $input['club_id'])
                                ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                                ->get();
        }

        $result = $this->getClubs($input['competition_id'], $clubs);

        return response()->json([
            'status' => 200,
            'result' => $result
        ]);
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

        $validator = Validator::make($data, [
            'creator_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:255',
            'place' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'from' => 'required|string|max:255',
            'to' => 'required|string|max:255',
            'register_from' => 'required|string|max:255',
            'register_to' => 'required|string|max:255',
            'legal_birth_from' => 'required|string|max:255',
            'legal_birth_to' => 'required|string|max:255',
            'gender' => 'required|string|max:255',
            'weights' => 'required|string|max:255'
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
            if ($data['from'] > $data['to']) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'message' => 'Competition period is not valid',
                    ],
                    406
                );
            }

            if ($data['register_from'] > $data['register_to']) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'message' => 'Registration period is not valid',
                    ],
                    406
                );
            }

            if ($data['register_to'] > $data['from']) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'message' => 'Registration period is not valid',
                    ],
                    406
                );
            }

            if ($data['legal_birth_from'] > $data['legal_birth_to']) {
                return response()->json(
                    [
                        'status' => 'fail',
                        'message' => 'Registration period is not valid',
                    ],
                    406
                );
            }

            $competition = Competition::create(array(
                'creator_id' => $data['creator_id'],
                'name' => $data['name'],
                'short_name' => $data['short_name'],
                'place' => $data['place'],
                'type' => $data['type'],
                'from' => $data['from'],
                'to' => $data['to'],
                'register_from' => $data['register_from'],
                'register_to' => $data['register_to'],
                'legal_birth_from' => $data['legal_birth_from'],
                'legal_birth_to' => $data['legal_birth_to'],
                'gender' => $data['gender'],
                'weights' => $data['weights']
            ));

            return response()->json([
                'status' => 'success'
            ], 200);
        }
    }

    public function attend(Request $request)
    {
        $data = $request->all();

        $members = '';

        foreach ($data['members'] as $member) {
            $members .= $member . ',';
        }

        $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
                        ->where('club_id', $data['club_id'])
                        ->get();

        if (sizeof($compMembers) > 0) {
            CompetitionMembers::where('competition_id', $data['competition_id'])
                        ->where('club_id', $data['club_id'])
                        ->update(['member_ids' => $members]);
        } else {
            CompetitionMembers::create(array(
                'competition_id' => $data['competition_id'],
                'club_id' => $data['club_id'],
                'member_ids' => substr($members, 0, strlen($members) - 1),
                'status' => 0
            ));
        }

        $club = Organization::find($data['club_id']);

        // Notification::create(array(
        //     'subject_id' => $competition,
        //     'content' => 'The club "' . $club->name_o . '" sent the request for attending in competition.',
        //     'from' => $data['club_id'],
        //     'to' => $notification->from,
        //     'status' => 0
        // ));

        return response()->json([
            'status' => 'success'
        ], 200);
    }

    // public function addClub(Request $request)
    // {
    //     $data = $request->all();

    //     $competition = Competition::find($data['competition_id']);

    //     $regIDs = explode(',', $competition->reg_ids);

    //     if (in_array($data['reg_id'], $regIDs)) {
    //         $reg_ids = $competition->reg_ids;
    //     } else {
    //         $reg_ids = $data['reg_id'] . ',' . $competition->reg_ids;
    //     }
        
    //     $club_ids = $data['club_id'] . ',' . $competition->club_ids;

    //     $competition = Competition::where('id', $data['competition_id'])
    //                             ->update([
    //                                 'reg_ids' => $reg_ids,
    //                                 'club_ids' => $club_ids
    //                             ]);

    //     $competition = Competition::find($data['competition_id']);

    //     if (!in_array($data['reg_id'], $regIDs)) {
    //         Notification::create(array(
    //             'subject_id' => $competition->id,
    //             'content' => 
    //                 'The competition "' . $competition->name . '" is open from '
    //                 . $competition->from . ' to ' . $competition->to . '.',
    //             'from' => $competition->creator_id,
    //             'to' => $data['reg_id'],
    //             'status' => 0
    //         ));
    //     }

    //     Notification::create(array(
    //         'subject_id' => $competition->id,
    //         'content' => 
    //             'The competition "' . $competition->name . '" is open from '
    //             . $competition->from . ' to ' . $competition->to . '.',
    //         'from' => $competition->creator_id,
    //         'to' => $data['club_id'],
    //         'status' => 0
    //     ));

    //     $reg_ids = explode(',', $reg_ids);
    //     $club_ids = explode(',', $club_ids);

    //     $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
    //                         ->whereIn('organizations.id', $club_ids)
    //                         ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
    //                         ->get();

    //     $result = $this->getClubs($competition->id, $clubs);

    //     $exist = Organization::whereIn('parent_id', $reg_ids)->get();

    //     foreach ($exist as $obj) {
    //         if (!in_array($obj->id, $club_ids)) {
    //             $reg_ids = array_diff($reg_ids, [$obj->parent_id]);
    //         }
    //     }

    //     $regs = array();
    //     $clubs = array();

    //     $creator = Organization::find($competition->creator_id);

    //     if ($creator->parent_id == 0) {
    //         $regs = Organization::whereNotIn('id', $reg_ids)
    //                         ->where('parent_id', $competition->creator_id)
    //                         ->orderBy('name_o')
    //                         ->get();
    //     } else {
    //         if ($creator->is_club == 1) {
    //             $org = Organization::find($creator->parent_id);
    //             $nf = Organization::find($org->parent_id);

    //             $regs = Organization::whereNotIn('id', $reg_ids)
    //                         ->where('parent_id', $nf->id)
    //                         ->orderBy('name_o')
    //                         ->get();
    //         } else {
    //             $regs = Organization::where('id', $creator->id)->get();
    //         }
    //     }

    //     $parents = array();
    //     foreach ($regs as $reg) {
    //         array_push($parents, $reg->id);
    //     }

    //     $clubs = Organization::whereIn('parent_id', $parents)
    //                         ->whereNotIn('id', $club_ids)
    //                         ->orderBy('name_o')
    //                         ->get();

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'The club added successfully.',
    //         'result' => $result,
    //         'regs' => $regs,
    //         'clubs' => $clubs
    //     ], 200);
    // }

    // public function destroyClub(Request $request)
    // {
    //     $data = $request->all();

    //     $competition = Competition::find($data['competition_id']);

    //     $club_ids = explode(',', $competition->club_ids);
    //     $club_ids = array_diff($club_ids, [$data['club_id']]);

    //     $reg_ids = explode(',', $competition->reg_ids);
        
    //     $org = Organization::find($data['club_id']);
    //     $clubs = Organization::where('parent_id', $org->parent_id)
    //                         ->where('id', '!=', $data['club_id'])
    //                         ->get();

    //     $flag = true;

    //     if (sizeof($clubs) > 0) {
    //         foreach ($clubs as $club) {
    //             if (in_array($club->id, $club_ids)) {
    //                 $flag = false;
    //             }
    //         }

    //         if ($flag) {
    //             $reg_ids = array_diff($reg_ids, [$org->parent_id]);
    //         }
    //     } else {
    //         $reg_ids = array_diff($reg_ids, [$org->parent_id]);
    //     }

    //     $udpateClub = '';
    //     foreach ($club_ids as $id) {
    //         $udpateClub .= $id . ',';
    //     }

    //     $udpateReg = '';
    //     foreach ($reg_ids as $id) {
    //         $udpateReg .= $id . ',';
    //     }

    //     $reg_ids = substr($udpateReg, 0, strlen($udpateReg) - 1);
    //     $club_ids = substr($udpateClub, 0, strlen($udpateClub) - 1);

    //     Competition::where('id', $data['competition_id'])
    //                 ->update([
    //                     'reg_ids' => $reg_ids,
    //                     'club_ids' => $club_ids
    //                 ]);

    //     CompetitionMembers::where('competition_id', $data['competition_id'])
    //                     ->where('club_id', $data['club_id'])
    //                     ->delete();

    //     if ($flag) {
    //         Notification::where('subject_id', $data['competition_id'])
    //                     ->where('to', $org->parent_id)
    //                     ->delete();
    //     }

    //     Notification::where('subject_id', $data['competition_id'])
    //                     ->where('to', $data['club_id'])
    //                     ->delete();

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'The club "' . $org->name_o . '" deleted Successfully.'
    //     ], 200);
    // }

    // public function addMembers(Request $request)
    // {
    //     $data = $request->all();

    //     $competition = Competition::find($data['competition_id']);

    //     $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
    //                         ->where('club_id', $data['club_id'])
    //                         ->get();

    //     $members = array();

    //     if (sizeof($compMembers) > 0) {
    //         $mem_ids = explode(',', $compMembers[0]->member_ids);

    //         $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
    //                     ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
    //                     ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
    //                     ->where('members.organization_id', $data['club_id'])
    //                     ->whereNotIn('members.id', $mem_ids)
    //                     ->where('members.active', 1)
    //                     ->select('members.*', 'roles.name as role_name', 'weights.weight', 'players.dan')
    //                     ->orderBy('players.weight_id')
    //                     ->orderBy('members.name')
    //                     ->get();
    //     } else {
    //         $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
    //                     ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
    //                     ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
    //                     ->where('members.organization_id', $data['club_id'])
    //                     ->where('members.active', 1)
    //                     ->select('members.*', 'roles.name as role_name', 'weights.weight', 'players.dan')
    //                     ->orderBy('players.weight_id')
    //                     ->orderBy('members.name')
    //                     ->get();
    //     }

    //     $result = array();

    //     foreach ($members as $member) {
    //         if ($member->role_id == 3) {
    //             $birthday = date_create($member->birthday);
    //             $today = date_create(Date('Y-m-d'));

    //             $diff = date_diff($birthday, $today);

    //             if ($competition->level == 'cadet') {
    //                 if ($diff->y < 18 || ($diff->y == 18 && $diff->m == 0 && $diff->d == 0)) {
    //                     array_push($result, $member);
    //                 }
    //             } else {
    //                 if ($diff->y > 18 || ($diff->y == 18 && ($diff->m > 0 || $diff->d > 0))) {
    //                     array_push($result, $member);
    //                 }
    //             }
    //         } else {
    //             array_push($result, $member);
    //         }    
    //     }
        
    //     return response()->json([
    //         'status' => 200,
    //         'members' => $result
    //     ]);
    // }

    // public function addMember(Request $request)
    // {
    //     $data = $request->all();

    //     $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
    //                         ->where('club_id', $data['club_id'])
    //                         ->get();

    //     $ids = array();

    //     if (sizeof($compMembers) > 0) {
    //         $member_ids = $compMembers[0]->member_ids;
    //         $member_ids .= ',' . $data['member_id'];

    //         CompetitionMembers::where('competition_id', $data['competition_id'])
    //                             ->where('club_id', $data['club_id'])
    //                             ->update(['member_ids' => $member_ids]);

    //         $ids = explode(',', $member_ids);
    //     } else {
    //         CompetitionMembers::create(array(
    //             'competition_id' => $data['competition_id'],
    //             'club_id' => $data['club_id'],
    //             'member_ids' => $data['member_id'],
    //             'status' => 0
    //         ));

    //         $ids[0] = $data['member_id'];
    //     }

    //     $members = Member::leftJoin('players', 'players.member_id', '=', 'members.id')
    //                         ->leftJoin('roles', 'roles.id', '=', 'members.role_id')
    //                         ->leftJoin('weights', 'weights.id', '=', 'players.weight_id')
    //                         ->whereIn('members.id', $ids)
    //                         ->where('members.active', 1)
    //                         ->select('members.*', 'roles.name as role_name', 'weights.weight', 'players.dan')
    //                         ->orderBy('players.weight_id')
    //                         ->orderBy('members.name')
    //                         ->get();

    //     return response()->json([
    //         'status' => 200,
    //         'message' => 'One member added successfully.',
    //         'members' => $members
    //     ]);
    // }

    // public function removeMember(Request $request)
    // {
    //     $data = $request->all();

    //     $compMembers = CompetitionMembers::where('competition_id', $data['competition_id'])
    //                         ->where('club_id', $data['club_id'])
    //                         ->get();

    //     $members = explode(',', $compMembers[0]->member_ids);
    //     $members = array_diff($members, [$data['member_id']]);

    //     $member_ids = '';

    //     foreach ($members as $member) {
    //         $member_ids .= $member . ',';
    //     }

    //     CompetitionMembers::where('competition_id', $data['competition_id'])
    //                     ->where('club_id', $data['club_id'])
    //                     ->update(['member_ids' => substr($member_ids, 0, strlen($member_ids) - 1)]);

    //     return response()->json([
    //         'status' => 200,
    //         'message' => 'One member deleted successfully.'
    //     ]);
    // }

    public function getClubs($competition_id, $clubs)
    {
        $result = array();

        foreach ($clubs as $club) {
            $comp = CompetitionMembers::where('competition_id', $competition_id)
                            ->where('club_id', $club->id)
                            ->get();

            $male = 0;
            $female = 0;
            $officer = 0;
            $status = 2;

            if (sizeof($comp) > 0) {
                $member_ids = explode(',', $comp[0]->member_ids);

                $members = Member::whereIn('id', $member_ids)->get();

                foreach ($members as $member) {
                    if ($member->role_id == 3) {
                        if ($member->gender == 1)
                            $male++;
                        else
                            $female++;
                    } else {
                        $officer++;
                    }
                }

                $status = $comp[0]->status;

                $club['male'] = $male;
                $club['female'] = $female;
                $club['officer'] = $officer;
                $club['status'] = $status;

                array_push($result, $club);
            }
        }

        return $result;
    }
}
