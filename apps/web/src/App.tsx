import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header";
import { SmartSuspense } from "./components/loading/SmartSuspense";
import { HomeSkeleton } from "./components/skeletons/HomeSkeleton";
import { RoomSkeleton } from "./components/skeletons/RoomSkeleton";

// Route-level Code Splitting for Production Bundle Optimization
const Home = React.lazy(() => import("./routes/Home").then(m => ({ default: m.Home })));
const Room = React.lazy(() => import("./routes/Room").then(m => ({ default: m.Room })));

// Prefetch helper for seamless room transition
export const prefetchRoomChunk = () => {
  import("./routes/Room");
};

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Caught component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-[hsl(var(--bg))] text-[hsl(var(--text))] p-6">
          <div className="max-w-md w-full ui-card p-6 rounded-2xl border border-[hsl(var(--border))] text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto font-bold text-xl border border-rose-500/20">
              !
            </div>
            <h2 className="text-lg font-bold text-[hsl(var(--text))]">Section Unavailable</h2>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Unable to load this section. Please try again or reload the page.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text))] text-xs font-semibold rounded-lg hover:bg-[hsl(var(--border))] transition-colors cursor-pointer border border-[hsl(var(--border))]"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[hsl(var(--accent))] text-white text-xs font-semibold rounded-lg hover:bg-[hsl(var(--accent-hover))] transition-colors cursor-pointer shadow-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Layout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--text))] flex flex-col font-sans transition-colors duration-300">
      <Header />
      <div className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <SmartSuspense fallback={<HomeSkeleton />}>
            <Home />
          </SmartSuspense>
        ),
      },
      {
        path: "/r/:roomCode",
        element: (
          <SmartSuspense fallback={<RoomSkeleton />}>
            <Room />
          </SmartSuspense>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
