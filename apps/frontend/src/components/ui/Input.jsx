import React from 'react';
// export default function Input({ label, ...props }) {
//   return (
//     <div className="flex flex-col space-y-1">
//       {label && <label className="text-sm font-medium">{label}</label>}
//       <input
//         {...props}
//         className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
//       />
//     </div>
//   );
// }


// Reusable Input Component
const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export default Input;