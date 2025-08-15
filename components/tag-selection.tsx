"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft } from "lucide-react"

function TagSelectionContent() {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const tagCategories = [
    {
      title: "做什么...",
      color: "blue",
      tags: ["美食", "观影", "艺术", "音乐", "购物", "运动", "文化", "夜生活"],
    },
    {
      title: "氛围是...",
      color: "orange",
      tags: ["浪漫", "文艺", "复古", "现代", "私密", "热闹", "悠闲", "刺激"],
    },
    {
      title: "我想要...",
      color: "green",
      tags: ["性价比高", "充裕的时间", "交通便利", "室内活动", "户外活动", "人少安静", "网红打卡", "本地特色"],
    },
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const getTagStyles = (tag: string, color: string) => {
    const isSelected = selectedTags.includes(tag)
    const baseStyles = "px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium"

    if (color === "blue") {
      return isSelected
        ? `${baseStyles} bg-blue-500 text-white ring-2 ring-offset-2 ring-blue-500`
        : `${baseStyles} bg-blue-100 text-blue-800 hover:bg-blue-200`
    } else if (color === "orange") {
      return isSelected
        ? `${baseStyles} bg-orange-500 text-white ring-2 ring-offset-2 ring-orange-500`
        : `${baseStyles} bg-orange-100 text-orange-800 hover:bg-orange-200`
    } else {
      return isSelected
        ? `${baseStyles} bg-green-500 text-white ring-2 ring-offset-2 ring-green-500`
        : `${baseStyles} bg-green-100 text-green-800 hover:bg-green-200`
    }
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSurpriseMe = () => {
    // Randomly select some tags
    const allTags = tagCategories.flatMap((cat) => cat.tags)
    const randomTags = allTags.sort(() => 0.5 - Math.random()).slice(0, 5)
    setSelectedTags(randomTags)
  }

  const handleGeneratePlans = async () => {
    if (selectedTags.length === 0) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: selectedTags }),
      })

      if (!response.ok) {
        throw new Error('生成方案失败')
      }

      // 跳转到生成页面，并传递标签信息
      router.push(`/generate?tags=${encodeURIComponent(JSON.stringify(selectedTags))}`)
    } catch (error) {
      console.error('生成方案时出错:', error)
      alert('生成方案失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">选择你的探索标签</h1>
            <p className="text-gray-600 mt-1">告诉我们你想要什么样的体验</p>
          </div>
        </div>

        {/* Tag Categories */}
        <div className="space-y-8">
          {tagCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{category.title}</h2>
              <div className="flex flex-wrap gap-3">
                {category.tags.map((tag, tagIndex) => (
                  <button key={tagIndex} onClick={() => toggleTag(tag)} className={getTagStyles(tag, category.color)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Surprise Me Button */}
        <div className="text-center my-8">
          <Button
            onClick={handleSurpriseMe}
            variant="outline"
            className="border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-full font-medium bg-transparent"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            给我惊喜
          </Button>
        </div>

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">当前选择 ({selectedTags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
                  <Button
          onClick={handleGeneratePlans}
          disabled={selectedTags.length === 0 || isGenerating}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              AI正在生成方案...
            </>
          ) : (
            `生成我的专属方案 ${selectedTags.length > 0 ? `(${selectedTags.length})` : ''}`
          )}
        </Button>
        </div>
      </div>
    </div>
  )
}

export default function TagSelection() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">正在加载页面...</p>
        </div>
      </div>
    }>
      <TagSelectionContent />
    </Suspense>
  )
}
