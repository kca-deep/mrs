import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants"

export default function Page() {
  // TODO: Check if user is logged in
  // If logged in, redirect to dashboard
  // If not, redirect to login
  redirect(ROUTES.LOGIN)
}
