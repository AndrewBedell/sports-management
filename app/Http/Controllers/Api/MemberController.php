<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\User;
use App\Notifications\InvitationNotification;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        //
        $user = auth()->user();
        $users = User::with('meta')->where('company_id', $user->company_id)->get();
        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
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

        $user = auth()->user();
        $data = $request->all();

        $password = Str::random(8);
        $data['password'] = Hash::make($password);
        $data['company_id'] = $user->company_id;
        $data['role'] = User::$ROLE_SUBSCRIBER;
        $user = User::create($data);
        $user = User::find($user->id);
        $user->notify(new InvitationNotification($user, $password));

        return response()->json(
            [
                'status' => 'success',
                'data' => $user
            ],
            200
        );
    }

    public function resend($id)
    {
        //
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
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

        $user = User::findOrFail($id);
        $user->fill($request->all());
        $user->save();
        return response()->json(
            [
                'status' => 'success',
                'data' => $user
            ],
            200
        );
    }

    public function upload(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->fill($request->all());
        $file = $request->file('avatar');
        $photo = Storage::putFile('/', $request->file('avatar'));
        $user->photo = url('/').'/photos/'.$photo;
        $user->save();
        return response()->json([
            'data' => url('/').'/photos/'.$photo
            ],
            200
        );
    }

    public function destroy($id)
    {
        $user = User::find($id);
        $user->delete();
        return response()->json(
            [
                'status' => 'success',
                'data' => $user
            ]
        );
    }
}
