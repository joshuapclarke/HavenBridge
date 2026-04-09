import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="font-semibold text-gray-900 dark:text-white">HavenBridge</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/impact" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Our Impact</Link>
          <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy Policy</Link>
          <Link to="/register" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Register</Link>
          <Link to="/login" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Sign In</Link>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} HavenBridge</p>
      </div>
    </footer>
  );
}
