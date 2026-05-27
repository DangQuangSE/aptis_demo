import "./globals.css";

export const metadata = {
  title: "Aptis Listening Practice Hub – Luyện Nghe Aptis Cùng Aptis Keys",
  description:
    "Luyện tập kỹ năng nghe Aptis theo từng phần với hệ thống câu hỏi ngẫu nhiên, phản hồi tức thì và transcript chi tiết.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
