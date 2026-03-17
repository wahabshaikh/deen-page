import { connectDB } from "@/lib/db";
import { Builder } from "@/lib/models/builder";

export default async function LinkInBioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  await connectDB();

  const builder = await Builder.findOne({ username })
    .select("theme")
    .lean();
    
  const theme = builder?.theme || "deen";

  return (
    <div data-theme={theme} className="min-h-screen bg-base-100 text-base-content flex flex-col">
      {children}
    </div>
  );
}
