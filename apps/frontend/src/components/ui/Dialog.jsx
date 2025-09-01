
// Reusable Dialog Component
const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

Dialog.Content = ({ children }) => {
  return <>{children}</>;
};

Dialog.Header = ({ children }) => {
  return <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
};

Dialog.Title = ({ children }) => {
  return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;
};

Dialog.Description = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

Dialog.Footer = ({ children }) => {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">{children}</div>;
};

export default Dialog;
