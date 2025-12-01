import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slipUrl, amount } = await req.json();

    if (!slipUrl) {
      return NextResponse.json({ success: false, message: 'No slip URL provided' }, { status: 400 });
    }

    const apiKey = process.env.SLIPOK_API_KEY;
    const branchId = process.env.SLIPOK_BRANCH_ID || 'default';

    if (!apiKey) {
       return NextResponse.json({ success: false, message: 'Server configuration error: Missing SlipOK API Key' }, { status: 500 });
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(slipUrl);
    if (!imageResponse.ok) {
        return NextResponse.json({ success: false, message: 'Failed to fetch slip image from URL' }, { status: 400 });
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Construct upstream FormData
    const upstreamFormData = new FormData();
    // Extract filename from URL or use default
    const fileName = slipUrl.split('/').pop() || 'slip.jpg';
    
    upstreamFormData.append('files', new Blob([buffer]), fileName);
    if (amount) {
        upstreamFormData.append('amount', amount.toString());
    }
    upstreamFormData.append('log', 'true');

    // SlipOK Endpoint
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

  } catch (error: any) {
    console.error('Slip re-verification error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
