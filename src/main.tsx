import "react"; // Garante que o chunk React carrega primeiro (evita createContext undefined em produção)
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
