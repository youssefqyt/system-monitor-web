"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function PageHeader({
  title,
  description,
  onRefresh,
  loading,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <span
            className={`inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      )}
    </div>
  );
}
