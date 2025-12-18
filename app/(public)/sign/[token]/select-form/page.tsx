"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"
import { FORM_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { FormType } from "@/types"

// Mock: allowed forms for this meeting
const ALLOWED_FORMS: FormType[] = ["PRIVACY_CONSENT", "SECURITY_PLEDGE"]

export default function SelectFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [selectedForms, setSelectedForms] = React.useState<FormType[]>([])

  const handleFormToggle = (formType: FormType) => {
    setSelectedForms((prev) =>
      prev.includes(formType) ? prev.filter((f) => f !== formType) : [...prev, formType]
    )
  }

  const handleNext = () => {
    // Store selected forms in session storage or URL params
    sessionStorage.setItem("selectedForms", JSON.stringify(selectedForms))
    router.push(`/sign/${token}/agree`)
  }

  return (
    <>
      <MobileLayout
        title="양식 선택"
        subtitle="본인에게 해당하는 양식을 선택해주세요"
        step={{ current: 3, total: 6, label: "양식 선택" }}
      >
        <div className="space-y-4">
          {ALLOWED_FORMS.map((formType) => {
            const formInfo = FORM_TYPES[formType]
            const isSelected = selectedForms.includes(formType)

            return (
              <Card
                key={formType}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                )}
                onClick={() => handleFormToggle(formType)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleFormToggle(formType)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{formInfo.label}</CardTitle>
                      <CardDescription className="mt-1">{formInfo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <FormTypeDetails formType={formType} />
                </CardContent>
              </Card>
            )
          })}

          {/* Help Text */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">양식 선택 안내</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>- 자문비를 받으시는 분: 개인정보 동의서 선택</li>
              <li>- 비밀유지가 필요한 회의: 서약서 선택</li>
              <li>- 복수 선택이 가능합니다</li>
            </ul>
          </div>
        </div>
      </MobileLayout>

      <MobileFooter>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/sign/${token}/verify`)}
          >
            이전
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={selectedForms.length === 0}
          >
            다음
          </Button>
        </div>
      </MobileFooter>
    </>
  )
}

function FormTypeDetails({ formType }: { formType: FormType }) {
  switch (formType) {
    case "PRIVACY_CONSENT":
      return (
        <div className="ml-7 rounded bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">수집 정보</p>
          <p className="mt-1">소속, 직위, 성명, 주민등록번호, 주소, 전화번호, 은행명, 계좌번호</p>
        </div>
      )
    case "ATTENDEE_LIST":
      return (
        <div className="ml-7 rounded bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">수집 정보</p>
          <p className="mt-1">소속, 직위, 성명</p>
        </div>
      )
    case "SECURITY_PLEDGE":
      return (
        <div className="ml-7 rounded bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">서약 내용</p>
          <p className="mt-1">회의 관련 취득 정보의 비밀유지 서약</p>
        </div>
      )
    default:
      return null
  }
}
