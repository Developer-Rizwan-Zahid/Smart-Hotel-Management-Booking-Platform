import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex h-screen overflow-hidden bg-black selection:bg-indigo-500 selection:text-white text-white">
            {/* Premium Hotel Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/resort-background.png"
                    alt="Hotel lobby background"
                    fill
                    priority
                    className="object-cover object-center opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/95" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.25)_0,transparent_55%),radial-gradient(circle_at_100%_100%,rgba(45,212,191,0.2)_0,transparent_55%)] mix-blend-soft-light" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
            </div>

            <Sidebar />

            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="mx-auto max-w-[1400px] p-6 md:p-10 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
