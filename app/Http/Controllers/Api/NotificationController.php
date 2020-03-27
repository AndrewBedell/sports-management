<?php

namespace App\Http\Controllers\Api;

use App\Member;
use App\Organization;
use App\Notification;
use App\Competition;
use App\CompetitionMembers;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    public function index()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $org_id = $member->organization_id;

        $notifications = Notification::leftJoin('organizations', 'organizations.id', '=', 'notifications.from')
                            ->where('notifications.to', $org_id)
                            ->select('notifications.*', 'organizations.name_o')
                            ->orderBy('notifications.created_at', 'desc')
                            ->get();

        return response()->json([
            'status' => 200,
            'data' => $notifications
        ]);
    }

    public function show($id)
    {
        $notification = Notification::find($id);

        Notification::where('id', $id)->update(['status' => 1]);

        $notification = Notification::leftJoin('organizations', 'organizations.id', '=', 'notifications.from')
                            ->where('notifications.id', $id)
                            ->select('notifications.*', 'organizations.name_o')
                            ->get();

        return response()->json([
            'status' => 200,
            'data' => $notification[0]
        ]);
    }
    
    public function unread()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $org_id = $member->organization_id;

        $org = Organization::find($org_id);

        $unread = Notification::where('to', $org_id)
                        ->where('status', 0)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'status' => 200,
            'data' => $unread
        ]);
    }
}
