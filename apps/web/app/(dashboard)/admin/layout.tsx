import {Activity, BarChart3, Bell, BookOpen, HelpCircle, Home, LogOut, Search, Settings, Shield, User, Users} from "lucide-react";
import React from 'react';

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader,
    SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider, SidebarRail, SidebarTrigger
} from "@/components/ui/sidebar";

const adminNavItems = [
    {
        title: "Dashboard",
        icon: Home,
        url: "/admin/dashboard",
        badge: null,
    },
    {
        title: "Analytics",
        icon: BarChart3,
        url: "/admin/analytics",
        badge: null,
    },
    {
        title: "User Management",
        icon: Users,
        url: "/admin/users",
        badge: "12",
    },
    {
        title: "Education Hub",
        icon: BookOpen,
        url: "/admin/education",
        badge: null,
    },
    {
        title: "System Health",
        icon: Activity,
        url: "/admin/system",
        badge: null,
    },
    {
        title: "Security",
        icon: Shield,
        url: "/admin/security",
        badge: null,
    },
    {
        title: "Support Center",
        icon: HelpCircle,
        url: "/admin/support",
        badge: "3",
    },
    {
        title: "Settings",
        icon: Settings,
        url: "/admin/settings",
        badge: null,
    },
];

interface AdminDashboardLayoutProps {
    children: React.ReactNode;
    user?: {
        name: string;
        email: string;
        avatar?: string;
        role: string;
    };
    unreadNotifications?: number;
}

const AdminSidebar = ({ user }: { user?: AdminDashboardLayoutProps['user'] }) => {
    return (
        <Sidebar variant="inset" className="bg-white border-r border-gray-200">
            <SidebarHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white text-sm font-medium">
                        ES
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">EcoSprout</span>
                        <span className="text-xs text-gray-500">Admin Portal</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {adminNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-normal">{item.title}</span>
                                            {item.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 font-normal"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100 p-3">
                {user && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <div className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-green-500 text-white text-sm font-medium">
                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.role}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                                        <LogOut className="h-3 w-3" />
                                    </Button>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

const AdminHeader = ({ unreadNotifications }: { unreadNotifications?: number }) => {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 px-6 bg-white">
            <SidebarTrigger className="text-gray-500 hover:text-gray-900" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                    <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications && unreadNotifications > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-green-500 text-white border-0"
                        >
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Badge>
                    )}
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                    <User className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
};

const mockAdminUser = {
    name: 'Admin User',
    email: 'admin@ecosprout.com',
    avatar: '',
    role: 'System Administrator'
};


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar user={mockAdminUser} />
          <SidebarInset>
            <AdminHeader unreadNotifications={0} />
            <main className="flex-1 p-8 bg-gray-50 min-h-screen">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
  );
}
