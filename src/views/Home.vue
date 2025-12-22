<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <RobotOutlined />
        </div>
        <h1 class="hero-title">欢迎使用 AI Chat</h1>
        <p class="hero-description">
          一个智能的 AI 聊天助手，随时为你解答问题、提供帮助
        </p>
        <a-button type="primary" size="large" @click="goToChat">
          <template #icon><MessageOutlined /></template>
          开始聊天
        </a-button>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">功能特点</h2>
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="8" v-for="feature in features" :key="feature.title">
          <a-card hoverable class="feature-card">
            <template #cover>
              <div class="feature-icon" :style="{ background: feature.color }">
                <component :is="feature.icon" />
              </div>
            </template>
            <a-card-meta :title="feature.title" :description="feature.description" />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  RobotOutlined, 
  MessageOutlined, 
  ThunderboltOutlined,
  SafetyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const features = [
  {
    title: '智能对话',
    description: '基于先进的 AI 技术，提供自然流畅的对话体验',
    icon: RobotOutlined,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '快速响应',
    description: '毫秒级响应速度，让你的问题得到即时解答',
    icon: ThunderboltOutlined,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '安全可靠',
    description: '数据加密传输，保护你的隐私安全',
    icon: SafetyOutlined,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '历史记录',
    description: '保存聊天历史，随时回顾之前的对话内容',
    icon: ClockCircleOutlined,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: '多轮对话',
    description: '支持上下文理解，实现连贯的多轮对话',
    icon: MessageOutlined,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: '全天候服务',
    description: '7x24 小时在线，随时随地为你提供帮助',
    icon: ClockCircleOutlined,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
]

const goToChat = () => {
  router.push('/chat')
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 48px;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-icon {
  font-size: 64px;
  color: #fff;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 36px;
  color: #fff;
  margin-bottom: 16px;
  font-weight: 600;
}

.hero-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 32px;
  line-height: 1.6;
}

.features-section {
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 32px;
  color: #262626;
}

.feature-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.feature-icon {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #fff;
}

.feature-card :deep(.ant-card-meta-title) {
  font-size: 18px;
  font-weight: 600;
}

.feature-card :deep(.ant-card-meta-description) {
  color: #8c8c8c;
}
</style>

