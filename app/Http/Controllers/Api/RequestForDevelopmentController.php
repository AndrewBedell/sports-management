<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Twilio\Rest\Client;

class RequestForDevelopmentController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    //
    public function submit(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'mobile' => 'required'
        ]);

        $sid = env('TWILIO_SID');
        $token = env('TWILIO_AUTH_TOKEN');
        $phone_number = env('TWILIO_PHONE_NUMBER');
        $client = new Client($sid, $token);

        $name = $request->input('name');
        $mobile = $request->input('mobile');

        // Use the client to do fun stuff like send text messages!
        $client->messages->create(
            // the number you'd like to send the message to
            $mobile,
            array(
                'from' => $phone_number,
                'body' => "Hi {$name}, \nThank you for choosing Sports Management Team. Please leave us a review, it will go a long way coming from you.\nhttp://bit.ly/2TU8rBQ"
            )
        );

        return [
            'success',
            'message' => "Your message has been sent, you may want to check with the patient to see if they received it okay."
        ];
    }
}
