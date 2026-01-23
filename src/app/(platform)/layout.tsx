import { AppShell } from "@/components/layout/AppShell";
import { getConversations } from "@/app/actions/conversation";

export default async function PlatformLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const analysisConversations = await getConversations("analysis");

    return (
        <AppShell initialConversations={analysisConversations}>
            {children}
        </AppShell>
    );
}
