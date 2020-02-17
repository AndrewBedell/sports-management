<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Facades\Twilio;

class PackageController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return response()->json([
            'status' => 'success',
            'data' => $user->company->package
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $data = $request->all();
        $validator = Validator::make($data, [
            'url' => 'required',
            'message_template' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'fail',
                'data' => $validator->errors()
            ], 422);
        }

        $package = $user->company->package;
        $package->fill($data);
        $package->save();
        return response()->json([
            'status' => 'success',
            'message' => 'Package updated successfully.',
            'data' => $package
        ]);
    }
}
