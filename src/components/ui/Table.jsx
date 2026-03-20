const Table = ({ children, className = "" }) => (
    <div
        className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}
    >
        <table className="w-full text-sm text-left">{children}</table>
    </div>
);

const TableHeader = ({ children, className = "" }) => (
    <thead
        className={`bg-gray-50 text-gray-600 uppercase text-xs tracking-wider ${className}`}
    >
        {children}
    </thead>
);

const TableBody = ({ children, className = "" }) => (
    <tbody className={`divide-y divide-gray-200 ${className}`}>
        {children}
    </tbody>
);

const TableRow = ({ children, className = "", onClick }) => (
    <tr
        onClick={onClick}
        className={`hover:bg-gray-50 transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
        {children}
    </tr>
);

const TableHead = ({ children, className = "" }) => (
    <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>
);

const TableCell = ({ children, className = "" }) => (
    <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
