'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { GET_APP_QR, SITE_URL } from '@/lib/app-links';
import { StoreBadges } from '@/components/ui/store-badges';

/**
 * "Scan to download" dialog behind the header's Get the app button.
 *
 * The QR is a static pre-generated SVG (see lib/app-links.ts) rather than
 * something encoded at runtime — the payload never changes per visitor, so a
 * client-side encoder would be a dependency bought for nothing.
 */
export function GetAppModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Whatever had focus before the dialog opened, so it can be handed back.
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);

    // Scroll lock. Restoring the previous value rather than clearing it keeps
    // this from stomping on a lock some other component already set.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="get-app-title"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />

      <div className="rounded-sheet bg-surface relative w-full max-w-md p-8 shadow-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-text-secondary hover:bg-surface-muted hover:text-text-primary rounded-button absolute top-4 right-4 flex size-9 items-center justify-center transition-colors"
        >
          <X className="size-5" />
        </button>

        <h2
          id="get-app-title"
          className="font-heading text-text-primary text-2xl font-bold tracking-tight"
        >
          Get the Ampere app
        </h2>
        <p className="text-text-secondary mt-2 text-sm leading-relaxed">
          Point your phone&apos;s camera at the code to open Ampere on your device.
        </p>

        {/* White, matching the QR bitmap's own quiet zone — a tinted panel here
            frames the code in a visible box instead of letting it sit flat on
            the sheet. */}
        <div className="rounded-image bg-surface mt-6 flex items-center justify-center p-5">
          <Image
            src={GET_APP_QR}
            alt={`QR code linking to ${SITE_URL}`}
            width={200}
            height={200}
            unoptimized
            className="size-44"
          />
        </div>

        <p className="text-text-secondary mt-6 text-xs font-semibold tracking-wide uppercase">
          Or download directly
        </p>
        <StoreBadges height="h-11" className="mt-3" />
      </div>
    </div>
  );
}
