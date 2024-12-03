import { Icon } from "@/components/ui/Icon";
import { Toolbar } from "@/components/ui/Toolbar";
import { Editor, FloatingMenu, useCurrentEditor } from "@tiptap/react";

import useContentItemActions from "./hooks/useContentItemActions";
import { useData } from "./hooks/useData";
import { NodeSelection } from "@tiptap/pm/state";

export type ContentItemMenuProps = {
  editor: Editor;
};

export const ContentItemMenuProvider = () => {
  const { editor } = useCurrentEditor();
  if (!editor) return null;
  return <ContentItemMenu editor={editor} />;
};

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
  const data = useData();
  const actions = useContentItemActions(
    editor,
    data.currentNode,
    data.currentNodePos
  );

  editor.on("selectionUpdate", () => {
    const { $anchor } = editor.state.selection;
    const pos = editor.state.selection.from;
    const node =
      $anchor.node(1) || (editor.state.selection as NodeSelection).node;
    data.handleNodeChange({
      node,
      editor,
      pos,
    });
  });

  return (
    <FloatingMenu
      pluginKey="ContentItemMenu"
      editor={editor}
      tippyOptions={{
        zIndex: 99,
        placement: "left",
      }}
    >
      <Toolbar.Button onClick={actions.handleAdd}>
        <Icon className="text-black" name="Plus" />
      </Toolbar.Button>
    </FloatingMenu>
  );
};
