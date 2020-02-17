<?php
namespace App\Http\Controllers\Api;

use JWTAuth;
use App\Plan;
use Illuminate\Http\Request;

class SetupPlanController extends Controller
{
    public function index()
    {
        $plans = Plan::orderBy('display_order')->get();
        return response()->json(
            [
                'status' => 'success',
                'data' => $plans
            ],
            200
        );
    }

    public function subscribe(Request $request, $plan_id)
    {
        $user = auth()->user();
        $plan = Plan::findOrFail($plan_id);
        $token = $request->input('token');

        if (empty($user->hasStripeId())) {
            // $user->createAsStripeCustomer();
        }
        if (!$user->subscribed(Plan::$SUBSCRIPTION_DEFAULT)) {
            $user->newSubscription(Plan::$SUBSCRIPTION_DEFAULT, $plan->stripe_plan_id)->create($token);
        }

        $user = $user->find($user->id);
        if ($user->subscribed(Plan::$SUBSCRIPTION_DEFAULT)) {
            $user->company->forward();
            return response()->json([
                'status' => 'success',
                'data' => [
                    'token' => JWTAuth::fromUser($user),
                    'user' => $user
                ]
            ]);
        } else {
            return response()->json([
                'status' => 'fail'
            ], 406);
        }
    }
}
