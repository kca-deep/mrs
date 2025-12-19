"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Calendar03Icon,
  UserGroup02Icon,
  Settings02Icon,
  Logout03Icon,
  User02Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

interface MenuItem {
  title: string
  path: string
  icon?: IconSvgElement
  children?: Omit<MenuItem, "icon" | "children">[]
}

const MENU_ITEMS: MenuItem[] = [
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

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // TODO: Replace with actual session data from NextAuth
  const user = {
    name: "관리자",
    email: "admin@example.com",
    role: "ADMIN",
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2)
  }

  const handleLogout = async () => {
    // TODO: Implement logout with NextAuth
    console.log("Logout")
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 shrink-0 items-center border-b bg-background px-4 md:px-6",
        className
      )}
    >
      {/* Logo */}
      <Link href={ROUTES.MEETINGS} className="flex items-center gap-2">
        <span className="text-lg font-semibold">MRS</span>
      </Link>

      {/* Desktop Navigation - Centered */}
      <div className="hidden flex-1 justify-center md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            {MENU_ITEMS.map((item) =>
              item.children ? (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuTrigger
                    className={cn(isActive(item.path) && "bg-accent")}
                  >
                    {item.icon && (
                      <HugeiconsIcon icon={item.icon} className="mr-2 size-4" />
                    )}
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-1 p-2">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavigationMenuLink
                            href={child.path}
                            className={cn(
                              "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActive(child.path) && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {child.title}
                            </div>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink
                    href={item.path}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(item.path) && "bg-accent"
                    )}
                  >
                    {item.icon && (
                      <HugeiconsIcon icon={item.icon} className="mr-2 size-4" />
                    )}
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex-1 md:hidden" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <HugeiconsIcon icon={User02Icon} className="mr-2 size-4" />
            <span>프로필</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <HugeiconsIcon icon={Logout03Icon} className="mr-2 size-4" />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <HugeiconsIcon icon={Menu01Icon} className="size-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          }
        />
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>메뉴</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            {MENU_ITEMS.map((item) =>
              item.children ? (
                <div key={item.path} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    {item.icon && (
                      <HugeiconsIcon icon={item.icon} className="size-4" />
                    )}
                    {item.title}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                          isActive(child.path) && "bg-accent font-medium"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    isActive(item.path) && "bg-accent font-medium"
                  )}
                >
                  {item.icon && (
                    <HugeiconsIcon icon={item.icon} className="size-4" />
                  )}
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
