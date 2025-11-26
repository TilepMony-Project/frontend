export function WorkflowLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">Loading workflow...</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while fetching workflow data
        </p>
      </div>
    </div>
  );
}
