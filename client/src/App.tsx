import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertyPageApi from "@/pages/property-page-api";
import PropertiesPageApi from "@/pages/properties-page-api";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import AddHousePage from "@/pages/AddHousePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
        <Route path="/add-house" component={AddHousePage} /> {/* Додаємо новий маршрут */}
      <Route path="/properties" component={PropertiesPageApi} />
      <Route path="/properties/:id" component={PropertyPageApi} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
