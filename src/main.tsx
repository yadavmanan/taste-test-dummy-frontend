import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NewStudyPage } from "./pages/NewStudyPage";
import { SkillsPage } from "./pages/SkillsPage";
import { StudyPage } from "./pages/StudyPage";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./design-system.css";
import { wakeBackend } from "./hooks/useHealth";

wakeBackend().catch(() => undefined);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<NewStudyPage />} />
          <Route path="studies/:id" element={<StudyPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="dev/skills" element={<SkillsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
