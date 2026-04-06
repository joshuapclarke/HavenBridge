import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  accent?: string;
}

export default function SummaryCard({ title, value, icon, accent = 'border-haven-500' }: Props) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-5 flex items-center gap-4`}>
      {icon && <div className="text-haven-600 shrink-0">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
