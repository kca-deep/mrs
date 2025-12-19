"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { USER_ROLES, LAYOUT } from "@/lib/constants"
import type { User, Menu, Permission } from "@/types"

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "관리자",
    role: "ADMIN",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "manager@example.com",
    name: "담당자",
    role: "MANAGER",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "user@example.com",
    name: "일반사용자",
    role: "MANAGER",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]

const MOCK_MENUS: Menu[] = [
  { id: "1", name: "회의 관리", path: "/meetings", order: 1, icon: "Calendar03Icon" },
  { id: "2", name: "사용자 관리", path: "/users", order: 2, icon: "UserMultipleIcon" },
  { id: "3", name: "설정", path: "/settings", order: 3, icon: "Settings02Icon" },
  { id: "4", name: "메뉴 관리", path: "/settings/menus", parentId: "3", order: 1 },
  { id: "5", name: "권한 관리", path: "/settings/permissions", parentId: "3", order: 2 },
]

const MOCK_PERMISSIONS: Permission[] = [
  // Admin has all permissions
  { id: "1", userId: "1", menuId: "1", canRead: true, canWrite: true, canDelete: true },
  { id: "2", userId: "1", menuId: "2", canRead: true, canWrite: true, canDelete: true },
  { id: "3", userId: "1", menuId: "3", canRead: true, canWrite: true, canDelete: true },
  { id: "4", userId: "1", menuId: "4", canRead: true, canWrite: true, canDelete: true },
  { id: "5", userId: "1", menuId: "5", canRead: true, canWrite: true, canDelete: true },
  // Manager has limited permissions
  { id: "6", userId: "2", menuId: "1", canRead: true, canWrite: true, canDelete: false },
  { id: "7", userId: "2", menuId: "2", canRead: false, canWrite: false, canDelete: false },
  { id: "8", userId: "2", menuId: "3", canRead: false, canWrite: false, canDelete: false },
]

