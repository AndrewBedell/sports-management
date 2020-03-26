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

        $regArr = array();
        $clubArr = array();

        $reg_ids = explode(',', $competition->reg_ids);
        $club_ids = explode(',', $competition->club_ids);

        $regs = Organization::whereIn('id', $reg_ids)->get();

        foreach ($regs as $reg) {
            array_push($regArr, $reg->name_o);

            $clubs = Organization::whereIn('id', $club_ids)
                        ->where('parent_id', $reg->id)
                        ->get();

            $reg_clubs = '';

            foreach ($clubs as $club) {
                $reg_clubs .= $club->name_o . ', ';
            }

            array_push($clubArr, substr($reg_clubs, 0, strlen($reg_clubs) - 2));
        }

        $competition->reg_ids = $regArr;
        $competition->club_ids = $clubArr;

        return response()->json([
            'status' => 200,
            'competition' => $competition
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
                        'type' => 'Invite Competition',
                        'from' => $data['creator_id'],
                        'to' => $reg_id,
                        'status' => 0
                    ));
                }

                foreach ($clubArr as $club_id) {
                    Notification::create(array(
                        'subject_id' => $competition->id,
                        'type' => 'Invite Competition',
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
                'member_ids' => substr($members, 0, strlen($members) - 1)
            ));
        }

        return response()->json([
            'status' => 'success'
        ], 200);
    }
}
