import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/auth/request';
import { supabaseServer } from '@/lib/supabase/server';

const PHOTO_BUCKET = 'home-charger-photos';
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per photo

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const fullName = form.get('fullName');
    const phone = form.get('phone');
    const city = form.get('city');
    const address = form.get('address');
    const chargerBrand = form.get('chargerBrand');
    const chargerModel = form.get('chargerModel');
    const packageChoice = form.get('packageChoice');

    if (
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      typeof phone !== 'string' ||
      !phone.trim() ||
      typeof city !== 'string' ||
      !city.trim() ||
      typeof address !== 'string' ||
      !address.trim() ||
      typeof chargerBrand !== 'string' ||
      !chargerBrand.trim() ||
      typeof chargerModel !== 'string' ||
      !chargerModel.trim() ||
      (packageChoice !== 'standard' && packageChoice !== 'plus')
    ) {
      return apiError('Missing or invalid required field', 400);
    }

    const rawPhotos = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

    for (const photo of rawPhotos) {
      if (photo.size > MAX_FILE_SIZE_BYTES) {
        return apiError(`Photo "${photo.name}" exceeds the 10MB size limit`, 400);
      }
    }

    const photos = rawPhotos.slice(0, MAX_PHOTOS);
    const db = supabaseServer();
    const photoPaths: string[] = [];

    for (const photo of photos) {
      const safeFileName = photo.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const path = `${crypto.randomUUID()}-${safeFileName}`;
      const bytes = new Uint8Array(await photo.arrayBuffer());

      const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, bytes, {
        contentType: photo.type || 'application/octet-stream',
      });

      if (error) {
        console.error('[v1/founding-50] Storage upload error:', error);
        return apiError(`Failed to upload photo: ${error.message}`, 500);
      }

      photoPaths.push(path);
    }

    const email = form.get('email');
    const connectorPower = form.get('connectorPower');
    const notes = form.get('notes');

    const { data, error } = await db
      .from('founding_50_submissions')
      .insert({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: typeof email === 'string' && email.trim() ? email.trim() : null,
        city: city.trim(),
        address: address.trim(),
        charger_brand: chargerBrand.trim(),
        charger_model: chargerModel.trim(),
        connector_power: typeof connectorPower === 'string' && connectorPower.trim() ? connectorPower.trim() : null,
        package_choice: packageChoice,
        wifi_reaches_charger: form.get('wifiReaches') === 'true',
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
        photo_paths: photoPaths,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[v1/founding-50] Database insert error:', error);
      return apiError(`Failed to save submission: ${error.message}`, 500);
    }

    return apiOk({ id: data.id });
  } catch (err) {
    console.error('[v1/founding-50] Unexpected error handling submission:', err);
    return apiError('Internal server error', 500);
  }
}
