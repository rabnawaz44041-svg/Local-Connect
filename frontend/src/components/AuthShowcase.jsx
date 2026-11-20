const heroImage =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80";

export default function AuthShowcase({ title, text }) {
  return (
    <section className="relative hidden min-h-full overflow-hidden lg:block">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#083422] via-[#0e8a45]/80 to-[#ef5b2a]/40" />
      <div className="relative flex h-full flex-col justify-end p-12 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">LocalConnect</p>
        <h2 className="mt-3 max-w-md text-4xl font-extrabold leading-tight">{title}</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-white/85">{text}</p>
      </div>
    </section>
  );
}
