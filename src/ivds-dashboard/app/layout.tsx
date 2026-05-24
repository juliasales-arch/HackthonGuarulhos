import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IVDS | Dashboard Territorial',
  description: 'Dashboard territorial para priorização de políticas públicas em Guarulhos-SP.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
