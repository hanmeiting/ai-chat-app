import axios from 'axios'

// API 基础地址，可根据实际情况修改
const BASE_URL = '/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 发送聊天消息
 * @param {string} message - 用户消息
 * @param {Array} history - 历史消息记录
 * @returns {Promise}
 */
export const sendMessageApi = (message, filename, history = []) => {
  return request.post('/system/chat', {
    message,
    history,
    filename
  })
}



/**
 * 流式发送聊天消息
 * @param {string} message - 用户消息
 * @param {Array} history - 历史消息记录
 * @param {Function} onMessage - 接收消息回调
 * @param {Function} onError - 错误回调
 * @param {Function} onComplete - 完成回调
 */
export const sendMessageStream = async (message, history = [], onMessage, onError, onComplete) => {
  try {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, history })
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete && onComplete()
        break
      }
      const text = decoder.decode(value)
      onMessage && onMessage(text)
    }
  } catch (error) {
    onError && onError(error)
  }
}

/**
 * 上传单个文件
 * @param {File} file - 要上传的文件
 * @returns {Promise}
 */
export const uploadFile = (files) => {
  // 添加文件
  console.log(files)
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files`, file)
  })
  console.log(formData)
  return request.post('/system/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000 // 文件上传超时时间设置长
  })
}

export default request
