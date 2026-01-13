import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Sources } from './pages/Sources';
import { Jobs } from './pages/Jobs';
import { Schedules } from './pages/Schedules';
import { Search } from './pages/Search';
import { Insights } from './pages/Insights';
import { Export } from './pages/Export';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sources" element={<Sources />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="search" element={<Search />} />
            <Route path="insights" element={<Insights />} />
            <Route path="export" element={<Export />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
