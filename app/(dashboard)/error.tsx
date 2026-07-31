'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-6">
      <h2 className="text-lg font-semibold text-red-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-800">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-red-900 px-3 py-1.5 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}
