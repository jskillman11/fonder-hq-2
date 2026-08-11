import "./globals.css";

export const metadata = {
  title: "Fonder HQ",
  description: "Client-facing growth operating system for Fonder.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
