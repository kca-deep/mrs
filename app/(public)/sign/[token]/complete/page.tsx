"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileLayout } from "@/components/layout/mobile-layout"

export default function CompletePage() {
  return (
    <MobileLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <Card className="w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-10 text-green-600" />
            </div>
            <CardTitle className="text-xl">서명이 완료되었습니다</CardTitle>
            <CardDescription>
              서명이 성공적으로 제출되었습니다.
              <br />
              이 페이지를 닫으셔도 됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 text-left">
              <p className="text-sm text-muted-foreground">
                제출하신 정보는 PDF 문서 생성 후 즉시 삭제됩니다. 감사합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
