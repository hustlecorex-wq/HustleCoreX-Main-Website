/* The page's measure. Every section on the site lines up to this, so
   pulling it out of Home means the footer and the legal pages sit on the
   same grid rather than drifting a few pixels off it. */
export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
