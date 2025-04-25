import React from "react";

interface ReusableTableProps {
  headers: string[];
  rows: (string | number)[][];
  emptyMessage?: string;
  onRowClick?: (row: (string | number)[], rowIdx: number) => void;
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  headers,
  rows,
  emptyMessage = "No data available",
  onRowClick,
}) => {
  return (
    <div className="w-full bg-[#0C1117] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={header}
                  className="text-[#2c476a] text-sm px-4 py-3 border-b border-[#111923] text-left bg-[#0C1117]"
                  style={{ minWidth: `${100 / headers.length}%` }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="text-center text-[var(--color-foreground)] text-sm px-4 py-6"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`hover:bg-[#10151d] transition-colors${onRowClick ? ' cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row, rowIdx) : undefined}
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-[var(--color-foreground)] text-sm border-b border-[#111923]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReusableTable;
