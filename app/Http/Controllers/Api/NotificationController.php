<?php

namespace App\Http\Controllers\Api;

use App\Member;
use App\Notification;

use JWTAuth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    public function unread()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $member = Member::find($user->member_id);

        $org_id = $member->organization_id;

        $unread = Notification::where('to', $org_id)
                            ->where('status', 0)
                            ->orderBy('created_at', 'desc')
                            ->limit(5)
                            ->get();

        return response()->json([
            'status' => 200,
            'data' => $unread
        ]);
    }
}
