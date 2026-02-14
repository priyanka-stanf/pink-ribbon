import "./globals.css";
import { ProfileProvider } from "./context/ProfileContext";

export const metadata = {
  title: "CareCompass",
  description: "Personalized, location-aware breast cancer treatment simulator. 0–5 year horizon. SEER, CMS, PubMed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
