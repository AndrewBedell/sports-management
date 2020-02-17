<?php
namespace App\Http\Controllers\Api;

use JWTAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\User;
use App\Company;
use App\Package;

class SetupProfileController extends Controller
{
    public function storeUrl(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'fail',
                'data' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        $package = $user->company->package;
        if ($package === null) {
            $data = $request->only(['url']);
            $data['company_id'] = $user->company->id;
            $package = Package::create($data);
        } else {
            $package->fill($request->only(['url']));
            $package->save();
        }

        $user = User::with('company.package')->find($user->id);
        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => JWTAuth::fromUser($user),
                'user' => $user
            ]
        ], 200);
    }

    public function storeMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message_template' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'fail',
                'data' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        $company = $user->company;
        $package = $company->package;

        if ($package === null) {
            $data = $request->only(['message_template']);
            $data['company_id'] = $company->id;
            $package = Package::create($data);
        } else {
            $package->fill($request->only(['message_template']));
            $package->save();
        }

        $company->setup = Company::$SETUP_MEMBERS;
        $company->save();
        
        $user = User::with('company.package')->find($user->id);
        return response()->json([
            'status' => 'success',
            'data' => [
                'token' => JWTAuth::fromUser($user),
                'user' => $user
            ]
        ], 200);
    }
}
