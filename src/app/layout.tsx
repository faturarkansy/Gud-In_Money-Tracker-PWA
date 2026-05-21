import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>Gud In - Money Tracker</title>
      </head>
      <body className="bg-[#F4F6F9]">
        <div className="min-h-screen w-full antialiased flex flex-col justify-start items-center">
          {/* Container Pusat Utama (Mockup Mobile Frame) */}
          <div className="w-full min-h-screen relative">{children}</div>
        </div>
      </body>
    </html>
  );
}
