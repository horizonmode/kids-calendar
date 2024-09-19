import { Template } from "@/types/Items";
import { useOptimistic } from "react";

const useOptimisticTemplates = (source: Template[]) => {
  const [templates, setTemplates] = useOptimistic<
    Template[],
    {
      item: Template;
      action: "delete" | "update" | "add";
    }
  >(source, (previousState, { item, action }) =>
    action === "delete"
      ? previousState.filter((d) => d.id !== item.id)
      : [
          ...previousState.filter((d) => d.id !== item.id),
          {
            ...item,
            status: "pending",
          },
        ]
  );

  return { templates, setTemplates };
};

export default useOptimisticTemplates;
