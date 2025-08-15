"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart, Share2, RefreshCw, Clock, DollarSign, MapPin } from "lucide-react"

export default function PlanGeneration() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("正在唤醒成都的文艺基因...")
  const [plans, setPlans] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadingTexts = ["正在唤醒成都的文艺基因...", "为你匹配最搭的 BGM...", "寻找隐藏的宝藏地点...", "灵感即将抵达！"]

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const tagsParam = searchParams.get('tags')
        
        if (tagsParam) {
          // 如果有标签参数，调用AI生成方案
          const tags = JSON.parse(decodeURIComponent(tagsParam))
          
          // 显示AI生成中的加载状态
          let textIndex = 0
          const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length
            setLoadingText(loadingTexts[textIndex])
          }, 1500)

          // 调用API生成方案
          const response = await fetch('/api/generate-plans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tags }),
          })

          clearInterval(textInterval)

          if (!response.ok) {
            throw new Error('生成方案失败')
          }

          const data = await response.json()
          setPlans(data.plans)
          setIsLoading(false)
        } else {
          // 如果没有标签参数，使用默认方案
          setPlans(defaultPlans)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('获取方案时出错:', error)
        setError('获取方案失败，请重试')
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [searchParams])

  // 默认方案数据
  const defaultPlans = [

    {
      id: 1,
      title: "在玉林路的尽头，寻找成都的慢生活",
      image: "/chengdu-yulin-bar.png",
      tags: ["#复古", "#微醺", "#私密二人"],
      description:
        "你们都喜欢王家卫，所以为你推荐了这个藏在居民楼里的复古酒吧。昏黄的灯光，慵懒的爵士乐，还有那杯特调的威士忌，让时光在这里慢下来。",
      duration: "3小时",
      budget: "¥150",
      transport: "便捷",
      timeline: [
        { time: "19:00-20:30", activity: "在「慢生活餐吧」享受晚餐，品尝川菜与红酒的完美搭配" },
        { time: "20:30-21:00", activity: "沿着玉林路慢慢散步，感受成都夜晚的烟火气" },
        { time: "21:00-23:00", activity: "在「时光酒馆」享受特调鸡尾酒，听老板讲述这条街的故事" },
      ],
    },
    {
      id: 2,
      title: "太古里的艺术漫步，邂逅文艺成都",
      image: "/chengdu-taikoo-li-art.png",
      tags: ["#文艺", "#现代", "#都市"],
      description:
        "从当代艺术展到精品咖啡，在城市中心感受成都的另一面。现代与传统在这里交融，每一个转角都可能遇见惊喜。",
      duration: "4小时",
      budget: "¥200",
      transport: "地铁直达",
      timeline: [
        { time: "14:00-15:30", activity: "参观「当代艺术馆」最新展览，感受艺术的力量" },
        { time: "15:30-16:30", activity: "在「%Arabica」品尝精品咖啡，享受午后时光" },
        { time: "16:30-18:00", activity: "逛太古里精品店，寻找独特的设计师作品" },
      ],
    },
  ]

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600 animate-pulse font-medium">{loadingText}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">出错了</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/tags')} className="bg-orange-500 hover:bg-orange-600">
            重新选择标签
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">为你量身定制</h1>
          <p className="text-gray-600">
            {searchParams.get('tags') 
              ? '基于你选择的标签，AI为你生成了专属方案' 
              : '基于你的喜好，我们为你准备了两个精彩方案'
            }
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-8">
          {plans.map((plan, index) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                              <img 
                  src={plan.image || "/placeholder.svg"} 
                  alt={plan.title} 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    // 如果AI生成的图片加载失败，使用默认图片
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.jpg"
                  }}
                />

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{plan.title}</h2>

                <div className="flex flex-wrap gap-2 mb-4">
                  {plan.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{plan.description}</p>

                {/* Key Info */}
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                    </div>
                    <p className="font-bold text-gray-900">{plan.duration}</p>
                    <p className="text-xs text-gray-500">预计时长</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                    </div>
                    <p className="font-bold text-gray-900">{plan.budget}</p>
                    <p className="text-xs text-gray-500">人均消费</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                    </div>
                    <p className="font-bold text-gray-900">{plan.transport}</p>
                    <p className="text-xs text-gray-500">交通指数</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">详细流程</h3>
                  <div className="space-y-4">
                    {plan.timeline.map((item, timeIndex) => (
                      <div key={timeIndex} className="flex gap-4">
                        <span className="font-bold text-orange-600 min-w-[80px] text-sm">{item.time}</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{item.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    <Heart className="w-4 h-4 mr-2" />
                    保存方案
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    分享给好友
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 text-center space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push("/tags")}
            className="border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {searchParams.get('tags') ? '重新选择标签' : '换一批方案'}
          </Button>
        </div>
      </div>
    </div>
  )
}
