import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { PreferenceProvider } from '@/contexts/PreferenceContext';

export const metadata: Metadata = {
  title: 'a2ui — Personalized UI Demo',
  description: 'AI-generated UI components tailored to each user\'s preferences',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <PreferenceProvider>
            {children}
          </PreferenceProvider>
        </UserProvider>
      </body>
    </html>
  );
}
