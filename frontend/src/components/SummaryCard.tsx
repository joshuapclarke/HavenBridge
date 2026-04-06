import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  accent?: string;
}

export default function SummaryCard({ title, value, icon, accent = 'border-haven-500' }: Props) {
  return (
    <div className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${accent} shadow-sm hover:shadow-md p-6 flex items-center gap-5 transition-all hover:-translate-y-0.5`}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-haven-600 group-hover:bg-haven-50 transition-colors shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
