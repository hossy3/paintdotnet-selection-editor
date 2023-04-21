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
  Link,
  Text,
} from "@fluentui/react-components";

type AboutDialogProps = Pick<DialogProps, "open" | "onOpenChange">;

export const AboutDialog = (props: AboutDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Paint.NET Selection Editor</DialogTitle>
          <DialogContent>
            <div>
              <Text>
                Paint.NET の選択範囲テキストを編集する WEB アプリケーション
              </Text>
            </div>
            <div>
              <Link href="https://github.com/hossy3/paintdotnet-selection-editor/">
                GitHub
              </Link>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
