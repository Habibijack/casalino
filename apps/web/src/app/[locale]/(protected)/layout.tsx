import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';
import { BottomTabs } from '@/components/navigation/bottom-tabs';
import { ChatProvider } from '@/components/chat/chat-provider';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <ChatProvider userLanguage={session.preferredLanguage}>
      <div className="min-h-screen bg-background pb-20">
        {children}
      </div>
      <BottomTabs locale={locale} />
    </ChatProvider>
  );
}
