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
        $user = JWTAuth::parseToken()->authenticate();

        $member = Member::find($user->member_id);

        $competitions = Competition::where('creator_id', $member->organization_id)->get();

        return response()->json([
            'status' => 200,
            'competitions' => $competitions
        ]);
    }

    public function find()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $member = Member::find($user->member_id);

        $notifications = Notification::where('to', $member->organization_id)->get();

        $ids = array();

        foreach ($notifications as $notification) {
            array_push($ids, $notification->subject_id);
        }

        $competitions = Competition::whereIn('id', $ids)->get();

        return response()->json([
            'status' => 200,
            'competitions' => $competitions
        ]);
    }

    public function show($id)
    {
        $competition = Competition::find($id);

        $reg_ids = explode(',', $competition->reg_ids);
        $club_ids = explode(',', $competition->club_ids);

        $competition->reg_ids = sizeof(array_filter($reg_ids));
        $competition->club_ids = sizeof(array_filter($club_ids));

        return response()->json([
            'status' => 200,
            'competition' => $competition
        ]);
    }

    public function accept(Request $request) {
        $data = $request->all();

        CompetitionMembers::where('competition_id', $data['competition_id'])
                    ->where('club_id', $data['club_id'])
                    ->update(['status' => 1]);
        
        $result = array();

        $competition = Competition::find($data['competition_id']);

        $club_ids = explode(',', $competition->club_ids);

        $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                            ->whereIn('organizations.id', $club_ids)
                            ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                            ->get();

        foreach ($clubs as $club) {
            $comp = CompetitionMembers::where('competition_id', $data['competition_id'])
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
            }

            $club['male'] = $male;
            $club['female'] = $female;
            $club['officer'] = $officer;
            $club['status'] = $status;

            array_push($result, $club);
        }

        return response()->json([
            'status' => 200,
            'result' => $result
        ]);
    }

    public function clubs($id)
    {
        $result = array();

        $competition = Competition::find($id);

        $club_ids = explode(',', $competition->club_ids);

        $clubs = Organization::leftJoin('organizations AS org', 'org.id', '=', 'organizations.parent_id')
                            ->whereIn('organizations.id', $club_ids)
                            ->select('organizations.id', 'organizations.name_o AS club_name', 'org.name_o AS reg_name')
                            ->get();

        foreach ($clubs as $club) {
            $comp = CompetitionMembers::where('competition_id', $id)
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
            }

            $club['male'] = $male;
            $club['female'] = $female;
            $club['officer'] = $officer;
            $club['status'] = $status;

            array_push($result, $club);
        }

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
            'type' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'place' => 'required|string|max:255',
            'from' => 'required|string|max:255',
            'to' => 'required|string|max:255',
            'reg_ids' => 'required|string|max:255'
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
            } else {
                $club_ids = '';
                $clubArr = array();

                $reg_ids = explode(',', $data['reg_ids']);

                foreach ($reg_ids as $id) {
                    $clubs = Organization::where('parent_id', $id)->get();

                    foreach ($clubs as $club) {
                        $club_ids .= $club->id . ',';
                        array_push($clubArr, $club->id);
                    }
                }

                $club_ids = substr($club_ids, 0, strlen($club_ids) - 1);

                $competition = Competition::create(array(
                    'creator_id' => $data['creator_id'],
                    'type' => $data['type'],
                    'name' => $data['name'],
                    'place' => $data['place'],
                    'from' => $data['from'],
                    'to' => $data['to'],
                    'reg_ids' => $data['reg_ids'],
                    'club_ids' => $club_ids
                ));

                foreach ($reg_ids as $reg_id) {
                    Notification::create(array(
                        'subject_id' => $competition->id,
                        'content' => 
                            'The competition "' . $data['name'] . '" is open from ' . $data['from'] . ' to ' . $data['to'] . '.',
                        'from' => $data['creator_id'],
                        'to' => $reg_id,
                        'status' => 0
                    ));
                }

                foreach ($clubArr as $club_id) {
                    Notification::create(array(
                        'subject_id' => $competition->id,
                        'content' => 
                            'The competition "' . $data['name'] . '" is open from ' . $data['from'] . ' to ' . $data['to'] . '.',
                        'from' => $data['creator_id'],
                        'to' => $club_id,
                        'status' => 0
                    ));
                }

                return response()->json([
                    'status' => 'success'
                ], 200);
            }
        }
    }

    public function attend(Request $request)
    {
        $data = $request->all();

        $notification = Notification::find($data['notification']);

        $competition = $notification->subject_id;

        $members = '';

        foreach ($data['members'] as $member) {
            $members .= $member . ',';
        }

        $compMembers = CompetitionMembers::where('competition_id', $competition)
                        ->where('club_id', $data['club_id'])
                        ->get();

        if (sizeof($compMembers) > 0) {
            CompetitionMembers::where('competition_id', $competition)
                        ->where('club_id', $data['club_id'])
                        ->update(['member_ids' => $members]);
        } else {
            CompetitionMembers::create(array(
                'competition_id' => $competition,
                'club_id' => $data['club_id'],
                'member_ids' => substr($members, 0, strlen($members) - 1),
                'status' => 0
            ));
        }

        $club = Organization::find($data['club_id']);

        Notification::create(array(
            'subject_id' => $competition,
            'content' => 'The club "' . $club->name_o . '" sent the request for attending in competition.',
            'from' => $data['club_id'],
            'to' => $notification->from,
            'status' => 0
        ));

        return response()->json([
            'status' => 'success'
        ], 200);
    }
}
