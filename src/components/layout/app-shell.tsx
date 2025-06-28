'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Camera,
  Globe,
  LayoutDashboard,
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
      </Sidebar>

      <SidebarInset>
        <header
          className={cn(
            'sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6'
          )}
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-2 md:hidden">
              <NutriSnapLogo className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg font-semibold leading-tight">
                NutriSnap
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/register">{t('nav.register')}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://placehold.co/100x100.png"
                      alt="User"
                      data-ai-hint="person avatar"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {t('appShell.userMenu.myAccount')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {t('appShell.userMenu.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t('appShell.userMenu.settings')}
                </DropdownMenuItem>
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
                <DropdownMenuItem>
                  {t('appShell.userMenu.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
