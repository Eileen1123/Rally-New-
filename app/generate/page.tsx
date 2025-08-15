"use client"

import { Suspense } from "react"
import PlanGeneration from "@/components/plan-generation"

function PlanGenerationWrapper() {
  return (
    <main className="min-h-screen bg-stone-50">
      <PlanGeneration />
    </main>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">正在加载页面...</p>
        </div>
      </main>
    }>
      <PlanGenerationWrapper />
    </Suspense>
  )
}
