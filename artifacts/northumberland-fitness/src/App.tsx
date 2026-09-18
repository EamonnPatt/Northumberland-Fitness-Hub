import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { IS_ADMIN_SITE, MEMBER_ACCOUNTS_ENABLED } from "@/lib/site-mode";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AdminRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute requireAdmin deniedRedirect="/login">
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function MemberRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {MEMBER_ACCOUNTS_ENABLED && <Route path="/login" component={Login} />}
      {MEMBER_ACCOUNTS_ENABLED && <Route path="/register" component={Register} />}
      {MEMBER_ACCOUNTS_ENABLED && (
        <Route path="/account">
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        </Route>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return IS_ADMIN_SITE ? <AdminRouter /> : <MemberRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
