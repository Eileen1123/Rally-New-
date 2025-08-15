# 环境变量配置说明

## 问题描述
如果你遇到"生成方案失败"的错误，通常是因为环境变量没有正确配置。

## 解决步骤

### 1. 创建环境变量文件
在项目根目录创建 `.env.local` 文件：

```bash
# Windows PowerShell
New-Item -Path ".env.local" -ItemType File

# 或者手动创建文件
```

### 2. 配置必要的环境变量
在 `.env.local` 文件中添加以下内容：

```env
# 硅基流动 API 配置
SILICONFLOW_API_KEY=你的实际API密钥
SILICONFLOW_API_URL=https://api.siliconflow.com/v1
```

### 3. 获取API密钥
- 访问 [硅基流动官网](https://www.siliconflow.com/) 注册账号
- 在控制台中获取API密钥
- 将密钥填入 `SILICONFLOW_API_KEY` 字段

### 4. 重启开发服务器
配置完成后，重启开发服务器：

```bash
npm run dev
# 或
pnpm dev
```

## 注意事项
- `.env.local` 文件不会被提交到Git仓库（已在.gitignore中配置）
- 请妥善保管你的API密钥，不要泄露给他人
- 如果使用免费版API，可能有调用次数限制

## 常见问题
1. **API密钥未配置**: 确保 `.env.local` 文件存在且包含正确的API密钥
2. **网络连接问题**: 检查网络连接是否正常
3. **API配额超限**: 检查API账户的调用配额是否充足

## 测试配置
配置完成后，访问 `/tags` 页面选择标签，然后点击生成方案来测试API是否正常工作。

## 功能说明
- 用户选择标签后，系统会直接调用硅基流动AI API生成聚会方案
- 生成的方案包含标题、描述、时间安排、消费预算等详细信息
- 系统会根据标签自动选择合适的默认图片 