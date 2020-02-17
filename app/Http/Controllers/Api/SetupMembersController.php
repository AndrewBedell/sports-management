<?php
namespace App\Http\Controllers\Api;

use App\User;
use App\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use JWTAuth;

class SetupMembersController extends Controller
{
    public function store(Request $request)
    {
        $user = auth()->user();
        $company = $user->company;

        $usersData = $request->all();

        foreach ($usersData as $userData) {
            $validator = Validator::make(
                $userData,
                [
                    'email' => 'required|string|email|unique:users',
                    'name' => 'required',
                ]
            );
            if ($validator->validated()) {
                $userData['role'] = User::$ROLE_SUBSCRIBER;
                $password = Str::random(6);
                $userData['password'] = Hash::make($password);
                $userData['company_id'] = $company->id;
                User::create($userData);
            }
        }

        $company->setup = Company::$SETUP_FINAL;
        $company->save();

        $user = User::with(['company.package', 'company.owner'])->find($user->id);
        return response()->json(
            [
                'status' => 'success',
                'data' => [
                    'token' => JWTAuth::fromUser($user),
                    'user' => $user
                ]
            ],
            200
        );
    }
}
