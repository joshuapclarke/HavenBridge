import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { getToken, getUserName, hasRole } from '../services/auth';
import usePageTitle from '../hooks/usePageTitle';
import { useTheme } from '../hooks/useTheme';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop';

export default function LandingPage() {
  usePageTitle('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = !!getToken();
  const username = isLoggedIn ? getUserName() : null;
  const dashboardPath = hasRole('Staff') ? '/dashboard' : '/donor-portal';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ─── Navbar ─── */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className="text-lg font-bold text-white tracking-tight drop-shadow-sm">
              HavenBridge
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/impact"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Our Impact
            </Link>
            <Link
              to="/privacy"
              state={{ from: '/welcome' }}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            {isLoggedIn ? (
              <Link
                to={dashboardPath}
                className="ml-2 inline-flex items-center gap-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
              >
                {username ?? 'My Account'}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="ml-2 inline-flex items-center rounded-lg border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/80 hover:bg-white/15 transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="button"
            className="sm:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 transition-all"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="sm:hidden mt-3 mx-auto max-w-6xl rounded-xl bg-haven-900/80 backdrop-blur-md border border-white/10 px-5 py-4 space-y-1">
            <Link to="/impact" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
              Our Impact
            </Link>
            <Link to="/privacy" state={{ from: '/welcome' }} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors">
              Privacy
            </Link>
            {isLoggedIn ? (
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/15 hover:bg-white/25 text-center mt-2 transition-colors">
                {username ?? 'My Account'} <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  Register
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/15 hover:bg-white/25 text-center mt-2 transition-colors">
                  Sign In
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-all mt-1"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5 shrink-0" /> : <MoonIcon className="h-5 w-5 shrink-0" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-haven-900/60 via-haven-900/40 to-haven-900/70" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 mb-8">
            Safe shelter &middot; Real impact
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Protecting vulnerable
            <br />
            children, together
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/85 leading-relaxed font-light">
            HavenBridge coordinates safe shelter, counseling, and transparent
            stewardship so every child in our care has a path to safety and hope.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-haven-800 shadow-xl hover:bg-haven-50 transition-all hover:shadow-2xl"
            >
              Become a Supporter
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/impact"
              className="inline-flex items-center rounded-xl border-2 border-white/60 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-white hover:bg-white/20 hover:border-white/80 transition-all"
            >
              See Our Impact
            </Link>
          </div>
        </div>

        {/* Soft fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </header>

      {/* ─── Mission Cards ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24" aria-labelledby="mission-heading">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 id="mission-heading" className="text-3xl font-bold text-gray-900">
            Our mission in action
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Tools and practices built for child welfare professionals, donors, and
            communities who demand accountability.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ClipboardDocumentListIcon,
              title: 'Case management',
              text: 'Structured records and workflows help social workers stay focused on children—not paperwork—while meeting compliance and care standards.',
            },
            {
              icon: ShieldCheckIcon,
              title: 'Donor transparency',
              text: 'Supporters see how resources flow to programs and safehouses, building lasting trust through clear, ethical reporting.',
            },
            {
              icon: ChartBarIcon,
              title: 'Measurable impact',
              text: 'Outcomes and service metrics guide decisions so we can prove progress while protecting identities and dignity.',
            },
          ].map((card) => (
            <article
              key={card.title}
              className="group rounded-2xl bg-white border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haven-50 text-haven-600 group-hover:bg-haven-100 transition-colors">
                <card.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="mx-6 mb-20">
        <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-br from-haven-700 to-haven-900 px-8 py-14 sm:px-16 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to make a difference?
          </h2>
          <p className="mt-3 text-haven-200 text-lg max-w-xl mx-auto">
            Whether you're a social worker, donor, or community partner — there's a
            place for you at HavenBridge.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-haven-800 hover:bg-haven-50 transition-colors shadow-md"
            >
              Register as a Donor
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border-2 border-white/50 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            <span className="font-semibold text-gray-900">HavenBridge</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/impact" className="hover:text-gray-900 transition-colors">Our Impact</Link>
            <Link to="/privacy" state={{ from: '/welcome' }} className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            {isLoggedIn ? (
              <Link to={dashboardPath} className="hover:text-gray-900 transition-colors">{username ?? 'My Account'}</Link>
            ) : (
              <>
                <Link to="/register" className="hover:text-gray-900 transition-colors">Register</Link>
                <Link to="/login" className="hover:text-gray-900 transition-colors">Sign In</Link>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} HavenBridge
          </p>
        </div>
      </footer>
    </div>
  );
}
