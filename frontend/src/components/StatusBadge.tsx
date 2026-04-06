interface Props {
  level: string | undefined | null;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'At-Risk': 'bg-red-50 text-red-700 border-red-200',
  Closed: 'bg-gray-100 text-gray-600 border-gray-200',
  Transferred: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StatusBadge({ level, size = 'sm' }: Props) {
  if (!level) return null;
  const colors = colorMap[level] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-lg border font-medium ${colors} ${sizeClasses}`}>
      {level}
    </span>
  );
}
