<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Facades\Twilio;

class MessageRequestController extends Controller
{
    public function quick(Request $request)
    {
        //
        $data = $request->all();
        $validator = Validator::make($data, [
            'name' => 'required',
            'mobile' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'fail',
                'data' => $validator->errors()
            ], 422);
        };

        $sent = Twilio::send($data);
        if ($sent) {
            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully.'
            ], 200);
        } else {
            return response()->json([
                'status' => 'fail',
                'message' => 'Unable to send your requests.'
            ], 406);
        }
    }

    public function bulk(Request $request)
    {
        $data = $request->input('data', []);
        foreach ($data as $item) {
            $validator = Validator::make($item, [
                'name' => 'required',
                'mobile' => 'required'
            ]);
    
            if ($validator->fails()) {
                continue;
            };
    
            Twilio::send($item);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully.'
        ], 200);
    }
}
