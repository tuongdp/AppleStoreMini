import { useState } from "react";
import { Mail, Users, Send, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriberList from "@/features/admin/components/email/SubscriberList";
import CampaignList from "@/features/admin/components/email/CampaignList";
import EmailLogList from "@/features/admin/components/email/EmailLogList";

const TABS = [
    { key: "campaigns", label: "Chiến dịch", icon: Send },
    { key: "subscribers", label: "Subscribers", icon: Users },
    { key: "logs", label: "Log gửi", icon: BarChart3 },
];

export default function AdminEmailMarketing() {
    const [tab, setTab] = useState("campaigns");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Email Marketing</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Quản lý chiến dịch email, subscribers và theo dõi hiệu quả
                </p>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                    {TABS.map((t) => (
                        <TabsTrigger key={t.key} value={t.key} className="gap-2">
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="campaigns">
                        <CampaignList />
                    </TabsContent>
                    <TabsContent value="subscribers">
                        <SubscriberList />
                    </TabsContent>
                    <TabsContent value="logs">
                        <EmailLogList />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
