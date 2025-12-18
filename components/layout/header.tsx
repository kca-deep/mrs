"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Logout03Icon,
  User02Icon,
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
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

  return (
    <header
      className={`flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 ${className ?? ""}`}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1" />
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
    </header>
  )
}
