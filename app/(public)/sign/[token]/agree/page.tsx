"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"
import type { FormType } from "@/types"

// Agreement content texts
const PRIVACY_CONSENT_TEXT = `[개인정보 수집 및 이용 동의]

1. 수집 목적
   참석자 자문비 지급

2. 수집 항목
   소속, 직위, 성명, 주소, 휴대전화번호, 은행명, 예금주, 계좌번호

3. 보유 기간
   PDF 생성 후 즉시 삭제

4. 동의 거부 권리
   귀하는 개인정보 수집에 동의하지 않을 권리가 있습니다.
   다만, 동의하지 않을 경우 자문비 지급이 불가합니다.`

const IDENTIFIER_CONSENT_TEXT = `[고유식별정보(주민등록번호) 수집 및 이용 동의]

1. 처리 목적
   소득세법에 따른 소득세 신고 및 지급명세서 제출

2. 수집 항목
   주민등록번호

3. 보유 기간
   PDF 생성 후 즉시 삭제

4. 법적 근거
   - 개인정보보호법 제24조의2제1항제1호
   - 소득세법 시행령 제193조, 제213조`

const THIRD_PARTY_CONSENT_TEXT = `[제3자 제공 동의]

1. 제공받는 자
   국세청(홈택스), 감사기관

2. 제공 목적
   소득세 신고, 정부부처 감사

3. 제공 항목
   성명, 주민등록번호, 주소, 자문비 지급 내역

4. 보유 기간
   관련 법령에 따른 보관 기간

5. 법적 근거
   - 개인정보보호법 제17조제1항제2호
   - 국회법 제128조, 감사원법 제27조, 제50조`

// Dynamic text function for security pledge
const getSecurityPledgeText = (meetingTitle: string, meetingTopic: string) => `[비밀유지 서약서]

본인은 한국방송통신전파진흥원에서 발주 예정인 「${meetingTitle}」 사업의 ${meetingTopic}와 관련하여 취득한 제반 내용을 발주기관의 허락 없이 어떠한 경우에도 공개하거나 유포하지 않을 것을 서약합니다.

위반 시 관련 법령에 따라 민/형사상 책임을 질 수 있습니다.`

const ATTENDEE_LIST_CONSENT_TEXT = `[서명 정보 수집 동의]

본 서명 정보는 회의록 서명 문서 생성 후 개인정보(서명값)가 즉시 삭제됩니다.

수집된 정보는 회의 참석자 확인 용도로만 사용됩니다.`

interface AgreementItem {
  id: string
  title: string
  content: string
  required: boolean
}

interface MeetingInfo {
  title: string
  topic: string
}

export default function AgreePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [selectedForms, setSelectedForms] = React.useState<FormType[]>([])
  const [agreements, setAgreements] = React.useState<Record<string, boolean>>({})
  const [isPreRegistered, setIsPreRegistered] = React.useState(false)
  const [meetingInfo, setMeetingInfo] = React.useState<MeetingInfo>({
    title: "",
    topic: "",
  })

  React.useEffect(() => {
    // Get selected forms from session storage
    const stored = sessionStorage.getItem("selectedForms")
    if (stored) {
      setSelectedForms(JSON.parse(stored))
    }
    // Check if user is pre-registered
    const preRegFlag = sessionStorage.getItem("isPreRegistered")
    setIsPreRegistered(preRegFlag === "true")

    // Get meeting info from session storage
    const storedMeeting = sessionStorage.getItem("meetingInfo")
    if (storedMeeting) {
      setMeetingInfo(JSON.parse(storedMeeting))
    }
  }, [])

  // Build agreement items based on selected forms
  const agreementItems: AgreementItem[] = React.useMemo(() => {
    const items: AgreementItem[] = []

    if (selectedForms.includes("PRIVACY_CONSENT")) {
      items.push(
        {
          id: "privacy",
          title: "개인정보 수집 및 이용 동의",
          content: PRIVACY_CONSENT_TEXT,
          required: true,
        },
        {
          id: "identifier",
          title: "고유식별정보 수집 동의",
          content: IDENTIFIER_CONSENT_TEXT,
          required: true,
        },
        {
          id: "thirdParty",
          title: "제3자 제공 동의",
          content: THIRD_PARTY_CONSENT_TEXT,
          required: true,
        }
      )
    }

    if (selectedForms.includes("ATTENDEE_LIST")) {
      items.push({
        id: "attendeeList",
        title: "서명 정보 수집 동의",
        content: ATTENDEE_LIST_CONSENT_TEXT,
        required: true,
      })
    }

    if (selectedForms.includes("SECURITY_PLEDGE")) {
      items.push({
        id: "securityPledge",
        title: "비밀유지 서약 동의",
        content: getSecurityPledgeText(
          meetingInfo.title || "본 회의",
          meetingInfo.topic || "회의 내용"
        ),
        required: true,
      })
    }

    return items
  }, [selectedForms, meetingInfo])

  const handleAgreementToggle = (id: string) => {
    setAgreements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAgreeAll = () => {
    const allAgreed = agreementItems.every((item) => agreements[item.id])
    const newAgreements: Record<string, boolean> = {}
    agreementItems.forEach((item) => {
      newAgreements[item.id] = !allAgreed
    })
    setAgreements(newAgreements)
  }

  const allRequiredAgreed = agreementItems
    .filter((item) => item.required)
    .every((item) => agreements[item.id])

  const handleNext = () => {
    // Store agreements in session storage
    sessionStorage.setItem("agreements", JSON.stringify(agreements))
    router.push(`/sign/${token}/info`)
  }

  // Step info depends on whether user is pre-registered
  // Pre-registered: verify(2) → agree(3) → info(4) → signature(5) = 5 steps
  // Walk-in: verify(2) → select(3) → agree(4) → info(5) → signature(6) = 6 steps
  const stepInfo = isPreRegistered
    ? { current: 3, total: 5, label: "약관 동의" }
    : { current: 4, total: 6, label: "약관 동의" }

  const handleBack = () => {
    if (isPreRegistered) {
      router.push(`/sign/${token}/verify`)
    } else {
      router.push(`/sign/${token}/select-form`)
    }
  }

  return (
    <>
      <MobileLayout
        title="약관 동의"
        subtitle="아래 내용을 확인하고 동의해주세요"
        step={stepInfo}
      >
        <div className="space-y-4">
          {/* Agree All */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="agreeAll"
                  checked={agreementItems.every((item) => agreements[item.id])}
                  onCheckedChange={handleAgreeAll}
                />
                <Label htmlFor="agreeAll" className="cursor-pointer font-medium">
                  전체 동의
                </Label>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Individual Agreements */}
          {agreementItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={agreements[item.id] || false}
                    onCheckedChange={() => handleAgreementToggle(item.id)}
                    className="mt-1"
                  />
                  <Label htmlFor={item.id} className="cursor-pointer">
                    <CardTitle className="text-sm">
                      {item.title}
                      {item.required && <span className="ml-1 text-destructive">*</span>}
                    </CardTitle>
                  </Label>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-32 rounded-md border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                    {item.content}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </MobileLayout>

      <MobileFooter>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
          >
            이전
          </Button>
          <Button className="flex-1" onClick={handleNext} disabled={!allRequiredAgreed}>
            다음
          </Button>
        </div>
      </MobileFooter>
    </>
  )
}
