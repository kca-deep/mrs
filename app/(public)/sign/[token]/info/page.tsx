"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"
import type { FormType } from "@/types"

// Bank options
const BANK_OPTIONS = [
  { value: "KB", label: "KB국민은행" },
  { value: "SHINHAN", label: "신한은행" },
  { value: "WOORI", label: "우리은행" },
  { value: "HANA", label: "하나은행" },
  { value: "IBK", label: "IBK기업은행" },
  { value: "NH", label: "NH농협은행" },
  { value: "KAKAO", label: "카카오뱅크" },
  { value: "TOSS", label: "토스뱅크" },
  { value: "SC", label: "SC제일은행" },
  { value: "CITY", label: "씨티은행" },
  { value: "KDB", label: "KDB산업은행" },
  { value: "SUHYUP", label: "수협은행" },
]

interface FormData {
  // Basic info (all forms)
  name: string
  department: string
  position: string
  // Privacy consent only
  residentNumber1: string
  residentNumber2: string
  address: string
  phoneNumber: string
  bankName: string
  accountHolder: string
  accountNumber: string
}

export default function InfoPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [selectedForms, setSelectedForms] = React.useState<FormType[]>([])
  const [isPreRegistered, setIsPreRegistered] = React.useState(false)
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    department: "",
    position: "",
    residentNumber1: "",
    residentNumber2: "",
    address: "",
    phoneNumber: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  })

  React.useEffect(() => {
    const stored = sessionStorage.getItem("selectedForms")
    if (stored) {
      setSelectedForms(JSON.parse(stored))
    }
    // Check if user is pre-registered
    const preRegFlag = sessionStorage.getItem("isPreRegistered")
    setIsPreRegistered(preRegFlag === "true")

    // If pre-registered, pre-fill the name
    const preRegAttendee = sessionStorage.getItem("preRegisteredAttendee")
    if (preRegAttendee) {
      const attendee = JSON.parse(preRegAttendee)
      setFormData((prev) => ({
        ...prev,
        name: attendee.name || "",
        phoneNumber: attendee.phoneNumber || "",
      }))
    }
  }, [])

  const requiresPrivacyInfo = selectedForms.includes("PRIVACY_CONSENT")

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isBasicInfoComplete =
    formData.name.trim() !== "" &&
    formData.department.trim() !== "" &&
    formData.position.trim() !== ""

  const isPrivacyInfoComplete =
    !requiresPrivacyInfo ||
    (formData.residentNumber1.length === 6 &&
      formData.residentNumber2.length === 7 &&
      formData.address.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.bankName !== "" &&
      formData.accountHolder.trim() !== "" &&
      formData.accountNumber.trim() !== "")

  const isFormComplete = isBasicInfoComplete && isPrivacyInfoComplete

  const handleNext = () => {
    // Store form data in session storage
    sessionStorage.setItem("attendeeInfo", JSON.stringify(formData))
    router.push(`/sign/${token}/signature`)
  }

  // Step info depends on whether user is pre-registered
  const stepInfo = isPreRegistered
    ? { current: 4, total: 5, label: "정보 입력" }
    : { current: 5, total: 6, label: "정보 입력" }

  return (
    <>
      <MobileLayout
        title="정보 입력"
        subtitle="서명에 필요한 정보를 입력해주세요"
        step={stepInfo}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
              <CardDescription>모든 참석자 공통 입력 항목입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">성명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">소속 *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="회사/기관명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">직위 *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="과장, 교수, 대표이사 등"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Consent Additional Info */}
          {requiresPrivacyInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">자문비 지급 정보</CardTitle>
                <CardDescription>
                  개인정보 동의서 선택 시 추가로 필요한 정보입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>주민등록번호 *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={formData.residentNumber1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                        handleChange("residentNumber1", value)
                      }}
                      placeholder="앞 6자리"
                      maxLength={6}
                      inputMode="numeric"
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="password"
                      value={formData.residentNumber2}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 7)
                        handleChange("residentNumber2", value)
                      }}
                      placeholder="뒤 7자리"
                      maxLength={7}
                      inputMode="numeric"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소 *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="상세 주소 입력"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">휴대전화번호 *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      handleChange("phoneNumber", value)
                    }}
                    placeholder="01012345678"
                    inputMode="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">은행명 *</Label>
                  <Select
                    value={formData.bankName}
                    onValueChange={(value) => value && handleChange("bankName", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BANK_OPTIONS.map((bank) => (
                        <SelectItem key={bank.value} value={bank.value}>
                          {bank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">예금주 *</Label>
                  <Input
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => handleChange("accountHolder", e.target.value)}
                    placeholder="예금주명"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">계좌번호 *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      handleChange("accountNumber", value)
                    }}
                    placeholder="- 없이 숫자만 입력"
                    inputMode="numeric"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              입력하신 개인정보는 암호화되어 안전하게 처리되며, PDF 문서 생성 후 즉시 삭제됩니다.
            </p>
          </div>
        </div>
      </MobileLayout>

      <MobileFooter>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/sign/${token}/agree`)}
          >
            이전
          </Button>
          <Button className="flex-1" onClick={handleNext} disabled={!isFormComplete}>
            다음
          </Button>
        </div>
      </MobileFooter>
    </>
  )
}
