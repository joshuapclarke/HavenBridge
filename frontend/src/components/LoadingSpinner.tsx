export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-haven-200 border-t-haven-600" />
    </div>
  );
}
