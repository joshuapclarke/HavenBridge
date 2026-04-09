import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { isAuthenticated, hasRole } from '../services/auth';
import usePageTitle from '../hooks/usePageTitle';

const LAST_UPDATED = 'April 6, 2026';

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy');
  const authed = isAuthenticated();
  const location = useLocation();
  const fromState = (location.state as { from?: string })?.from;
  const defaultBack = authed ? (hasRole('Staff') ? '/dashboard' : '/donor-portal') : '/welcome';
  const backTo = fromState ?? defaultBack;
  const backLabel = backTo === '/welcome' ? 'Back to home' : authed ? 'Back to dashboard' : 'Back to home';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {!authed && <PublicNav />}

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-medium text-haven-700 hover:text-haven-900 transition-colors rounded-md mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 sm:px-10 py-10 sm:py-12">
          <header className="mb-10 pb-8 border-b border-gray-100 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-haven-50 text-haven-600 shrink-0">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-gray-500 mt-1.5">Last updated: {LAST_UPDATED}</p>
            </div>
          </header>

          <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p className="text-base leading-relaxed">
                HavenBridge collects only the information necessary to operate our nonprofit safehouse network and
                support vulnerable residents. This may include identifiers and contact details for staff and authorized
                partners, case-related records needed to coordinate care (such as referral context and service notes,
                where permitted by law), donation and financial transaction data, and technical data from our systems
                (for example IP address and device type) when you use our websites or applications. We do not collect
                more sensitive information than our mission requires, and we limit access to those with a legitimate need
                to know.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Information</h2>
              <p className="text-base leading-relaxed">
                We use collected information to provide and improve housing, counseling, and related services; to
                comply with legal and safeguarding obligations; to process donations and issue receipts; to communicate with
                stakeholders about programs and impact (where you have not opted out); and to secure our platforms
                against misuse. Data about residents is used solely for care coordination, reporting as required by
                regulators or funders, and continuous improvement of our services—not for unrelated marketing or
                profiling.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Protection</h2>
              <p className="text-base leading-relaxed">
                We treat information about vulnerable individuals with heightened care. Access is role-based, activity is
                logged where appropriate, and we employ administrative, technical, and organizational measures designed
                to protect against unauthorized access, loss, or alteration. Staff receive training on confidentiality and
                data handling. While no system is perfectly secure, we regularly review our practices and work with
                partners who meet comparable standards when they process data on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
              <p className="text-base leading-relaxed">
                Our sites may use cookies and similar technologies to remember preferences, maintain secure sessions, and
                understand aggregate usage so we can improve accessibility and performance. Essential cookies may be
                required for the service to function. Where non-essential cookies are used, we seek your consent where
                required by law. You can control cookies through your browser settings; disabling some cookies may limit
                certain features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
              <p className="text-base leading-relaxed">
                We may use trusted third parties for hosting, email, analytics, payment processing, or professional
                services. These providers may process data only according to our instructions and applicable agreements,
                and only to the extent needed for their service. We do not sell personal information. If we transfer data
                across borders, we do so with appropriate safeguards as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p className="text-base leading-relaxed">
                Depending on where you live, you may have rights to access, correct, delete, or restrict processing of
                your personal data, to object to certain processing, to data portability, and to withdraw consent where
                processing is consent-based. Residents and families may have additional protections under safeguarding and
                social-services law; we will respond to lawful requests in line with those frameworks. You may also lodge
                a complaint with a supervisory authority where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p className="text-base leading-relaxed">
                For questions about this policy, to exercise your privacy rights, or to report a concern, please contact
                HavenBridge using the contact details published on our main website or provided to you as a resident,
                donor, or partner. We will acknowledge requests within a reasonable time and work with you in good faith
                to resolve issues.
              </p>
            </section>
          </div>

          <p className="mt-12 pt-8 border-t border-gray-100 text-center">
            <Link to={backTo} className="text-haven-600 hover:text-haven-700 font-medium text-sm transition-colors">
              {backLabel}
            </Link>
          </p>
        </article>
      </div>

      {!authed && <PublicFooter />}
    </div>
  );
}
