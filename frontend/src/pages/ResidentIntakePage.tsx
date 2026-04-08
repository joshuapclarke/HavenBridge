import { ResidentIntakeForm } from '../components/ResidentIntakeForm';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import usePageTitle from '../hooks/usePageTitle';

export const ResidentIntakePage = () => {
  usePageTitle('New Resident Intake');
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Resident Intake</h1>
          <p className="text-gray-500 mt-2 text-base">Register a new resident into the HavenBridge case management system.</p>
        </div>
        <Link
          to="/cases"
          className="flex items-center gap-2 text-sm font-medium text-haven-600 hover:text-haven-700 transition-colors shrink-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Cases
        </Link>
      </div>
      <ResidentIntakeForm />
    </div>
  );
};
