import Trace from "@react-trace/kit";

export default function ReactDevTrace() {
  return <Trace root={import.meta.env.VITE_ROOT} />;
}
