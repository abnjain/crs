


// Reusable Table Component
const Table = ({ children }) => {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
};

Table.Header = ({ children }) => {
  return (
    <thead className="[&_tr]:border-b">
      {children}
    </thead>
  );
};

Table.Body = ({ children }) => {
  return (
    <tbody className="[&_tr:last-child]:border-0">
      {children}
    </tbody>
  );
};

Table.Row = ({ children }) => {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      {children}
    </tr>
  );
};

Table.Head = ({ children, className = '' }) => {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}>
      {children}
    </th>
  );
};

Table.Cell = ({ children, className = '' }) => {
  return (
    <td className={`p-4 align-middle ${className}`}>
      {children}
    </td>
  );
};

export default Table;