'use client';

import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { CONTACT } from '@/lib/legal/config';
import { cn } from '@/lib/utils/cn';

const MAX_PHOTOS = 5;

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const PACKAGE_OPTIONS = [
  { value: 'standard', label: 'Home Standard', price: 'Rs. 1,000/mo' },
  { value: 'plus', label: 'Home Plus', price: 'Rs. 1,500/mo' },
] as const;

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
      <div className="grid gap-5 sm:grid-cols-2">
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
          className="rounded-xl border-border bg-surface text-text-primary placeholder:text-text-secondary/60 focus:border-primary-600 focus:ring-primary-500/20 w-full resize-none border px-4 py-3 text-sm outline-none transition-all duration-150 focus:ring-2"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
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
        <legend className="text-text-secondary mb-2.5 block text-xs font-semibold tracking-wider uppercase">
          Which plan do you want?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKAGE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                packageChoice === option.value
                  ? 'border-primary-600 bg-primary-500/10 font-bold ring-2 ring-primary-500/30'
                  : 'border-border bg-surface hover:bg-surface-muted',
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
              <div className="flex flex-col">
                <span className="text-text-primary text-sm font-semibold">{option.label}</span>
                <span className="text-text-secondary text-xs">{option.price}</span>
              </div>
              {packageChoice === option.value ? (
                <div className="bg-primary-600 flex size-5 items-center justify-center rounded-full text-white">
                  <Check className="size-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="border-border size-5 rounded-full border" />
              )}
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
          className="rounded-xl border-2 border-dashed border-border bg-surface-muted/40 text-text-secondary hover:border-primary-500 hover:bg-surface-muted flex cursor-pointer items-center justify-center gap-2 p-5 text-sm font-medium transition-all"
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

      <label
        className={cn(
          'rounded-xl border p-4 flex items-start gap-3 text-sm cursor-pointer transition-all',
          wifiReaches ? 'border-primary-600/50 bg-primary-500/5' : 'border-border bg-surface',
        )}
      >
        <input
          type="checkbox"
          checked={wifiReaches}
          onChange={(event) => setWifiReaches(event.target.checked)}
          className="border-border mt-0.5 size-4 rounded accent-primary-600"
        />
        <span>
          <span className="text-text-primary font-semibold block">
            My home WiFi reaches the charger.
          </span>
          <span className="text-text-secondary text-xs mt-0.5 block">
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
          className="rounded-xl border-border bg-surface text-text-primary placeholder:text-text-secondary/60 focus:border-primary-600 focus:ring-primary-500/20 w-full resize-none border px-4 py-3 text-sm outline-none transition-all duration-150 focus:ring-2"
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
          <a href={`mailto:${CONTACT.support}`} className="font-semibold underline">
            {CONTACT.support}
          </a>{' '}
          with the same details and we&apos;ll take it from there.
        </p>
      ) : null}

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          className="w-full sm:w-auto px-8 py-3.5 font-bold shadow-md"
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
      </div>
    </form>
  );
}
