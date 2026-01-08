import { cn } from '../lib/cn';

export function Container({ children, size = 'lg', className }) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1920px]',
  };

  return (
    <div className={cn('mx-auto px-6 lg:px-10 w-full', sizes[size], className)}>
      {children}
    </div>
  );
}
