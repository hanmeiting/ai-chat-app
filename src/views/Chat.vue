<template>
  <div class="chat-page">
    <a-row :gutter="24" class="chat-container">
      <!-- 左侧会话列表 -->
      <a-col :xs="0" :sm="0" :md="6" :lg="5">
        <div class="session-panel">
          <div class="session-header">
            <span>会话列表</span>
            <a-button type="primary" size="small" @click="createNewSession">
              <template #icon><PlusOutlined /></template>
              新建
            </a-button>
          </div>
          <div class="session-list">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="session-item"
              :class="{ active: currentSessionId === session.id }"
              @click="switchSession(session.id)"
            >
              <MessageOutlined />
              <span class="session-title">{{ session.title }}</span>
              <a-button
                type="text"
                size="small"
                danger
                class="delete-btn"
                @click.stop="deleteSession(session.id)"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
          </div>
        </div>
      </a-col>

      <!-- 右侧聊天区域 -->
      <a-col :xs="24" :sm="24" :md="18" :lg="19" class="overflow-hidden h-full">
        <div class="chat-panel overflow-hidden">
          <!-- 聊天消息区 -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="currentMessages.length === 0" class="empty-chat">
              <RobotOutlined class="empty-icon" />
              <p>开始和 AI 助手对话吧！</p>
            </div>
            <ChatMessage
              v-for="(msg, index) in currentMessages"
              :key="index"
              :role="msg.role"
              :content="msg.content"
              :time="msg.time"
              :loading="msg.loading"
              :files="msg.files"
            />
          </div>

          <!-- 输入区域 -->
          <div class="chat-input-wrapper">
            <!-- 已选择的文件列表 -->
            <div v-if="selectedFiles.length > 0" class="selected-files">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="file-item"
              >
                <div class="file-info">
                  <component :is="getFileIcon(file)" class="file-icon" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <a-button
                  type="text"
                  size="small"
                  danger
                  @click="removeFile(index)"
                >
                  <template #icon><CloseOutlined /></template>
                </a-button>
              </div>
            </div>

            <!-- 输入框和操作按钮 -->
            <div class="chat-input-area">
              <a-upload
                :file-list="[]"
                :before-upload="handleBeforeUpload"
                :multiple="true"
                :show-upload-list="false"
              >
                <a-button type="text" class="upload-btn" :disabled="isLoading">
                  <template #icon><PaperClipOutlined /></template>
                </a-button>
              </a-upload>
              <a-textarea
                v-model:value="inputMessage"
                placeholder="输入你的问题..."
                :auto-size="{ minRows: 1, maxRows: 4 }"
                @keydown="handleKeyDown"
                :disabled="isLoading"
                class="message-input"
              />
              <a-button
                type="primary"
                :loading="isLoading"
                :disabled="!canSend"
                @click="sendMessage"
              >
                <template #icon><SendOutlined /></template>
                发送
              </a-button>
            </div>

            <!-- 提示信息 -->
            <div class="input-tips">
              <span>支持上传图片、文档等文件</span>
              <span>按 Enter 发送，Shift + Enter 换行</span>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  MessageOutlined,
  DeleteOutlined,
  SendOutlined,
  RobotOutlined,
  PaperClipOutlined,
  CloseOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined
} from '@ant-design/icons-vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { sendMessageApi, uploadFile } from '@/api/chat'

// 会话列表
const sessions = ref([
  {
    id: '1',
    title: '新对话',
    messages: []
  }
])

const currentSessionId = ref('1')
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const selectedFiles = ref([])

// 当前会话的消息
const currentMessages = computed(() => {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  return session ? session.messages : []
})

// 是否可以发送（有文字或有文件）
const canSend = computed(() => {
  return inputMessage.value.trim() || selectedFiles.value.length > 0
})

// 创建新会话
const createNewSession = () => {
  const newId = Date.now().toString()
  sessions.value.unshift({
    id: newId,
    title: '新对话',
    messages: []
  })
  currentSessionId.value = newId
  // 清空已选文件
  selectedFiles.value = []
}

