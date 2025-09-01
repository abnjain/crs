import React from 'react';
// Reusable Label Component
const Label = React.forwardRef(({ className = '', size = 'default', ...props }, ref) => {

  const sizeClasses = {
    default: "text-sm font-medium",
    xs: "text-xs font-medium",
    lg: "text-lg font-bold",
    xl: "text-xl font-bold"
  };

  return (
    <label
      className={`leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className} ${sizeClasses[size]}`}
      ref={ref}
      {...props}
    />
  );
});
Label.displayName = "Label";

export default Label;