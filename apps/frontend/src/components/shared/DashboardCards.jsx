import React from "react";
import { Link } from "react-router-dom";

const DashboardCards = ({ modules }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {modules.map((mod) => (
        <Link
          key={mod.title}
          to={mod.path}
          className="p-4 bg-card text-card-foreground rounded shadow hover:shadow-md transition flex flex-col items-center justify-center gap-2"
        >
          <div className="text-4xl">{mod.icon}</div>
          <div className="font-semibold">{mod.title}</div>
        </Link>
      ))}
    </div>
  );
};

export default DashboardCards;
