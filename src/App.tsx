import React from "react";
import {
  Textarea,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  makeStyles,
  useId,
} from "@fluentui/react-components";
import {
  ArrowExpand24Regular,
  Clipboard24Regular,
  ClipboardPaste24Regular,
  Form24Regular,
  QuestionCircle24Regular,
  SelectObject24Regular,
  ShapeUnion24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    height: "6em",
  },
});

const App = () => {
  const textareaId = useId("textarea");
  const styles = useStyles();

  return (
    <div className={styles.base}>
      <Toolbar aria-label="Default">
        <Tooltip content="Copy" relationship="description" withArrow>
          <ToolbarButton aria-label="Copy" icon={<Clipboard24Regular />} />
        </Tooltip>
        <Tooltip content="Paste" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Paste"
            icon={<ClipboardPaste24Regular />}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="Rectangle" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Rectangle"
            icon={<SelectObject24Regular />}
          />
        </Tooltip>
        <Tooltip content="Expand" relationship="description" withArrow>
          <ToolbarButton aria-label="Expand" icon={<ArrowExpand24Regular />} />
        </Tooltip>
        <Tooltip content="Form" relationship="description" withArrow>
          <ToolbarButton aria-label="Form" icon={<Form24Regular />} />
        </Tooltip>
        <Tooltip content="Fill void" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Fill void"
            icon={<ShapeUnion24Regular />}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="Help" relationship="description" withArrow>
          <ToolbarButton aria-label="Help" icon={<QuestionCircle24Regular />} />
        </Tooltip>
      </Toolbar>
      <Textarea
        className={styles.textarea}
        id={textareaId}
        placeholder='Paint.NET "選択範囲自体をコピー"'
      />
    </div>
  );
};

export default App;
