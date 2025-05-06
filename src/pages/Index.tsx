
import { Navigate } from "react-router-dom";

const Index = () => {
  // We don't need this file as we've set up direct routing in App.tsx
  return <Navigate to="/" replace />;
};

export default Index;
