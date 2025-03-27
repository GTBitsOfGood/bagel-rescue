import React from 'react';

export default function AdminAnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#F6F9FC]">
            <main className="bg-[#F6F9FC]">{children}</main>
        </div>
    );
}