import React from "react";
import ReactDOM from "react-dom/client";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { UnheadProvider } from "@unhead/react/client";
import { store, persistor } from "./store";
import AppProviders from "./providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import LoadingScreen from "./components/shared/LoadingScreen";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import NetworkStatusNotifier from "./components/shared/NetworkStatusNotifier";
import App from "./App.jsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <UnheadProvider>
                <AppProviders>
                    <ErrorBoundary>
                        <App />
                    </ErrorBoundary>
                    <Toaster />
                    <NetworkStatusNotifier />
                </AppProviders>
            </UnheadProvider>
        </PersistGate>
    </Provider>,
);
