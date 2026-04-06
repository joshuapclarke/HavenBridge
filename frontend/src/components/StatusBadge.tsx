interface Props {
  level: string | undefined | null;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'At-Risk': 'bg-red-100 text-red-800 border-red-200',
  Closed: 'bg-gray-100 text-gray-600 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Pending: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StatusBadge({ level, size = 'sm' }: Props) {
  if (!level) return null;
  const colors = colorMap[level] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colors} ${sizeClasses}`}>
      {level}
    </span>
  );
}
