"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, RotateClockwiseIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileLayout, MobileFooter } from "@/components/layout/mobile-layout"

export default function SignaturePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasSignature, setHasSignature] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isPreRegistered, setIsPreRegistered] = React.useState(false)

  // Check if user is pre-registered
  React.useEffect(() => {
    const preRegFlag = sessionStorage.getItem("isPreRegistered")
    setIsPreRegistered(preRegFlag === "true")
  }, [])

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Set drawing style
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, rect.width, rect.height)
  }, [])

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    setIsSubmitting(true)

    try {
      // Get signature as base64
      const signatureData = canvas.toDataURL("image/png")

      // Get stored data
      const selectedForms = JSON.parse(sessionStorage.getItem("selectedForms") || "[]")
      const agreements = JSON.parse(sessionStorage.getItem("agreements") || "{}")
      const attendeeInfo = JSON.parse(sessionStorage.getItem("attendeeInfo") || "{}")

      // TODO: Implement API call to submit signature
      console.log("Submitting signature:", {
        token,
        selectedForms,
        agreements,
        attendeeInfo,
        signatureData: signatureData.substring(0, 100) + "...",
      })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Clear session storage
      sessionStorage.removeItem("selectedForms")
      sessionStorage.removeItem("agreements")
      sessionStorage.removeItem("attendeeInfo")
      sessionStorage.removeItem("isPreRegistered")
      sessionStorage.removeItem("preRegisteredAttendee")
      sessionStorage.removeItem("attendeePhone")
      sessionStorage.removeItem("meetingInfo")

      // Navigate to complete page
      router.push(`/sign/${token}/complete`)
    } catch (error) {
      console.error("Failed to submit signature:", error)
      alert("서명 제출에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step info depends on whether user is pre-registered
  const stepInfo = isPreRegistered
    ? { current: 5, total: 5, label: "서명" }
    : { current: 6, total: 6, label: "서명" }

  return (
    <>
      <MobileLayout
        title="서명"
        subtitle="아래 영역에 서명해주세요"
        step={stepInfo}
      >
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">서명 영역</CardTitle>
              <CardDescription>손가락 또는 펜으로 서명해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="h-48 w-full touch-none rounded-lg border-2 border-dashed bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />

                {!hasSignature && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">여기에 서명하세요</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={clearSignature} disabled={!hasSignature}>
                  <HugeiconsIcon icon={Delete02Icon} className="mr-1 size-4" />
                  지우기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notice */}
          <div className="rounded-lg bg-muted p-4">
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- 서명은 본인의 고유한 필체로 작성해주세요.</li>
              <li>- 서명 영역 전체를 활용하여 명확하게 서명해주세요.</li>
              <li>- 서명 후 수정이 필요하면 지우기 버튼을 눌러주세요.</li>
            </ul>
          </div>
        </div>
      </MobileLayout>

      <MobileFooter>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/sign/${token}/info`)}
            disabled={isSubmitting}
          >
            이전
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!hasSignature || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={RotateClockwiseIcon} className="mr-2 size-4 animate-spin" />
                제출 중...
              </>
            ) : (
              "서명 제출"
            )}
          </Button>
        </div>
      </MobileFooter>
    </>
  )
}
