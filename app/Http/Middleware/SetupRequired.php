<?php
namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;

class SetupRequired extends BaseMiddleware
{

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = auth()->user();
        $user->load(['company.package']);
        if (!$user->subscribed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
                'data' => [
                    'redirect_to' => '/setup/plan',
                    'user' => $user
                ]
            ], 403);
        }

        $package = $user->company->package;
        if ($user->company->package) {
            if ($package === null || empty($package->message_template) || empty($package->url)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden',
                    'data' => [
                        'redirect_to' => '/setup/profile',
                        'user' => $user
                    ]
                ], 403);
            }
        }
        return $next($request);
    }
}
