"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Menu } from "@/types"

// Mock data for development
const MOCK_MENUS: Menu[] = [
  {
    id: "1",
    name: "대시보드",
    path: "/dashboard",
    order: 1,
    icon: "Dashboard02Icon",
  },
  {
    id: "2",
    name: "회의 관리",
    path: "/meetings",
    order: 2,
    icon: "Calendar03Icon",
  },
  {
    id: "3",
    name: "사용자 관리",
    path: "/users",
    order: 3,
    icon: "UserMultipleIcon",
  },
  {
    id: "4",
    name: "설정",
    path: "/settings",
    order: 4,
    icon: "Settings02Icon",
  },
  {
    id: "5",
    name: "메뉴 관리",
    path: "/settings/menus",
    parentId: "4",
    order: 1,
    icon: "Menu01Icon",
  },
  {
    id: "6",
    name: "권한 관리",
    path: "/settings/permissions",
    parentId: "4",
    order: 2,
    icon: "LockIcon",
  },
]

interface MenuFormData {
  name: string
  path: string
  parentId: string
  icon: string
}

const ICON_OPTIONS = [
  { value: "Dashboard02Icon", label: "대시보드" },
  { value: "Calendar03Icon", label: "캘린더" },
  { value: "UserMultipleIcon", label: "사용자" },
  { value: "Settings02Icon", label: "설정" },
  { value: "Menu01Icon", label: "메뉴" },
  { value: "LockIcon", label: "잠금" },
  { value: "DocumentIcon", label: "문서" },
  { value: "ChartIcon", label: "차트" },
]

const NO_PARENT_VALUE = "__none__"

