import {
  RiCollapseDiagonal2Line,
  RiExpandDiagonal2Line,
} from "@remixicon/react";
import React from "react";

interface ExpandableProps {
  expanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  style: React.CSSProperties;
}

const Expandable: React.FC<ExpandableProps> = ({
  expanded,
  onExpandChange,
  style,
}) => {
  const toggleExpand = () => {
    onExpandChange(!expanded);
  };
  const sizeClass = "w-8 h-8";
  return (
    <div
      className="bottom-1 absolute right-0 bg-white"
      style={style}
      data-no-dnd="true"
    >
      {!expanded ? (
        <RiExpandDiagonal2Line className={sizeClass} onClick={toggleExpand} />
      ) : (
        <RiCollapseDiagonal2Line className={sizeClass} onClick={toggleExpand} />
      )}
    </div>
  );
};

export default Expandable;
