<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Company;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function authenticate(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:6',
            ]
        );

        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validator->errors(),
                ],
                422
            );
        }

        $credentials = $request->only('email', 'password');
        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(
                    [
                        'status' => 'error',
                        'message'=> 'Invalid credentials.'
                    ],
                    406
                );
            }
        } catch (JWTException $e) {
            return response()->json(
                [
                    'status' => 'error',
                    'message' => 'Invalid credentials.'
                ],
                406
            );
        }

        $user = User::with(['company.package', 'company.owner'])->where('email', $request->input('email'))->first();
        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => $token,
                'user' => $user
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => 'fail',
                    'data' => $validator->errors(),
                ],
                422
            );
        }

        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password')),
        ]);

        try {
            $company_data = ['name' => $request->input('business_name'), 'owner_id' => $user->id];
            $company = Company::create($company_data);
            $user->update(['company_id' => $company->id]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'status' => 'fail',
                    'message' => 'Unable to create user.'
                ],
                406
            );
        }

        $token = JWTAuth::fromUser($user);
        $user = User::with(['company.package', 'company.owner'])->find($user->id);
        return response()->json(
            [
                'status' => 'success',
                'data' => [
                    'token' => $token,
                    'user' => $user
                ]
            ],
            200
        );
    }
}
