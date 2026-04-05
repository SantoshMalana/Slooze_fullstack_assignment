'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Slooze — Food Ordering</title>
        <meta name="description" content="Role-based food ordering platform" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white antialiased">
        <ApolloProvider client={apolloClient}>
          <AuthProvider>{children}</AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
