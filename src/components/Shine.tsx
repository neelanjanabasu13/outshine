/** The word "Outshine" (or any text) with a light sweep, warm halo and sparkle. */
export function Shine({ children, halo = false, className = "" }: { children: React.ReactNode; halo?: boolean; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {halo && <span aria-hidden className="animate-halo pointer-events-none absolute -inset-x-[0.3em] -inset-y-[0.15em] -z-0 rounded-full bg-grade-c/30 blur-2xl" />}
      <span className="text-shine relative">{children}</span>
      <svg aria-hidden viewBox="0 0 24 24" className="animate-twinkle pointer-events-none absolute -right-[0.35em] -top-[0.2em] h-[0.45em] w-[0.45em] fill-grade-c">
        <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
      </svg>
    </span>
  );
}
