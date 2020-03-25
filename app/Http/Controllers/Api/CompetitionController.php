<?php

namespace App\Http\Controllers\Api;

use App\Competition;
use App\Notification;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

use DB;

class CompetitionController extends Controller
{
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
                Competition::create(array(
                    'creator_id' => $data['creator_id'],
                    'type' => $data['type'],
                    'name' => $data['name'],
                    'from' => $data['from'],
                    'to' => $data['to'],
                    'reg_ids' => $data['reg_ids'],
                    'club_ids' => '',
                    'member_ids' => ''
                ));

                $reg_ids = explode(',', $data['reg_ids']);

                foreach ($reg_ids as $id) {
                    Notification::create(array(
                        'type' => 'Invite Competition',
                        'from' => $data['creator_id'],
                        'to' => $id,
                        'status' => 0
                    ));
                }

                return response()->json([
                    'status' => 'success'
                ], 200);
            }
        }
    }
}
