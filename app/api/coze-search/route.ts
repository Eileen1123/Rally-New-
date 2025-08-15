import { NextRequest, NextResponse } from 'next/server'

// 定义Coze API请求的数据结构
interface CozeRequest {
  tags: string[]
}

// 定义Coze API响应的数据结构
interface CozeResponse {
  success: boolean
  data?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求体中的标签
    const { tags }: CozeRequest = await request.json()
    
    if (!tags || tags.length === 0) {
      return NextResponse.json(
        { error: '请提供至少一个标签' },
        { status: 400 }
      )
    }

    // 构建搜索关键词
    const searchKeywords = tags.map(tag => `${tag} 成都`).join('、')
    const searchPrompt = `请搜索关于${searchKeywords}的小红书笔记，重点关注：
1. 用户推荐的具体地点和店铺
2. 真实的体验感受和评价
3. 消费水平和性价比信息
4. 交通便利性和周边环境
5. 适合聚会的特色亮点

请返回3-5条最相关的笔记内容，包含地点名称、用户评价、消费信息等。`

    // 获取Coze API配置
    const cozeApiKey = process.env.COZE_API_KEY
    const workflowId = process.env.COZE_WORKFLOW_ID
    const botId = process.env.COZE_BOT_ID

    if (!cozeApiKey || !workflowId || !botId) {
      return NextResponse.json(
        { error: 'Coze API配置不完整' },
        { status: 500 }
      )
    }

    // 第一步：发起会话（非流式）
    const startResponse = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: `web-user-${Date.now()}`, // 生成唯一用户ID
        stream: false, // 关键：非流式
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: searchPrompt,
            content_type: 'text'
          }
        ]
      })
    })

    if (!startResponse.ok) {
      const errorText = await startResponse.text()
      console.error('Coze会话发起失败:', errorText)
      return NextResponse.json(
        { error: '小红书搜索服务调用失败' },
        { status: 500 }
      )
    }

    const startData = await startResponse.json()
    const chatId = startData?.data?.id

    if (!chatId) {
      console.error('未获取到chat_id:', startData)
      return NextResponse.json(
        { error: '小红书搜索服务响应异常' },
        { status: 500 }
      )
    }

    // 第二步：轮询获取最终结果
    let searchResults = ''
    let retryCount = 0
    const maxRetries = 10

    while (retryCount < maxRetries) {
      try {
        const detailResponse = await fetch(`https://api.coze.cn/v3/chat/retrieve?id=${chatId}`, {
          headers: {
            'Authorization': `Bearer ${cozeApiKey}`,
            'Accept': 'application/json'
          }
        })

        if (!detailResponse.ok) {
          console.error(`轮询失败 (${retryCount + 1}/${maxRetries}):`, await detailResponse.text())
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒后重试
          continue
        }

        const detailData = await detailResponse.json()
        
        // 检查是否完成
        if (detailData?.data?.status === 'completed') {
          // 获取消息内容
          const messageResponse = await fetch(`https://api.coze.cn/v3/chat/message/list?conversation_id=${detailData.data.conversation_id}`, {
            headers: {
              'Authorization': `Bearer ${cozeApiKey}`,
              'Accept': 'application/json'
            }
          })

          if (messageResponse.ok) {
            const messageData = await messageResponse.json()
            if (messageData?.data?.messages && messageData.data.messages.length > 0) {
              // 获取最后一条消息作为搜索结果
              const lastMessage = messageData.data.messages[messageData.data.messages.length - 1]
              searchResults = lastMessage.content || ''
              break
            }
          }
        } else if (detailData?.data?.status === 'failed') {
          console.error('Coze会话执行失败:', detailData)
          break
        }

        // 如果还没完成，等待后重试
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`轮询出错 (${retryCount + 1}/${maxRetries}):`, error)
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    if (!searchResults) {
      console.error('小红书搜索超时或失败')
      return NextResponse.json(
        { error: '小红书搜索超时，请重试' },
        { status: 500 }
      )
    }

    if (!searchResults) {
      return NextResponse.json(
        { error: '未获取到有效的搜索结果' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: {
        searchResults,
        keywords: searchKeywords,
        tags: tags
      }
    })

  } catch (error) {
    console.error('小红书搜索时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
