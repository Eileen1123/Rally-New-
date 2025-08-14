export default function PlanCards() {
  const samplePlans = [
    {
      id: 1,
      title: "在玉林路的尽头，寻找成都的慢生活",
      image: "/chengdu-yulin-road-vintage-bar.png",
      tags: ["#复古", "#微醺", "#私密二人"],
      description: "你们都喜欢王家卫，所以为你推荐了这个藏在居民楼里的复古酒吧...",
    },
    {
      id: 2,
      title: "太古里的艺术漫步，邂逅文艺成都",
      image: "/chengdu-taikoo-li-art-gallery.png",
      tags: ["#文艺", "#现代", "#都市"],
      description: "从当代艺术展到精品咖啡，在城市中心感受成都的另一面...",
    },
    {
      id: 3,
      title: "宽窄巷子的茶香时光，品味老成都",
      image: "/chengdu-teahouse.png",
      tags: ["#传统", "#茶文化", "#悠闲"],
      description: "在百年茶馆里，听一段川剧，品一壶好茶，感受最地道的成都味道...",
    },
  ]

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">精选方案预览</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">看看其他人都在体验什么样的精彩周末</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samplePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
            >
              <img src={plan.image || "/placeholder.svg"} alt={plan.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">{plan.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {plan.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
