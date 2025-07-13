import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Index from "./pages/Index.js";
import MarkdownComponent from "./pages/Dosc";
export default function App() {
  return (
    <div className="p-6 lg:px-8 m-auto max-w-7xl">
      <Header />
      <Routes>
        <Route Component={Index} path={"/"} />
        <Route Component={MarkdownComponent} path={"/docs"} />
      </Routes>
    </div>
  );
}
