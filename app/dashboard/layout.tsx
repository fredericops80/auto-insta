import React from 'react';
import Link from 'next/link';
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r p-6 hidden md:block">
                <h2 className="text-xl font-bold mb-6">InstaAuto SaaS</h2>
                <nav className="space-y-4">
                    <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                        Automações
                    </Link>
                    <Link href="/dashboard/settings" className="block text-gray-700 hover:text-blue-600 font-medium">
                        Configurações
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
