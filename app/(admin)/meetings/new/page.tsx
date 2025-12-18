"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FORM_TYPES, ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FormType, PreRegisteredAttendee } from "@/types"

interface MeetingFormData {
  title: string
  topic: string
  date: Date | undefined
  time: string
  location: string
  hostDepartment: string
  allowedForms: FormType[]
  allowWalkIn: boolean
}

interface AttendeeFormData {
  name: string
  phoneNumber: string
  assignedForms: FormType[]
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  ["00", "30"].map((minute) => ({
    value: `${String(hour).padStart(2, "0")}:${minute}`,
    label: `${String(hour).padStart(2, "0")}:${minute}`,
  }))
).flat()

const INITIAL_ATTENDEE: AttendeeFormData = {
  name: "",
  phoneNumber: "",
  assignedForms: [],
}

export default function NewMeetingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<MeetingFormData>({
    title: "",
    topic: "",
    date: undefined,
    time: "14:00",
    location: "",
    hostDepartment: "",
    allowedForms: [],
    allowWalkIn: true,
  })

  // Pre-registered attendees state
  const [preRegisteredAttendees, setPreRegisteredAttendees] = React.useState<
    PreRegisteredAttendee[]
  >([])
  const [isAttendeeDialogOpen, setIsAttendeeDialogOpen] = React.useState(false)
  const [editingAttendee, setEditingAttendee] = React.useState<PreRegisteredAttendee | null>(null)
  const [attendeeFormData, setAttendeeFormData] = React.useState<AttendeeFormData>(INITIAL_ATTENDEE)

  const formatDate = (date: Date | undefined) => {
    if (!date) return "날짜 선택"
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleFormTypeToggle = (formType: FormType) => {
    setFormData((prev) => ({
      ...prev,
      allowedForms: prev.allowedForms.includes(formType)
        ? prev.allowedForms.filter((f) => f !== formType)
        : [...prev.allowedForms, formType],
    }))
  }

  // Attendee management functions
  const openAttendeeDialog = (attendee?: PreRegisteredAttendee) => {
    if (attendee) {
      setEditingAttendee(attendee)
      setAttendeeFormData({
        name: attendee.name,
        phoneNumber: attendee.phoneNumber,
        assignedForms: attendee.assignedForms,
      })
    } else {
      setEditingAttendee(null)
      setAttendeeFormData(INITIAL_ATTENDEE)
    }
    setIsAttendeeDialogOpen(true)
  }

  const closeAttendeeDialog = () => {
    setIsAttendeeDialogOpen(false)
    setEditingAttendee(null)
    setAttendeeFormData(INITIAL_ATTENDEE)
  }

  const handleAttendeeFormToggle = (formType: FormType) => {
    setAttendeeFormData((prev) => ({
      ...prev,
      assignedForms: prev.assignedForms.includes(formType)
        ? prev.assignedForms.filter((f) => f !== formType)
        : [...prev.assignedForms, formType],
    }))
  }

  const handleSaveAttendee = () => {
    if (!attendeeFormData.name.trim() || !attendeeFormData.phoneNumber.trim()) {
      alert("이름과 전화번호를 입력해주세요.")
      return
    }

    if (attendeeFormData.assignedForms.length === 0) {
      alert("최소 하나의 양식을 선택해주세요.")
      return
    }

    if (editingAttendee) {
      // Update existing attendee
      setPreRegisteredAttendees((prev) =>
        prev.map((a) =>
          a.id === editingAttendee.id
            ? { ...a, ...attendeeFormData }
            : a
        )
      )
    } else {
      // Add new attendee
      const newAttendee: PreRegisteredAttendee = {
        id: `temp-${Date.now()}`,
        meetingId: "",
        name: attendeeFormData.name,
        phoneNumber: attendeeFormData.phoneNumber,
        assignedForms: attendeeFormData.assignedForms,
        status: "PENDING",
      }
      setPreRegisteredAttendees((prev) => [...prev, newAttendee])
    }

    closeAttendeeDialog()
  }

  const handleDeleteAttendee = (attendeeId: string) => {
    setPreRegisteredAttendees((prev) => prev.filter((a) => a.id !== attendeeId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date) {
      alert("날짜를 선택해주세요.")
      return
    }

    if (formData.allowedForms.length === 0) {
      alert("최소 하나의 서명 양식을 선택해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement API call
      const [hours, minutes] = formData.time.split(":").map(Number)
      const dateTime = new Date(formData.date)
      dateTime.setHours(hours, minutes, 0, 0)

      console.log("Creating meeting:", {
        ...formData,
        dateTime,
        preRegisteredAttendees,
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push(ROUTES.MEETINGS)
    } catch (error) {
      console.error("Failed to create meeting:", error)
      alert("회의 등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" render={<Link href={ROUTES.MEETINGS} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
          목록으로
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">회의 등록</h1>
        <p className="text-muted-foreground">새로운 회의를 등록하고 서명 양식을 설정합니다.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>회의의 기본 정보를 입력합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">회의명 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 2024년 1분기 사업계획 자문회의"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">회의 주제 *</Label>
                <Textarea
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="예: 사업계획 검토 및 자문"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>날짜 *</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        />
                      }
                    >
                      {formatDate(formData.date)}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date })}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">시간 *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => value && setFormData({ ...formData, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">장소 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 본관 3층 대회의실"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostDepartment">주관부서 *</Label>
                <Input
                  id="hostDepartment"
                  value={formData.hostDepartment}
                  onChange={(e) => setFormData({ ...formData, hostDepartment: e.target.value })}
                  placeholder="예: 기획조정실"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>서명 양식 선택</CardTitle>
              <CardDescription>
                참석자가 선택할 수 있는 서명 양식을 설정합니다. 참석자는 QR 스캔 후 본인에게
                해당하는 양식을 선택하여 서명합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.values(FORM_TYPES).map((formType) => (
                <div
                  key={formType.code}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-4 transition-colors",
                    formData.allowedForms.includes(formType.code as FormType)
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <Checkbox
                    id={formType.code}
                    checked={formData.allowedForms.includes(formType.code as FormType)}
                    onCheckedChange={() => handleFormTypeToggle(formType.code as FormType)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={formType.code}
                      className="cursor-pointer text-base font-medium"
                    >
                      {formType.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{formType.description}</p>
                  </div>
                </div>
              ))}

              {formData.allowedForms.length > 0 && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">선택된 양식:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {formData.allowedForms.map((form) => (
                      <li key={form}>- {FORM_TYPES[form].label}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Form Combination Examples */}
              <div className="rounded-lg border border-dashed p-4">
                <p className="mb-2 text-sm font-medium">양식 조합 예시</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>
                    <strong>외부전문가 (자문비 지급):</strong> 개인정보 동의서 + 서약서
                  </li>
                  <li>
                    <strong>외부전문가 (자문비 없음):</strong> 참석자 명단 + 서약서
                  </li>
                  <li>
                    <strong>내부 담당자:</strong> 참석자 명단
                  </li>
                  <li>
                    <strong>비밀유지 필요 내부인원:</strong> 참석자 명단 + 서약서
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pre-registered Attendees */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>참석자 사전 등록</CardTitle>
                <CardDescription>
                  참석자를 미리 등록하고 양식을 지정할 수 있습니다. 사전 등록된 참석자는 전화번호로 본인 확인 후 지정된 양식으로 서명합니다.
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => openAttendeeDialog()}
                disabled={formData.allowedForms.length === 0}
              >
                <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
                참석자 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Walk-in Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="allowWalkIn" className="text-base">현장 등록 허용</Label>
                <p className="text-sm text-muted-foreground">
                  사전 등록되지 않은 참석자도 QR 스캔 후 직접 양식을 선택하여 서명할 수 있습니다.
                </p>
              </div>
              <Switch
                id="allowWalkIn"
                checked={formData.allowWalkIn}
                onCheckedChange={(checked) => setFormData({ ...formData, allowWalkIn: checked })}
              />
            </div>

            {/* Attendees Table */}
            {preRegisteredAttendees.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>전화번호</TableHead>
                      <TableHead>지정 양식</TableHead>
                      <TableHead className="w-[100px]">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preRegisteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.phoneNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {attendee.assignedForms.map((form) => (
                              <Badge key={form} variant="secondary" className="text-xs">
                                {FORM_TYPES[form].label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openAttendeeDialog(attendee)}
                            >
                              <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttendee(attendee.id)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  {formData.allowedForms.length === 0
                    ? "먼저 서명 양식을 선택해주세요."
                    : "등록된 참석자가 없습니다. 참석자를 추가하거나 현장 등록을 허용하세요."}
                </p>
              </div>
            )}

            {/* Summary */}
            {(preRegisteredAttendees.length > 0 || formData.allowWalkIn) && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <strong>서명 진행 방식:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {preRegisteredAttendees.length > 0 && (
                    <li>- 사전 등록자 {preRegisteredAttendees.length}명: 전화번호 확인 후 지정 양식으로 서명</li>
                  )}
                  {formData.allowWalkIn && (
                    <li>- 현장 등록자: 양식 직접 선택 후 서명</li>
                  )}
                  {!formData.allowWalkIn && preRegisteredAttendees.length === 0 && (
                    <li className="text-destructive">- 사전 등록자만 서명 가능 (현재 등록자 없음)</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" render={<Link href={ROUTES.MEETINGS} />}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "회의 등록"}
          </Button>
        </div>
      </form>

      {/* Attendee Dialog */}
      <Dialog open={isAttendeeDialogOpen} onOpenChange={setIsAttendeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttendee ? "참석자 수정" : "참석자 추가"}</DialogTitle>
            <DialogDescription>
              참석자 정보를 입력하고 서명할 양식을 지정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attendeeName">이름 *</Label>
              <Input
                id="attendeeName"
                value={attendeeFormData.name}
                onChange={(e) =>
                  setAttendeeFormData({ ...attendeeFormData, name: e.target.value })
                }
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendeePhone">전화번호 *</Label>
              <Input
                id="attendeePhone"
                value={attendeeFormData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setAttendeeFormData({ ...attendeeFormData, phoneNumber: value })
                }}
                placeholder="01012345678"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                QR 스캔 후 본인 확인에 사용됩니다.
              </p>
            </div>
            <div className="space-y-2">
              <Label>서명 양식 *</Label>
              <div className="space-y-2">
                {formData.allowedForms.map((formType) => (
                  <div
                    key={formType}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                      attendeeFormData.assignedForms.includes(formType)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <Checkbox
                      id={`attendee-${formType}`}
                      checked={attendeeFormData.assignedForms.includes(formType)}
                      onCheckedChange={() => handleAttendeeFormToggle(formType)}
                    />
                    <Label
                      htmlFor={`attendee-${formType}`}
                      className="flex-1 cursor-pointer"
                    >
                      {FORM_TYPES[formType].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAttendeeDialog}>
              취소
            </Button>
            <Button type="button" onClick={handleSaveAttendee}>
              {editingAttendee ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