export default function MenusPage() {
  const [menus, setMenus] = React.useState<Menu[]>(MOCK_MENUS)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [editingMenu, setEditingMenu] = React.useState<Menu | null>(null)
  const [deletingMenu, setDeletingMenu] = React.useState<Menu | null>(null)
  const [formData, setFormData] = React.useState<MenuFormData>({
    name: "",
    path: "",
    parentId: "",
    icon: "",
  })

  // Get root menus (no parent)
  const rootMenus = menus.filter((m) => !m.parentId).sort((a, b) => a.order - b.order)

  // Get child menus for a parent
  const getChildMenus = (parentId: string) => {
    return menus.filter((m) => m.parentId === parentId).sort((a, b) => a.order - b.order)
  }

  // Get parent menu name
  const getParentName = (parentId?: string) => {
    if (!parentId) return "-"
    const parent = menus.find((m) => m.id === parentId)
    return parent?.name || "-"
  }

  const resetForm = () => {
    setFormData({
      name: "",
      path: "",
      parentId: "",
      icon: "",
    })
    setEditingMenu(null)
  }

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        path: menu.path,
        parentId: menu.parentId || "",
        icon: menu.icon || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call
    if (editingMenu) {
      setMenus(
        menus.map((m) =>
          m.id === editingMenu.id
            ? {
                ...m,
                name: formData.name,
                path: formData.path,
                parentId: formData.parentId || undefined,
                icon: formData.icon,
              }
            : m
        )
      )
    } else {
      const siblingMenus = formData.parentId
        ? menus.filter((m) => m.parentId === formData.parentId)
        : menus.filter((m) => !m.parentId)
      const maxOrder = siblingMenus.length > 0 ? Math.max(...siblingMenus.map((m) => m.order)) : 0

      const newMenu: Menu = {
        id: String(Date.now()),
        name: formData.name,
        path: formData.path,
        parentId: formData.parentId || undefined,
        order: maxOrder + 1,
        icon: formData.icon,
      }
      setMenus([...menus, newMenu])
    }
    handleCloseDialog()
  }

  const handleDelete = () => {
    if (deletingMenu) {
      // TODO: Implement API call
      // Also delete child menus
      const childIds = menus.filter((m) => m.parentId === deletingMenu.id).map((m) => m.id)
      setMenus(menus.filter((m) => m.id !== deletingMenu.id && !childIds.includes(m.id)))
      setIsDeleteDialogOpen(false)
      setDeletingMenu(null)
    }
  }

  const openDeleteDialog = (menu: Menu) => {
    setDeletingMenu(menu)
    setIsDeleteDialogOpen(true)
  }

  const moveMenu = (menu: Menu, direction: "up" | "down") => {
    const siblingMenus = menu.parentId
      ? menus.filter((m) => m.parentId === menu.parentId).sort((a, b) => a.order - b.order)
      : menus.filter((m) => !m.parentId).sort((a, b) => a.order - b.order)

    const currentIndex = siblingMenus.findIndex((m) => m.id === menu.id)
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= siblingMenus.length) return

    const swapMenu = siblingMenus[swapIndex]

    setMenus(
      menus.map((m) => {
        if (m.id === menu.id) return { ...m, order: swapMenu.order }
        if (m.id === swapMenu.id) return { ...m, order: menu.order }
        return m
      })
    )
  }

  const renderMenuRow = (menu: Menu, level: number = 0) => {
    const childMenus = getChildMenus(menu.id)
    const siblingMenus = menu.parentId
      ? menus.filter((m) => m.parentId === menu.parentId).sort((a, b) => a.order - b.order)
      : menus.filter((m) => !m.parentId).sort((a, b) => a.order - b.order)
    const currentIndex = siblingMenus.findIndex((m) => m.id === menu.id)
    const isFirst = currentIndex === 0
    const isLast = currentIndex === siblingMenus.length - 1

    return (
      <React.Fragment key={menu.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {level > 0 && <span className="text-muted-foreground">-</span>}
              <HugeiconsIcon icon={Menu01Icon} className="size-4 text-muted-foreground" />
              <span className="font-medium">{menu.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className="rounded bg-muted px-2 py-1 text-sm">{menu.path}</code>
          </TableCell>
          <TableCell>{getParentName(menu.parentId)}</TableCell>
          <TableCell>
            <Badge variant="outline">{menu.order}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveMenu(menu, "up")}
                disabled={isFirst}
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveMenu(menu, "down")}
                disabled={isLast}
              >
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(menu)}>
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(menu)}>
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {childMenus.map((child) => renderMenuRow(child, level + 1))}
      </React.Fragment>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">메뉴 관리</h1>
          <p className="text-muted-foreground">시스템 메뉴 구조를 관리합니다.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
          메뉴 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>메뉴 목록</CardTitle>
          <CardDescription>등록된 메뉴 {menus.length}개</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>메뉴명</TableHead>
                <TableHead>경로</TableHead>
                <TableHead>상위 메뉴</TableHead>
                <TableHead className="w-[80px]">순서</TableHead>
                <TableHead className="w-[160px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{rootMenus.map((menu) => renderMenuRow(menu))}</TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Menu Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? "메뉴 수정" : "메뉴 추가"}</DialogTitle>
            <DialogDescription>
              {editingMenu ? "메뉴 정보를 수정합니다." : "새로운 메뉴를 추가합니다."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">메뉴명</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 대시보드"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="path">경로</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="예: /dashboard"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">상위 메뉴</Label>
                <Select
                  value={formData.parentId || NO_PARENT_VALUE}
                  onValueChange={(value) => {
                    if (value) {
                      setFormData({
                        ...formData,
                        parentId: value === NO_PARENT_VALUE ? "" : value,
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT_VALUE}>없음 (최상위)</SelectItem>
                    {menus
                      .filter((m) => !m.parentId && m.id !== editingMenu?.id)
                      .map((menu) => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">아이콘</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => value && setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                취소
              </Button>
              <Button type="submit">{editingMenu ? "수정" : "추가"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMenu?.name} 메뉴를 삭제하시겠습니까?
              {getChildMenus(deletingMenu?.id || "").length > 0 &&
                " 하위 메뉴도 함께 삭제됩니다."}
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
