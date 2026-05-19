import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { router } from "./routes";
import LoadingScreen from "@/components/shared/LoadingScreen";

function App() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
        </Suspense>
    );
}

export default App;
