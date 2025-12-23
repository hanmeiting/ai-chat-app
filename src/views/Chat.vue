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
          <!-- 文档选择区域 -->
          <div class="document-section">
            <div class="document-header">
              <span class="document-title">
                <FileTextOutlined />
                选择文档
              </span>
              <a-upload
                :file-list="[]"
                :before-upload="handleBeforeUpload"
                :multiple="true"
                :show-upload-list="false"
              >
                <a-button type="primary" size="small" :loading="isUploading">
                  <template #icon><UploadOutlined /></template>
                  上传文档
                </a-button>
              </a-upload>
            </div>
            <div class="document-list">
              <a-spin :spinning="isLoadingDocuments">
                <div v-if="uploadedDocuments.length === 0" class="no-documents">
                  暂无已上传的文档，请先上传文档
                </div>
                <div v-else class="document-items">
                  <div
                    v-for="doc in uploadedDocuments"
                    :key="doc.filename"
                    class="document-item"
                    :class="{ selected: selectedDocument === doc.filename }"
                    @click="selectDocument(doc)"
                  >
                    <component :is="getDocumentIcon(doc.filename)" class="doc-icon" />
                    <span class="doc-name">{{ doc.filename }}</span>
                    <CheckCircleFilled v-if="selectedDocument === doc.filename" class="check-icon" />
                  </div>
                </div>
              </a-spin>
            </div>
          </div>

          <!-- 聊天消息区 -->
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="currentMessages.length === 0" class="empty-chat">
              <RobotOutlined class="empty-icon" />
              <p>开始和 AI 助手对话吧！</p>
              <p v-if="!selectedDocument" class="empty-tip">请先选择一个文档进行问答</p>
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
            <!-- 当前选中的文档提示 -->
            <div v-if="selectedDocument" class="selected-document-tip">
              <FileTextOutlined />
              <span>当前文档：{{ selectedDocumentName }}</span>
            </div>

            <!-- 输入框和操作按钮 -->
            <div class="chat-input-area">
              <a-textarea
                :value="inputMessage"
                @update:value="val => inputMessage = val"
                placeholder="输入你的问题..."
                :auto-size="{ minRows: 1, maxRows: 4 }"
                @keydown="handleKeyDown"
                :disabled="isLoading || !selectedDocument"
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
              <span v-if="!selectedDocument" class="warning-tip">请先选择一个文档</span>
              <span v-else>按 Enter 发送，Shift + Enter 换行</span>
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
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
  UploadOutlined,
  CheckCircleFilled
} from '@ant-design/icons-vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { sendMessageApi, uploadFile, getUploadedDocuments } from '@/api/chat'

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

// 文档相关状态
const uploadedDocuments = ref([])
const selectedDocument = ref(null)
const selectedDocumentName = ref('')
const isLoadingDocuments = ref(false)
const isUploading = ref(false)

// 当前会话的消息
const currentMessages = computed(() => {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  return session ? session.messages : []
})

// 是否可以发送（有文字且已选择文档）
const canSend = computed(() => {
  const hasInput = inputMessage.value && String(inputMessage.value).trim().length > 0
  const hasDocument = !!selectedDocument.value
  return hasInput && hasDocument
})

// 获取已上传的文档列表
const fetchDocuments = async () => {
  isLoadingDocuments.value = true
  try {
    const res = await getUploadedDocuments()
    // 根据接口返回格式处理数据
    uploadedDocuments.value = res.documents
  } catch (error) {
    console.error('获取文档列表失败:', error)
    message.error('获取文档列表失败')
    uploadedDocuments.value = []
  } finally {
    isLoadingDocuments.value = false
  }
}

// 选择文档
const selectDocument = (doc) => {
  selectedDocument.value = doc.filename
  selectedDocumentName.value = doc.filename
}

// 文件上传前处理
const handleBeforeUpload = (file) => {
  // 限制文件大小 100MB
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    message.error(`文件 ${file.name} 超过 100MB 限制`)
    return false
  }

  isUploading.value = true
  uploadFile([file])
    .then((res) => {
      message.success('文件上传成功')
      // 刷新文档列表
      fetchDocuments()
    })
    .catch(() => {
      message.error('文件上传失败')
    })
    .finally(() => {
      isUploading.value = false
    })
  return false // 阻止自动上传
}

// 获取文档图标
const getDocumentIcon = (filename) => {
  if (!filename) return FileOutlined
  const ext = filename.split('.').pop().toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return FileImageOutlined
  }
  if (ext === 'pdf') {
    return FilePdfOutlined
  }
  if (['doc', 'docx'].includes(ext)) {
    return FileWordOutlined
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return FileExcelOutlined
  }
  if (['txt', 'md', 'json', 'xml'].includes(ext)) {
    return FileTextOutlined
  }
  return FileOutlined
}

// 创建新会话
const createNewSession = () => {
  const newId = Date.now().toString()
  sessions.value.unshift({
    id: newId,
    title: '新对话',
    messages: []
  })
  currentSessionId.value = newId
}

// 切换会话
const switchSession = (id) => {
  currentSessionId.value = id
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

// 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()

  if (!content) return
  if (!selectedDocument.value) {
    message.warning('请先选择一个文档')
    return
  }
  if (isLoading.value) return

  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (!session) return

  // 更新会话标题
  if (session.messages.length === 0) {
    const title = content
    session.title = title.slice(0, 20) + (title.length > 20 ? '...' : '')
  }

  // 添加用户消息
  session.messages.push({
    role: 'user',
    content,
    time: new Date(),
    files: [{ name: selectedDocumentName.value }]
  })

  inputMessage.value = ''
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

    // 调用 API（使用选中的文档）
    const response = await sendMessageApi(content, selectedDocumentName.value, history)
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
  // 加载已上传的文档列表
  fetchDocuments()
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

/* 文档选择区域 */
.document-section {
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.document-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.document-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
}

.document-list {
  padding: 12px 16px;
  max-height: 120px;
  overflow-y: auto;
}

.no-documents {
  color: #8c8c8c;
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
}

.document-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 200px;
}

.document-item:hover {
  border-color: #667eea;
  background: #f5f5ff;
}

.document-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.doc-icon {
  font-size: 16px;
  color: #667eea;
  flex-shrink: 0;
}

.doc-name {
  font-size: 13px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-icon {
  font-size: 14px;
  color: #52c41a;
  flex-shrink: 0;
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

.empty-tip {
  margin-top: 8px;
  color: #faad14;
  font-size: 14px;
}

/* 输入区域包装 */
.chat-input-wrapper {
  border-top: 1px solid #f0f0f0;
}

/* 当前选中文档提示 */
.selected-document-tip {
  padding: 8px 16px;
  background: #f6ffed;
  border-bottom: 1px solid #b7eb8f;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #52c41a;
}

/* 输入区域 */
.chat-input-area {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
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
  justify-content: center;
  font-size: 12px;
  color: #bfbfbf;
}

.warning-tip {
  color: #faad14;
}
</style>
