const Table = ({
  columns, data, onRowClick, loading = false,
  emptyTitle = 'No data found', emptyDescription = '', emptyIcon: EmptyIcon,
  className = '',
}) => (
  <div className={`bg-white rounded-xl border border-neutral-100 overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50">
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  {EmptyIcon && (
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                      <EmptyIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-neutral-700">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs">{emptyDescription}</p>
                  )}
                </div>
              </td>
            </tr>
          ) : data.map((row, idx) => (
            <tr key={row._id || row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-primary-50/40 transition-colors' : ''}
              `}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-neutral-700">
                  {col.render ? col.render(row, idx) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export { Table };
export default Table;
