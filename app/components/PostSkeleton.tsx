export default function PostSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-leaf-100" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-leaf-100" />
          <div className="h-2 w-20 rounded bg-leaf-50" />
        </div>
      </div>
      <div className="mt-4 h-4 w-3/4 rounded bg-leaf-100" />
      <div className="mt-2 h-3 w-full rounded bg-leaf-50" />
      <div className="mt-4 aspect-[4/3] w-full rounded-2xl bg-leaf-50" />
    </div>
  );
}
