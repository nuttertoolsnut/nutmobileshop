import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const amount = formData.get('amount');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const apiKey = process.env.SLIPOK_API_KEY;
    const branchId = process.env.SLIPOK_BRANCH_ID || 'default'; // Some implementations use branch ID in URL

    if (!apiKey) {
       // For development/demo purposes, if no API key is set, we might want to mock success or fail.
       // But for now, let's return an error to prompt the user to set it.
       return NextResponse.json({ success: false, message: 'Server configuration error: Missing SlipOK API Key' }, { status: 500 });
    }

    // Convert file to buffer for upstream request
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Construct upstream FormData
    const upstreamFormData = new FormData();
    // 'files' is the key expected by SlipOK (check docs if 'file' or 'files')
    // Usually it accepts 'files'
    upstreamFormData.append('files', new Blob([buffer]), file.name);
    if (amount) {
        upstreamFormData.append('amount', amount.toString());
    }
    upstreamFormData.append('log', 'true'); // Enable logging in SlipOK dashboard

    // SlipOK Endpoint
    // Note: Ensure this is the correct endpoint. 
    // If branch_id is required in URL: https://api.slipok.com/api/line/apikey/{branch_id}
    const slipOkUrl = `https://api.slipok.com/api/line/apikey/${branchId}`;

    const response = await fetch(slipOkUrl, {
        method: 'POST',
        headers: {
            'x-authorization': apiKey
        },
        body: upstreamFormData
    });

    const data = await response.json();

    if (response.ok && data.success) {
        return NextResponse.json({ success: true, data: data.data });
    } else {
        console.error('SlipOK Error:', data);
        return NextResponse.json({ success: false, message: data.message || 'Verification failed' });
    }

  } catch (error: unknown) {
    console.error('Slip verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
