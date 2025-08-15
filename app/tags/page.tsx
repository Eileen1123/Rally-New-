import { Suspense } from "react"
import TagSelection from "@/components/tag-selection"

export default function TagsPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">正在加载标签选择页面...</p>
          </div>
        </div>
      }>
        <TagSelection />
      </Suspense>
    </main>
  )
}
