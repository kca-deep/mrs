"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileLayout } from "@/components/layout/mobile-layout"

export default function ExpiredPage() {
  return (
    <MobileLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <Card className="w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-10 text-red-600" />
            </div>
            <CardTitle className="text-xl">서명을 진행할 수 없습니다</CardTitle>
            <CardDescription>
              유효하지 않거나 만료된 링크입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="mb-2 text-sm font-medium">가능한 원인:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>- 회의가 종료되어 서명 URL이 비활성화됨</li>
                  <li>- 서명 링크의 유효 시간이 만료됨</li>
                  <li>- 잘못된 URL로 접속함</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                문의가 필요한 경우 회의 담당자에게 연락해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
