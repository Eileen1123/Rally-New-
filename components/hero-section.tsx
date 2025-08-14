"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const router = useRouter()

  return (
    <div className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/chengdu-street-cafe.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-4">
          告别选择困难，
          <br />
          即刻拥有完美周末
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md mb-8 leading-relaxed">
          AI 帮你告别规划烦恼，发现成都的城市惊喜。让每一次约会都成为难忘的回忆。
        </p>
        <Button
          onClick={() => router.push("/tags")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          开启我的灵感之旅
        </Button>
      </div>
    </div>
  )
}
