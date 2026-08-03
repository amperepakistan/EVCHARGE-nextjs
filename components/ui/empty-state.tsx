interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? (
        <div className="bg-surface-muted text-text-secondary rounded-image mb-4 flex size-14 items-center justify-center">
          {icon}
        </div>
      ) : null}
      <p className="text-text-primary text-base font-semibold">{title}</p>
      {message ? (
        <p className="text-text-secondary mt-1.5 max-w-sm text-sm">{message}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
