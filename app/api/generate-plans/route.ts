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

// 定义AI响应的数据结构
interface AIResponse {
  plans: Plan[]
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

    // 第一步：调用小红书搜索API获取相关信息
    let xiaohongshuInfo = ''
    try {
      const searchResponse = await fetch(`${request.nextUrl.origin}/api/coze-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.success && searchData.data.searchResults) {
          xiaohongshuInfo = searchData.data.searchResults
          console.log('小红书搜索成功，获取到相关信息')
        }
      }
    } catch (searchError) {
      console.error('小红书搜索失败，继续使用AI生成:', searchError)
      // 搜索失败不影响后续流程
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

请以JSON格式返回，格式如下：
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

${xiaohongshuInfo ? `小红书相关推荐信息：
${xiaohongshuInfo}

请基于以上小红书用户的真实分享和推荐，结合用户选择的标签，生成2个完全不同的成都聚会方案。确保推荐的地点、消费信息、体验感受等都基于真实用户反馈。` : '请根据这些标签，生成2个完全不同的成都聚会方案。'}`

    // 调用硅基流动API生成方案
    const apiKey = process.env.SILICONFLOW_API_KEY
    const apiUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.com/v1'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      )
    }

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
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API调用失败:', errorText)
      return NextResponse.json(
        { error: 'AI服务调用失败' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiContent = data.choices[0]?.message?.content

    if (!aiContent) {
      return NextResponse.json(
        { error: 'AI响应格式错误' },
        { status: 500 }
      )
    }

    // 解析AI返回的JSON内容
    let plans: Plan[]
    try {
      // 尝试直接解析
      const parsed = JSON.parse(aiContent)
      plans = parsed.plans || []
    } catch (parseError) {
      // 如果解析失败，尝试提取JSON部分
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          plans = parsed.plans || []
        } catch (secondError) {
          console.error('JSON解析失败:', secondError)
          return NextResponse.json(
            { error: 'AI响应解析失败' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'AI响应中未找到有效JSON' },
          { status: 500 }
        )
      }
    }

    // 为每个方案生成对应的AI图片
    const validatedPlans = await Promise.all(plans.map(async (plan, index) => {
      try {
        // 生成图片提示词
        const imagePrompt = generateImagePrompt(plan, tags)
        
        // 调用AI图片生成API
        const imageResponse = await fetch(`${apiUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'Kwai-Kolors/Kolors',
            prompt: imagePrompt,
            image_size: '1024x1024',
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            negative_prompt: '模糊, 低质量, 扭曲, 不完整'
          })
        })

        let imageUrl = plan.image || getDefaultImage(tags)
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          if (imageData.images && imageData.images.length > 0) {
            // 注意：硅基流动的图片URL有效期只有1小时
            // 这里我们返回图片数据，前端需要及时处理
            imageUrl = imageData.images[0].url || plan.image || getDefaultImage(tags)
          }
        }

        return {
          id: index + 1,
          title: plan.title || `成都聚会方案${index + 1}`,
          image: imageUrl,
          tags: plan.tags || ['#成都', '#聚会'],
          description: plan.description || '这是一个精心设计的成都聚会方案',
          duration: plan.duration || '3-4小时',
          budget: plan.budget || '¥150-200',
          transport: plan.transport || '便捷',
          timeline: plan.timeline || [
            { time: '19:00-20:30', activity: '享受晚餐时光' },
            { time: '20:30-22:00', activity: '体验特色活动' }
          ]
        }
      } catch (error) {
        console.error(`生成方案${index + 1}的图片时出错:`, error)
        // 如果图片生成失败，使用默认图片
        return {
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
        }
      }
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

// 生成图片提示词
function generateImagePrompt(plan: any, tags: string[]): string {
  // 根据方案内容和标签生成合适的图片提示词
  const basePrompt = '成都, 高质量, 现代摄影风格, 4K分辨率, 非人像, 背景图, 无文字'
  
  // 根据标签添加特定描述
  let tagDescription = ''
  if (tags.includes('美食')) tagDescription += ', 美食场景, 餐厅环境'
  if (tags.includes('艺术')) tagDescription += ', 艺术氛围, 画廊空间'
  if (tags.includes('夜生活')) tagDescription += ', 夜晚场景, 酒吧环境'
  if (tags.includes('文化')) tagDescription += ', 传统文化, 茶馆环境'
  if (tags.includes('现代')) tagDescription += ', 现代建筑, 都市风格'
  if (tags.includes('复古')) tagDescription += ', 复古风格, 怀旧氛围'
  if (tags.includes('浪漫')) tagDescription += ', 浪漫氛围, 温馨环境'
  if (tags.includes('文艺')) tagDescription += ', 文艺气息, 创意空间'
  
  // 根据方案标题添加描述
  let titleDescription = ''
  if (plan.title) {
    if (plan.title.includes('玉林路')) titleDescription += ', 玉林路街道, 成都特色街区'
    if (plan.title.includes('太古里')) titleDescription += ', 太古里商圈, 现代商业区'
    if (plan.title.includes('宽窄巷子')) titleDescription += ', 宽窄巷子, 传统街区'
    if (plan.title.includes('慢生活')) titleDescription += ', 悠闲生活, 慢节奏'
  }
  
  return `${basePrompt}${tagDescription}${titleDescription}, 聚会场景, 年轻人, 时尚, 精美构图`
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
