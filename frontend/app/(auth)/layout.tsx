import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden text-white">
            {/* Luxury Hotel Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/resort-day.jpg"
                    alt="Luxury hotel entrance"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-10">
                {children}
            </div>
        </div>
    )
}
