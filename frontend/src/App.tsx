import { AuthProvider } from "./context/AuthContext";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <RouterProvider router={router} />
      </MarketplaceProvider>
    </AuthProvider>
  );
}
