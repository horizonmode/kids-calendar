import React, { ReactNode } from "react";

const NonDay = ({ children }: { children?: ReactNode }) => {
  return (
    <div
      className="hidden md:block bg-white opacity-50 aspect-square relative"
      aria-label="Non-Droppable region"
    >
      {children}
    </div>
  );
};

export default NonDay;
