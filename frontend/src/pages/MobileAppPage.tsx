import { useNavigate } from "react-router";
import { MobileApp } from "../components/mobile/MobileApp";
import { usePhotographers } from "../hooks/usePhotographers";

export function MobileAppPage() {
  const navigate = useNavigate();
  const { photographers } = usePhotographers();

  return (
    <MobileApp
      photographers={photographers}
      onNavigateToHome={() => navigate("/")}
    />
  );
}
