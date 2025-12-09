const SkeletonCard = () => (
  <div className="rounded-2xl border animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 w-1/3 rounded" />
      <div className="h-4 bg-gray-200 w-2/3 rounded" />
      <div className="h-3 bg-gray-200 w-1/2 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
