import { lazy, Suspense } from "react";

const Trace = import.meta.env.DEV
  ? lazy(() => import("@react-trace/kit").then((m) => ({ default: m.Trace })))
  : null;

export default function ReactDevTrace() {
  if (!Trace) return null;
  return (
    <Suspense>
      <Trace root={import.meta.env.VITE_ROOT} />
    </Suspense>
  );
}
