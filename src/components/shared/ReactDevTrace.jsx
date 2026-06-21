import { Trace } from "@react-trace/core";
import { CopyToClipboardPlugin } from "@react-trace/plugin-copy-to-clipboard";
import { OpenEditorPlugin } from "@react-trace/plugin-open-editor";

export default function ReactDevTrace() {
  return (
    <Trace
      root={import.meta.env.VITE_ROOT}
      plugins={[CopyToClipboardPlugin(), OpenEditorPlugin()]}
    />
  );
}
