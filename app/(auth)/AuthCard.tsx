import Logo from "../components/Logo";

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-4 max-w-md sm:mt-10">
      <div className="card relative overflow-hidden p-7 sm:p-9">
        <span className="absolute -right-4 -top-4 animate-float text-6xl opacity-80">🌼</span>
        <span className="absolute -bottom-3 -left-3 text-5xl opacity-60">🌿</span>
        <div className="relative">
          <Logo size="lg" />
          <h1 className="mt-6 text-3xl font-bold">{title}</h1>
          <p className="mb-6 text-leaf-900/60">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
