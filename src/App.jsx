import { RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import { router } from "./routes";
import VisitorPresenceTracker from "@/components/shared/VisitorPresenceTracker";
import LoadingScreen from "@/components/shared/LoadingScreen";

function App() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
            <VisitorPresenceTracker />
        </Suspense>
    );
}

export default App;