// 切换会话
const switchSession = (id) => {
  currentSessionId.value = id
  // 清空已选文件
  selectedFiles.value = []
}

// 删除会话
const deleteSession = (id) => {
  if (sessions.value.length === 1) {
    message.warning('至少保留一个会话')
    return
  }
  const index = sessions.value.findIndex(s => s.id === id)
  sessions.value.splice(index, 1)
  if (currentSessionId.value === id) {
    currentSessionId.value = sessions.value[0].id
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 文件上传前处理
const filename = ref('')
const handleBeforeUpload = (file) => {
  // 限制文件大小 20MB
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    message.error(`文件 ${file.name} 超过 100MB 限制`)
    return false
  }

  // 限制文件数量
  if (selectedFiles.value.length >= 5) {
    message.warning('最多只能上传 5 个文件')
    return false
  }

  selectedFiles.value.push(file)
  uploadFile(selectedFiles.value)
    .then((res) => {
      message.success('文件上传成功')
      console.log(res)
      filename.value = res.filename
      console.log(filename.value)
    })
    .catch(() => {
      message.error('文件上传失败')
    })
  return false // 阻止自动上传
}

// 移除已选文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
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

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  const files = [...selectedFiles.value]

  if (!content && files.length === 0) return
  if (isLoading.value) return

  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session) return

  // 更新会话标题
  if (session.messages.length === 0) {
    const title = content || `上传了 ${files.length} 个文件`
    session.title = title.slice(0, 20) + (title.length > 20 ? '...' : '')
  }

  // 构建文件信息用于显示
  const fileInfos = files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.type
  }))

  // 添加用户消息
  session.messages.push({
    role: 'user',
    content,
    time: new Date(),
    files: fileInfos
  })

  inputMessage.value = ''
  selectedFiles.value = []
  scrollToBottom()

  // 添加 AI 加载状态消息
  session.messages.push({
    role: 'assistant',
    content: '',
    time: new Date(),
    loading: true
  })

  isLoading.value = true
  scrollToBottom()

  try {
    // 构建历史消息
    const history = session.messages
      .filter(m => !m.loading)
      .map(m => ({
        role: m.role,
        content: m.content
      }))

    // 调用 API（带文件）
    const response = await sendMessageApi(content, '注意力既是一切.docx', history)
    // 更新 AI 回复
    const lastMessage = session.messages[session.messages.length - 1]
    lastMessage.loading = false  
    lastMessage.content = response
    lastMessage.time = new Date()
  } catch (error) {
    isLoading.value = false
    const lastMessage = session.messages[session.messages.length - 1]
    lastMessage.loading = false  
    lastMessage.content = error.message || '抱歉，我没有理解你的问题。'
    lastMessage.time = new Date()
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 初始化
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - 64px - 48px);
}

.chat-container {
  height: 100%;
}

/* 会话列表面板 */
.session-panel {
  height: 100%;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  background: #f5f5f5;
}

.session-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.session-item.active .delete-btn {
  color: rgba(255, 255, 255, 0.85);
}

/* 聊天面板 */
.chat-panel {
  height: 100%;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  background: #fafafa;
}

.empty-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

/* 输入区域包装 */
.chat-input-wrapper {
  border-top: 1px solid #f0f0f0;
}

/* 已选文件列表 */
.selected-files {
  padding: 12px 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  max-width: 200px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.file-icon {
  font-size: 16px;
  color: #1890ff;
  flex-shrink: 0;
}

.file-name {
  font-size: 12px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
}

/* 输入区域 */
.chat-input-area {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.upload-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn:hover {
  background: #f5f5f5;
}

.message-input {
  flex: 1;
  border-radius: 8px;
  resize: none;
}

.chat-input-area .ant-btn-primary {
  height: 40px;
  border-radius: 8px;
}

/* 提示信息 */
.input-tips {
  padding: 0 16px 12px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #bfbfbf;
}
</style>
