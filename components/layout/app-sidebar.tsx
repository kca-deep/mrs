"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  DashboardSquare02Icon,
  Calendar03Icon,
  UserGroup02Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/constants"

interface MenuItem {
  title: string
  path: string
  icon?: IconSvgElement
  children?: Omit<MenuItem, "icon" | "children">[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    title: "대시보드",
    path: ROUTES.DASHBOARD,
    icon: DashboardSquare02Icon,
  },
  {
    title: "회의 관리",
    path: ROUTES.MEETINGS,
    icon: Calendar03Icon,
  },
  {
    title: "사용자 관리",
    path: ROUTES.USERS,
    icon: UserGroup02Icon,
  },
  {
    title: "설정",
    path: ROUTES.SETTINGS,
    icon: Settings02Icon,
    children: [
      {
        title: "메뉴 관리",
        path: ROUTES.SETTINGS_MENUS,
      },
      {
        title: "권한 관리",
        path: ROUTES.SETTINGS_PERMISSIONS,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-14 items-center px-4">
          {!isCollapsed && (
            <span className="text-lg font-semibold">MRS</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.path}>
                  {item.children ? (
                    <>
                      <SidebarMenuButton
                        isActive={isActive(item.path)}
                      >
                        {item.icon && (
                          <HugeiconsIcon
                            icon={item.icon}
                            className="size-4"
                          />
                        )}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.path}>
                            <Link href={child.path}>
                              <SidebarMenuSubButton
                                isActive={isActive(child.path)}
                              >
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <Link href={item.path}>
                      <SidebarMenuButton
                        isActive={isActive(item.path)}
                      >
                        {item.icon && (
                          <HugeiconsIcon
                            icon={item.icon}
                            className="size-4"
                          />
                        )}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
