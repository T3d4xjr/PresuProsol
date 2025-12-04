import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PresupuestosFloat from "@/components/PresupuestosFloat";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <PresupuestosFloat />
    </AuthProvider>
  );
}
