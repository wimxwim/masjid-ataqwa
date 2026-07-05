import LoginPage from "@/components/LoginPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Login Admin",
  description: "Halaman login administrator Masjid Jami' At-Taqwa Ulujami — akses dashboard pengurus masjid.",
  path: "/login",
});

export default function Login() {
  return <LoginPage />;
}
