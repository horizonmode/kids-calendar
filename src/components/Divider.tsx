import React from "react";

const Divider = ({
  ghost = false,
  onClick,
}: {
  ghost?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      data-no-dnd={ghost ? "true" : "false"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick && onClick();
      }}
      className={`h-2 bg-black ${
        ghost && "bg-opacity-50 hover:bg-opacity-100"
      }`}
    />
  );
};

export default Divider;
