<?php

namespace App\Http\Controllers\Api;

use App\Member;
use App\Notification;
use App\Competition;

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

        $notifications = Notification::leftJoin('competitions', 'competitions.id', '=', 'notifications.subject_id')
                            ->where('notifications.to', $org_id)
                            ->select('competitions.*', 'notifications.id AS nid', 'notifications.type')
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

        if ($notification->type == 'Invite Competition') {
            $competition = Competition::find($notification->subject_id);

            $competition->notification = $notification->type;

            return response()->json([
                'status' => 200,
                'data' => $competition
            ]);
        }
    }
    
    public function unread()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $org_id = $member->organization_id;

        $unread = Notification::leftJoin('competitions', 'competitions.id', '=', 'notifications.subject_id')
                            ->where('notifications.to', $org_id)
                            ->where('notifications.status', 0)
                            ->select('competitions.*', 'notifications.id AS nid', 'notifications.type')
                            ->orderBy('notifications.created_at', 'desc')
                            ->get();

        return response()->json([
            'status' => 200,
            'data' => $unread
        ]);
    }
}
