import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import "../app/globals.css";

import Note from "@/components/Note";
import { useState } from "react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Note",
  component: Note,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    color: { control: "color" },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onUpdateContent: fn() },
} satisfies Meta<typeof Note>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    content: "This is a note",
    editable: true,
    color: "#0096FF",
    width: 200,
    height: 200,
  },
  render: ({ content, editable, color }) => {
    const [note, setNote] = useState(content);
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(200);
    return (
      <Note
        color={color}
        content={note}
        onUpdateContent={(val) => {
          setNote(val);
        }}
        editable={editable}
        width={width}
        height={height}
        onUpdateSize={(w, h) => {
          setWidth(w);
          setHeight(h);
        }}
      />
    );
  },
};
