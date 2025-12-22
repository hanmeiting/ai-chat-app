<template>
  <div class="chat-message" :class="{ 'is-user': isUser }">
    <div class="message-avatar">
      <a-avatar :style="avatarStyle" :size="40">
        <template #icon>
          <UserOutlined v-if="isUser" />
          <RobotOutlined v-else />
        </template>
      </a-avatar>
    </div>
    <div class="message-content">
      <div class="message-role">{{ isUser ? '你' : 'AI 助手' }}</div>
      
      <!-- 文件附件显示 -->
      <div v-if="files && files.length > 0" class="message-files">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="message-file-item"
        >
          <component :is="getFileIcon(file)" class="file-icon" />
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 消息文本 -->
      <div v-if="content || loading" class="message-text">
        <span v-if="loading" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <template v-else>{{ content }}</template>
      </div>
      
      <div class="message-time">{{ formatTime(time) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  UserOutlined,
  RobotOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (val) => ['user', 'assistant'].includes(val)
  },
  content: {
    type: String,
    default: ''
  },
  time: {
    type: [Date, String, Number],
    default: () => new Date()
  },
  loading: {
    type: Boolean,
    default: false
  },
  files: {
    type: Array,
    default: () => []
  }
})

const isUser = computed(() => props.role === 'user')

const avatarStyle = computed(() => ({
  backgroundColor: isUser.value ? '#1890ff' : '#52c41a'
}))

const formatTime = (time) => {
  const date = new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 获取文件图标
const getFileIcon = (file) => {
  const ext = file.name.split('.').pop().toLowerCase()
  const type = file.type || ''

  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return FileImageOutlined
  }
  if (type === 'application/pdf' || ext === 'pdf') {
    return FilePdfOutlined
  }
  if (type.includes('word') || ['doc', 'docx'].includes(ext)) {
    return FileWordOutlined
  }
  if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx'].includes(ext)) {
    return FileExcelOutlined
  }
  if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml'].includes(ext)) {
    return FileTextOutlined
  }
  return FileOutlined
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  max-width: 80%;
}

.chat-message.is-user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.is-user .message-content {
  align-items: flex-end;
}

.message-role {
  font-size: 12px;
  color: #8c8c8c;
}

/* 文件附件样式 */
.message-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}

.message-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  max-width: 240px;
}

.is-user .message-file-item {
  background: rgba(255, 255, 255, 0.15);
}

.file-icon {
  font-size: 20px;
  color: #1890ff;
  flex-shrink: 0;
}

.is-user .file-icon {
  color: rgba(255, 255, 255, 0.85);
}

.file-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-name {
  font-size: 13px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-user .file-name {
  color: #fff;
}

.file-size {
  font-size: 11px;
  color: #8c8c8c;
}

.is-user .file-size {
  color: rgba(255, 255, 255, 0.65);
}

/* 消息文本样式 */
.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.is-user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message-time {
  font-size: 11px;
  color: #bfbfbf;
}

/* 打字指示器动画 */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #8c8c8c;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
