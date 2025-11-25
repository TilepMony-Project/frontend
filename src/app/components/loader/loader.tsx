import { type CSSProperties, memo } from 'react';
import { clsx } from 'clsx';

type LoaderType = {
  isLoading?: boolean;
  isSemiTransparent?: boolean;
};

interface CSSCustomProperties extends CSSProperties {
  '--wb-loader-background-opacity': number;
}

const semiTransparentOpacityVariable: CSSCustomProperties = {
  '--wb-loader-background-opacity': 0.8,
};

export const Loader = memo(({ isLoading, isSemiTransparent }: LoaderType) => {
  const visibilityClassName = isLoading ? 'animate-fade-in' : 'animate-fade-out';
  const setLoaderBackgroundOpacityVariable = isSemiTransparent
    ? semiTransparentOpacityVariable
    : {};

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={clsx(
        'absolute w-full h-full bg-[var(--wb-panel-background-color)] z-[100]',
        visibilityClassName
      )}
      style={setLoaderBackgroundOpacityVariable}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
});
