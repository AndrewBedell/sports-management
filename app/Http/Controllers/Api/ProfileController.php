<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\User;

class ProfileController extends Controller
{
  public function pwd_change(Request $request)
  {
    $user = auth()->user();
    $validator = Validator::make($request->all(), [
      'old_password' => 'required',
      'password' => 'required|string|min:8',
      'confirm_password' => 'required|same:password'
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
    $data = $request->all();
    if (Hash::check($data['old_password'], $user->password)) {
      $user->password = Hash::make($data['password']);
      $user->save();
  
      return response()->json(
        [
          'status' => 'success',
          'message' => 'Password updated successfully.'
        ],
        200
      );
    } else {
      return response()->json(
        [
          'status' => 'fail',
          'message' => 'Old password is incorrect!',
          'data' => $validator->errors()
        ],
        406
      );
    }
  }
}