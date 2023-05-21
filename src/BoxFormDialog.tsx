import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogProps,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Label,
  SpinButton,
  SpinButtonOnChangeData,
  makeStyles,
} from "@fluentui/react-components";
import { Box } from "./logics";

const useStyles = makeStyles({
  content: {
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },
});

type BoxFormDialogProps = Pick<DialogProps, "open" | "onOpenChange"> & {
  box: Box;
  onSubmit: (box: Box) => void;
};

const onChange = (
  data: SpinButtonOnChangeData,
  setValue: (value: number) => void
) => {
  if (data.value != null) {
    setValue(data.value);
  } else if (data.displayValue != null) {
    const newValue = parseFloat(data.displayValue);
    if (!Number.isNaN(newValue)) {
      setValue(newValue);
    }
  }
};

export const BoxFormDialog = (props: BoxFormDialogProps) =>
  props.open ? <BoxFormDialogImpl {...props} /> : null;

const BoxFormDialogImpl = (props: BoxFormDialogProps) => {
  const styles = useStyles();
  const [x, setX] = React.useState(
    props.box != null ? Math.round(props.box[0]) : 0
  );
  const [y, setY] = React.useState(
    props.box != null ? Math.round(props.box[1]) : 0
  );
  const [width, setWidth] = React.useState(
    props.box != null ? Math.round(props.box[2] - props.box[0]) : 640
  );
  const [height, setHeight] = React.useState(
    props.box != null ? Math.round(props.box[3] - props.box[1]) : 480
  );

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    props.onSubmit([x, y, x + width, y + height]);
  };

  return (
    <Dialog {...props}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>選択範囲を編集</DialogTitle>
            <DialogContent className={styles.content}>
              <Label htmlFor={"x-input"}>左上座標 X</Label>
              <SpinButton
                id={"x-input"}
                value={x}
                onChange={(_, data) => onChange(data, setX)}
              />
              <Label htmlFor={"y-input"}>左上座標 Y</Label>
              <SpinButton
                id={"y-input"}
                value={y}
                onChange={(_, data) => onChange(data, setY)}
              />
              <Label htmlFor={"width-input"}>幅</Label>
              <SpinButton
                id={"width-input"}
                min={1}
                value={width}
                onChange={(_, data) => onChange(data, setWidth)}
              />
              <Label htmlFor={"height-input"}>高さ</Label>
              <SpinButton
                id={"height-input"}
                min={1}
                value={height}
                onChange={(_, data) => onChange(data, setHeight)}
              />
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">キャンセル</Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                OK
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
