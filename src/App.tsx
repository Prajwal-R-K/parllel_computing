
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OpenMPPage from "./pages/OpenMPPage";
import MasterWorkerPage from "./pages/MasterWorkerPage";
import SynchronizationPage from "./pages/SynchronizationPage";
import LocksPage from "./pages/LocksPage";
import ProducerConsumerPage from "./pages/ProducerConsumerPage";
import TaskDependenciesPage from "./pages/TaskDependenciesPage";
import PerformancePitfallsPage from "./pages/PerformancePitfallsPage";
import SchedulingPage from "./pages/SchedulingPage";
import ThreadSafetyPage from "./pages/ThreadSafetyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/openmp" element={<OpenMPPage />} />
          <Route path="/master-worker" element={<MasterWorkerPage />} />
          <Route path="/synchronization" element={<SynchronizationPage />} />
          <Route path="/locks" element={<LocksPage />} />
          <Route path="/producer-consumer" element={<ProducerConsumerPage />} />
          <Route path="/task-dependencies" element={<TaskDependenciesPage />} />
          <Route path="/performance-pitfalls" element={<PerformancePitfallsPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/thread-safety" element={<ThreadSafetyPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
