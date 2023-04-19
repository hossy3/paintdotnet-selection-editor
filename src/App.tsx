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
  ClipboardPaste24Regular,
  DocumentCopy24Regular,
  Form24Regular,
  QuestionCircle24Regular,
  SelectObject24Regular,
  ShapeUnion24Regular,
} from "@fluentui/react-icons";
import { convertToRectangleSelection, isValidSelection } from "./logics";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    height: "12em",
  },
});

const App = () => {
  const textareaId = useId("textarea");
  const styles = useStyles();

  const [selectionText, setSelectionText] = React.useState("");
  const [validSelection, setValidSelection] = React.useState(false);

  React.useEffect(() => {
    setValidSelection(isValidSelection(selectionText));
  }, [selectionText]);

  return (
    <div className={styles.base}>
      <Toolbar aria-label="Default">
        <Tooltip content="Copy" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Copy"
            disabled={!validSelection}
            onClick={() => {
              navigator.clipboard.writeText(selectionText);
            }}
            icon={<DocumentCopy24Regular />}
          />
        </Tooltip>
        <Tooltip content="Paste" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Paste"
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                setSelectionText(text);
              });
            }}
            icon={<ClipboardPaste24Regular />}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="Rectangle" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Rectangle"
            disabled={!validSelection}
            icon={<SelectObject24Regular />}
            onClick={() => {
              const sel = convertToRectangleSelection(selectionText);
              if (sel != null) {
                setSelectionText(sel);
              }
            }}
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
        id={textareaId}
        onChange={(_, data) => {
          setSelectionText(data.value);
        }}
        placeholder='Paint.NET "選択範囲自体をコピー"'
        resize="vertical"
        textarea={{ className: styles.textarea }}
        value={selectionText}
      />
    </div>
  );
};

export default App;
