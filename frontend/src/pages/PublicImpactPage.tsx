import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { ImpactOverview, PublicImpactSnapshot } from '../types/models';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

function formatSnapshotDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function PublicImpactPage() {
  const [overview, setOverview] = useState<ImpactOverview | null>(null);
  const [snapshots, setSnapshots] = useState<PublicImpactSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.impact.overview(), api.impact.snapshots()])
      .then(([o, s]) => {
        setOverview(o as ImpactOverview);
        setSnapshots(s as PublicImpactSnapshot[]);
      })
      .catch(() => {
        setOverview(null);
        setSnapshots([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-haven-50 to-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-haven-50 via-white to-gray-50">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-haven-100/60">
        <div className="absolute inset-0 bg-gradient-to-br from-haven-600/5 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 text-sm font-medium text-haven-700 hover:text-haven-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-haven-500 focus-visible:ring-offset-2 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Our Impact
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600 leading-relaxed text-base">
            Aggregated, anonymized numbers and published updates from HavenBridge.
            Individual children are never identified here.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {!overview && (
          <p
            className="mb-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 px-5 py-4 text-sm"
            role="status"
          >
            Summary numbers are temporarily unavailable. Published updates below may still load.
          </p>
        )}
        {overview && (
          <section className="mb-16" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              Summary statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SummaryCard
                title="Residents served (active)"
                value={overview.totalResidents}
                icon={<UserGroupIcon className="h-7 w-7" />}
                accent="border-haven-500"
              />
              <SummaryCard
                title="Counseling sessions (total)"
                value={overview.totalSessions.toLocaleString()}
                icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />}
                accent="border-haven-600"
              />
              <SummaryCard
                title="Active safehouses"
                value={overview.activeSafehouses}
                icon={<BuildingOfficeIcon className="h-7 w-7" />}
                accent="border-haven-700"
              />
              <SummaryCard
                title="Total donations"
                value={`$${overview.totalDonations.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                icon={<CurrencyDollarIcon className="h-7 w-7" />}
                accent="border-emerald-500"
              />
            </div>
          </section>
        )}

        <section aria-labelledby="snapshots-heading">
          <h2 id="snapshots-heading" className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Published impact updates
          </h2>
          <p className="text-gray-600 text-sm mb-10 max-w-2xl leading-relaxed">
            Periodic snapshots our team shares with the public. All figures respect privacy and
            combine data across programs.
          </p>

          {snapshots.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
              No published impact stories yet. Please check back soon.
            </p>
          ) : (
            <ul className="space-y-6 list-none p-0 m-0">
              {snapshots.map((snap) => (
                <li key={snap.snapshotId}>
                  <article className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                      <CalendarDaysIcon className="h-4 w-4 text-haven-500 shrink-0" aria-hidden />
                      <time dateTime={snap.snapshotDate}>
                        {formatSnapshotDate(snap.snapshotDate)}
                      </time>
                    </div>
                    {snap.headline ? (
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {snap.headline}
                      </h3>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-700">Impact update</h3>
                    )}
                    {snap.summaryText && (
                      <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line">
                        {snap.summaryText}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700">HavenBridge</p>
      </footer>
    </div>
  );
}
