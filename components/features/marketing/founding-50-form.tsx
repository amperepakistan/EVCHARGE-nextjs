'use client';

import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { cn } from '@/lib/utils/cn';

const MAX_PHOTOS = 5;
const CONTACT_EMAIL = 'amperepakistan@gmail.com';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const PACKAGE_OPTIONS = [
  { value: 'standard', label: 'Home Standard', price: 'Rs. 1,000/mo' },
  { value: 'plus', label: 'Home Plus', price: 'Rs. 1,500/mo' },
] as const;

/**
 * Posts to an endpoint that doesn't exist yet — see FOUNDING_50_FORM.md at
 * the repo root. Until it's built this always lands on `status === 'error'`,
 * which is deliberate: it surfaces the email fallback instead of pretending
 * the submission was saved anywhere.
 */
export function Founding50Form() {
  const [packageChoice, setPackageChoice] = useState<(typeof PACKAGE_OPTIONS)[number]['value']>(
    'standard',
  );
  const [wifiReaches, setWifiReaches] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const photosInputId = useId();

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const formData = new FormData(event.currentTarget);
    formData.set('packageChoice', packageChoice);
    formData.set('wifiReaches', String(wifiReaches));
    photos.forEach((file) => formData.append('photos', file));

    try {
      const response = await fetch('/api/v1/founding-50', { method: 'POST', body: formData });
      setStatus(response.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-card bg-surface-muted p-8 text-center">
        <h3 className="font-heading text-text-primary text-xl font-bold">You&apos;re in.</h3>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">
          We&apos;ve got your details. We&apos;ll check whether your charger can be integrated and
          reach out to schedule a site visit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="fullName" required autoComplete="name" />
        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="03xx xxxxxxx"
        />
        <TextField label="Email (optional)" name="email" type="email" autoComplete="email" />
        <TextField
          label="City"
          name="city"
          required
          placeholder="e.g. Karachi"
          autoComplete="address-level2"
        />
      </div>

      <label className="block text-sm">
        <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
          Full address
        </span>
        <textarea
          name="address"
          required
          rows={2}
          placeholder="Where the charger is installed"
          className="rounded-button border-border bg-surface text-text-primary placeholder:text-text-secondary/70 focus:border-primary-dark focus:ring-primary-light w-full resize-none border px-4 py-3.5 text-sm outline-none transition-colors duration-150 focus:ring-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Charger brand" name="chargerBrand" required placeholder="e.g. ABB" />
        <TextField
          label="Charger model"
          name="chargerModel"
          required
          placeholder="e.g. Terra AC"
        />
      </div>

      <TextField
        label="Connector type / power rating (if you know it)"
        name="connectorPower"
        placeholder="e.g. Type 2, 7kW"
      />

      <fieldset>
        <legend className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
          Which plan do you want?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKAGE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'rounded-button cursor-pointer border px-4 py-3.5 text-sm font-semibold transition-colors',
                packageChoice === option.value
                  ? 'border-primary-dark bg-primary-light text-on-primary'
                  : 'border-border bg-surface text-text-primary hover:bg-surface-muted',
              )}
            >
              <input
                type="radio"
                name="packageChoiceInput"
                value={option.value}
                checked={packageChoice === option.value}
                onChange={() => setPackageChoice(option.value)}
                className="sr-only"
              />
              {option.label} — {option.price}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
          Photos of your charger
        </span>
        <label
          htmlFor={photosInputId}
          className="rounded-button border-border bg-surface text-text-secondary hover:bg-surface-muted flex cursor-pointer items-center gap-2 border border-dashed px-4 py-3.5 text-sm transition-colors"
        >
          <Upload className="size-4" />
          {photos.length > 0
            ? `${photos.length} photo${photos.length > 1 ? 's' : ''} selected`
            : 'Choose up to 5 photos'}
        </label>
        <input
          id={photosInputId}
          type="file"
          accept="image/*"
          multiple
          required
          onChange={handlePhotoChange}
          className="sr-only"
        />
        <p className="text-text-secondary mt-1.5 text-xs">
          Wide shots of the unit and its nameplate/rating label help us confirm compatibility
          faster.
        </p>
      </div>

      <label className="border-border rounded-button flex items-start gap-3 border p-4 text-sm">
        <input
          type="checkbox"
          checked={wifiReaches}
          onChange={(event) => setWifiReaches(event.target.checked)}
          className="border-border mt-0.5 size-4 rounded"
        />
        <span>
          <span className="text-text-primary font-semibold">
            My home WiFi reaches the charger.
          </span>
          <span className="text-text-secondary block">
            Not sure? Leave this unchecked — we&apos;ll check signal strength during the site
            visit.
          </span>
        </span>
      </label>

      <label className="block text-sm">
        <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
          Anything else? (optional)
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Preferred visit times, access instructions, anything we should know"
          className="rounded-button border-border bg-surface text-text-primary placeholder:text-text-secondary/70 focus:border-primary-dark focus:ring-primary-light w-full resize-none border px-4 py-3.5 text-sm outline-none transition-colors duration-150 focus:ring-2"
        />
      </label>

      <p className="text-text-secondary text-xs leading-relaxed">
        Submitting this is a request for an audit, not a confirmed connection — not every charger
        model can be integrated. We&apos;ll confirm compatibility with your specific unit before
        anything is scheduled or charged.
      </p>

      {status === 'error' ? (
        <p className="text-error text-sm">
          Something went wrong submitting this. Email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
            {CONTACT_EMAIL}
          </a>{' '}
          with the same details and we&apos;ll take it from there.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Claim your Founding 50 spot'
        )}
      </Button>
    </form>
  );
}
