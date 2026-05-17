import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import VisitorPresenceTracker from "@/components/shared/VisitorPresenceTracker";

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <VisitorPresenceTracker />
        </>
    );
}

export default App;
