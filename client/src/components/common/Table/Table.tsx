import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
}

export function Table<T extends Record<string, unknown>>({ columns, data, className = '' }: TableProps<T>) {
  return (
    <div className={`table-wrap ${className}`}>
      <table className="table" role="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => {
                const value = row[col.key as keyof T];
                const cellContent = col.render ? col.render(row) : (value as ReactNode);
                return <td key={String(col.key)}>{cellContent}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
