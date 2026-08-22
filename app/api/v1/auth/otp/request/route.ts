import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { isAppError } from '@/lib/server/errors';
import { requestOtp } from '@/lib/server/modules/auth/otp.service';

/**
 * POST /api/v1/auth/otp/request
 *
 * Driver app step 1: send a one-time code to a Pakistani mobile number.
 * While OTP delivery is stubbed the code is fixed and echoed back as
 * `data.devCode`; the WhatsApp integration drops that field.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const result = await requestOtp(body);
    return apiOk(result);
  } catch (err) {
    if (isAppError(err)) {
      return apiError(err.message, err.status);
    }
    console.error('[v1/auth/otp/request] unexpected', err);
    return apiError('Unable to send code', 500);
  }
}
