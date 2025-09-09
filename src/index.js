// src/index.js
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";

// 👇 importuoji savo AuthProvider
import { AuthProvider } from "./auth/AuthProvider";

const root = createRoot(document.getElementById("root"));
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