export default function PermissionsPage() {
  const [users] = React.useState<User[]>(MOCK_USERS)
  const [menus] = React.useState<Menu[]>(MOCK_MENUS)
  const [permissions, setPermissions] = React.useState<Permission[]>(MOCK_PERMISSIONS)
  const [selectedUserId, setSelectedUserId] = React.useState<string>(users[0]?.id || "")
  const [hasChanges, setHasChanges] = React.useState(false)

  // Get root menus (no parent)
  const rootMenus = menus.filter((m) => !m.parentId).sort((a, b) => a.order - b.order)

  // Get child menus for a parent
  const getChildMenus = (parentId: string) => {
    return menus.filter((m) => m.parentId === parentId).sort((a, b) => a.order - b.order)
  }

  // Get permission for a user and menu
  const getPermission = (userId: string, menuId: string): Permission | undefined => {
    return permissions.find((p) => p.userId === userId && p.menuId === menuId)
  }

  // Toggle permission
  const togglePermission = (
    userId: string,
    menuId: string,
    field: "canRead" | "canWrite" | "canDelete"
  ) => {
    const existingPermission = getPermission(userId, menuId)

    if (existingPermission) {
      setPermissions(
        permissions.map((p) =>
          p.id === existingPermission.id ? { ...p, [field]: !p[field] } : p
        )
      )
    } else {
      // Create new permission
      const newPermission: Permission = {
        id: String(Date.now()),
        userId,
        menuId,
        canRead: field === "canRead",
        canWrite: field === "canWrite",
        canDelete: field === "canDelete",
      }
      setPermissions([...permissions, newPermission])
    }
    setHasChanges(true)
  }

  // Grant all permissions for a user on a menu
  const grantAllPermissions = (userId: string, menuId: string) => {
    const existingPermission = getPermission(userId, menuId)

    if (existingPermission) {
      setPermissions(
        permissions.map((p) =>
          p.id === existingPermission.id
            ? { ...p, canRead: true, canWrite: true, canDelete: true }
            : p
        )
      )
    } else {
      const newPermission: Permission = {
        id: String(Date.now()),
        userId,
        menuId,
        canRead: true,
        canWrite: true,
        canDelete: true,
      }
      setPermissions([...permissions, newPermission])
    }
    setHasChanges(true)
  }

  // Revoke all permissions for a user on a menu
  const revokeAllPermissions = (userId: string, menuId: string) => {
    const existingPermission = getPermission(userId, menuId)

    if (existingPermission) {
      setPermissions(
        permissions.map((p) =>
          p.id === existingPermission.id
            ? { ...p, canRead: false, canWrite: false, canDelete: false }
            : p
        )
      )
    }
    setHasChanges(true)
  }

  const handleSave = () => {
    // TODO: Implement API call
    console.log("Saving permissions:", permissions)
    setHasChanges(false)
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)

  const renderMenuPermissionRow = (menu: Menu, level: number = 0) => {
    const childMenus = getChildMenus(menu.id)
    const permission = getPermission(selectedUserId, menu.id)
    const hasAnyPermission = permission?.canRead || permission?.canWrite || permission?.canDelete
    const hasAllPermissions = permission?.canRead && permission?.canWrite && permission?.canDelete

    return (
      <React.Fragment key={menu.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {level > 0 && <span className="text-muted-foreground">-</span>}
              <span className="font-medium">{menu.name}</span>
              <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {menu.path}
              </code>
            </div>
          </TableCell>
          <TableCell className="text-center">
            <Switch
              checked={permission?.canRead || false}
              onCheckedChange={() => togglePermission(selectedUserId, menu.id, "canRead")}
            />
          </TableCell>
          <TableCell className="text-center">
            <Switch
              checked={permission?.canWrite || false}
              onCheckedChange={() => togglePermission(selectedUserId, menu.id, "canWrite")}
            />
          </TableCell>
          <TableCell className="text-center">
            <Switch
              checked={permission?.canDelete || false}
              onCheckedChange={() => togglePermission(selectedUserId, menu.id, "canDelete")}
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {!hasAllPermissions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => grantAllPermissions(selectedUserId, menu.id)}
                >
                  전체 허용
                </Button>
              )}
              {hasAnyPermission && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeAllPermissions(selectedUserId, menu.id)}
                >
                  전체 해제
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
        {childMenus.map((child) => renderMenuPermissionRow(child, level + 1))}
      </React.Fragment>
    )
  }

  return (
    <div className={`${LAYOUT.PAGE_CONTAINER} space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">권한 관리</h1>
          <p className="text-muted-foreground">사용자별 메뉴 접근 권한을 설정합니다.</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          변경사항 저장
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자별 권한 설정</CardTitle>
          <CardDescription>
            사용자를 선택하고 각 메뉴에 대한 읽기/쓰기/삭제 권한을 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedUserId} onValueChange={setSelectedUserId}>
            <TabsList className="mb-4">
              {users.map((user) => (
                <TabsTrigger key={user.id} value={user.id} className="gap-2">
                  {user.name}
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="ml-1">
                    {USER_ROLES[user.role].label}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {users.map((user) => (
              <TabsContent key={user.id} value={user.id}>
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {USER_ROLES[user.role].label}
                    </Badge>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>메뉴</TableHead>
                      <TableHead className="w-[100px] text-center">읽기</TableHead>
                      <TableHead className="w-[100px] text-center">쓰기</TableHead>
                      <TableHead className="w-[100px] text-center">삭제</TableHead>
                      <TableHead className="w-[180px]">빠른 설정</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rootMenus.map((menu) => renderMenuPermissionRow(menu))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Permission Summary Card */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>권한 요약</CardTitle>
            <CardDescription>
              {selectedUser.name}님의 현재 권한 상태입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">읽기 권한</p>
                <p className="text-2xl font-bold">
                  {permissions.filter((p) => p.userId === selectedUserId && p.canRead).length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {menus.length}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">쓰기 권한</p>
                <p className="text-2xl font-bold">
                  {permissions.filter((p) => p.userId === selectedUserId && p.canWrite).length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {menus.length}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">삭제 권한</p>
                <p className="text-2xl font-bold">
                  {permissions.filter((p) => p.userId === selectedUserId && p.canDelete).length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {menus.length}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
