import { NextRequest, NextResponse } from 'next/server'

// 定义方案的数据结构
interface Plan {
  id: number
  title: string
  image: string
  tags: string[]
  description: string
  duration: string
  budget: string
  transport: string
  timeline: Array<{
    time: string
    activity: string
  }>
}

// 定义AI请求的数据结构
interface AIRequest {
  tags: string[]
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求体中的标签
    const { tags }: AIRequest = await request.json()
    
    if (!tags || tags.length === 0) {
      return NextResponse.json(
        { error: '请提供至少一个标签' },
        { status: 400 }
      )
    }

    // 检查API密钥配置
    const apiKey = process.env.SILICONFLOW_API_KEY
    const apiUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.com/v1'

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.error('API密钥未配置或使用默认值')
      return NextResponse.json(
        { 
          error: 'API密钥未配置',
          message: '请在 .env.local 文件中配置 SILICONFLOW_API_KEY 环境变量',
          status: 'CONFIGURATION_REQUIRED'
        },
        { status: 500 }
      )
    }

    // 构建AI提示词
    const systemPrompt = `你是一位专业的成都聚会规划师，专门为18-30岁的年轻用户设计聚会方案。

请根据用户选择的标签，生成2个完全不同的聚会方案。每个方案必须包含以下内容：

1. 诱人标题：要有诗意和吸引力，体现成都特色
2. 诱惑文案：描述方案的核心亮点和体验感受
3. 详细流程：具体的时间安排和活动内容
4. 核心标签：3-4个相关标签
5. 关键信息：预计时长、人均消费、交通便利度

要求：
- 方案要真实可行，符合成都实际情况
- 文案要有感染力，能激发用户兴趣
- 时间安排要合理，考虑交通和活动时长
- 消费水平要适中，适合年轻人
- 每个方案都要有独特的亮点

请严格按照以下JSON格式返回：
{
  "plans": [
    {
      "title": "方案标题",
      "image": "对应的图片路径",
      "tags": ["#标签1", "#标签2", "#标签3"],
      "description": "方案描述文案",
      "duration": "预计时长",
      "budget": "人均消费",
      "transport": "交通便利度",
      "timeline": [
        {"time": "时间", "activity": "活动内容"}
      ]
    }
  ]
}`

    const userPrompt = `用户选择的标签：${tags.join('、')}

请根据这些标签，生成2个完全不同的成都聚会方案。确保推荐的地点、消费信息、体验感受等都符合成都实际情况，并严格按照系统提示中的JSON格式返回。`

    // 调用硅基流动API生成方案
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8,
        top_p: 0.9,
        stream: false,
        response_format: {
          type: "json_object"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API调用失败:', response.status, errorText)
      
      // 尝试解析错误信息
      let errorMessage = 'AI服务调用失败'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (e) {
        // 如果无法解析JSON，使用原始错误文本
        errorMessage = errorText || errorMessage
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: response.status,
          details: '请检查API密钥是否正确，或稍后重试'
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiContent = data.choices[0]?.message?.content

    if (!aiContent) {
      console.error('AI响应内容为空')
      return NextResponse.json(
        { error: 'AI响应格式错误' },
        { status: 500 }
      )
    }

    // 记录AI返回的原始内容用于调试
    console.log('AI返回的原始内容:', aiContent)

    // 解析AI返回的JSON内容
    let plans: Plan[]
    try {
      // 由于使用了response_format，AI应该返回标准JSON
      const parsed = JSON.parse(aiContent)
      plans = parsed.plans || []
      
      if (!Array.isArray(plans) || plans.length === 0) {
        console.error('AI返回的plans格式不正确:', parsed)
        return NextResponse.json(
          { error: 'AI返回的方案格式不正确' },
          { status: 500 }
        )
      }
      
      console.log('成功解析AI返回的方案:', plans.length, '个')
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      console.error('AI返回的原始内容:', aiContent)
      return NextResponse.json(
        { 
          error: 'AI响应解析失败',
          details: 'AI返回的内容不是有效的JSON格式',
          rawContent: aiContent.substring(0, 500) // 记录前500个字符用于调试
        },
        { status: 500 }
      )
    }

    // 验证和清理方案数据
    const validatedPlans = plans.map((plan, index) => ({
      id: index + 1,
      title: plan.title || `成都聚会方案${index + 1}`,
      image: getDefaultImage(tags),
      tags: plan.tags || ['#成都', '#聚会'],
      description: plan.description || '这是一个精心设计的成都聚会方案',
      duration: plan.duration || '3-4小时',
      budget: plan.budget || '¥150-200',
      transport: plan.transport || '便捷',
      timeline: plan.timeline || [
        { time: '19:00-20:30', activity: '享受晚餐时光' },
        { time: '20:30-22:00', activity: '体验特色活动' }
      ]
    }))

    return NextResponse.json({ plans: validatedPlans })

  } catch (error) {
    console.error('生成方案时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 根据标签选择合适的默认图片
function getDefaultImage(tags: string[]): string {
  const tagImages: { [key: string]: string } = {
    '美食': '/chengdu-street-cafe.png',
    '艺术': '/chengdu-taikoo-li-art.png',
    '夜生活': '/chengdu-yulin-bar.png',
    '文化': '/chengdu-teahouse.png',
    '现代': '/chengdu-taikoo-li-art-gallery.png',
    '复古': '/chengdu-yulin-road-vintage-bar.png'
  }

  for (const tag of tags) {
    if (tagImages[tag]) {
      return tagImages[tag]
    }
  }

  // 默认返回一个通用图片
  return '/placeholder.jpg'
} 