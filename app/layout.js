import "./globals.css";

export const metadata = {
  title: "AI-Powered GBP Post Manager",
  description: "Create and manage AI-assisted Google Business Profile posts."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
