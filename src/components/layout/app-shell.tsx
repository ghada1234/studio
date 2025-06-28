'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Camera,
  Globe,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { NutriSnapLogo } from '../icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, setLanguage } = useTranslation();

  const navItems = [
    {
      href: '/',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
    },
    {
      href: '/analyze',
      icon: Camera,
      label: t('nav.analyze'),
    },
    {
      href: '/add-meal',
      icon: PlusCircle,
      label: t('nav.add'),
    },
    {
      href: '/suggestions',
      icon: BrainCircuit,
      label: t('nav.suggestions'),
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        className="bg-sidebar text-sidebar-foreground border-sidebar-border"
      >
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href="/" className="flex items-center gap-3">
            <NutriSnapLogo className="h-8 w-8 text-primary" />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <h2 className="font-headline text-2xl font-semibold leading-tight tracking-tighter">
                NutriSnap
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('appShell.subtitle')}
              </p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                    className: 'font-body',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarHeader className="mt-auto border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 p-2 hover:bg-sidebar-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://placehold.co/100x100.png"
                    alt="User"
                    data-ai-hint="person avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-left group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium">User</p>
                  <p className="text-xs text-muted-foreground">
                    user@nutrisnap.app
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start">
              <DropdownMenuLabel>{t('appShell.userMenu.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('appShell.userMenu.profile')}</DropdownMenuItem>
              <DropdownMenuItem>{t('appShell.userMenu.settings')}</DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe />
                  <span>{t('appShell.userMenu.language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setLanguage('en')}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('ar')}>
                      العربية
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('appShell.userMenu.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
      </Sidebar>

      <SidebarInset>
        <header
          className={cn(
            'sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden'
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <NutriSnapLogo className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-headline text-lg font-semibold leading-tight">
                NutriSnap
              </span>
              <span className="text-xs text-muted-foreground">
                {t('appShell.subtitle')}
              </span>
            </div>
          </Link>
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
