import { getActiveOutbreak, getNewsSignals } from "@/lib/data";
import { IntelFeedView } from "./IntelFeedView";

export const dynamic = 'force-dynamic';

export default async function IntelFeedPage() {
    const outbreak = await getActiveOutbreak();

    if (!outbreak) {
        return (
            <div className="p-8 text-center text-slate-400">
                No active outbreak found.
            </div>
        );
    }

    // Fetch raw data using the outbreak ID
    const newsData = await getNewsSignals(outbreak.id);

    return <IntelFeedView outbreak={outbreak} news={newsData as any || []} />;
}
