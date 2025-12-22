<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="app-layout">
      <a-layout-header class="app-header">
        <div class="logo">
          <RobotOutlined />
          <span>AI Chat</span>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="horizontal"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-layout-header>
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RobotOutlined, HomeOutlined, MessageOutlined } from '@ant-design/icons-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const router = useRouter()
const route = useRoute()

const selectedKeys = ref([route.name])

const menuItems = [
  {
    key: 'Home',
    icon: () => h(HomeOutlined),
    label: '首页'
  },
  {
    key: 'Chat',
    icon: () => h(MessageOutlined),
    label: 'AI 聊天'
  }
]

import { h } from 'vue'

const handleMenuClick = ({ key }) => {
  router.push({ name: key })
}

watch(
  () => route.name,
  (name) => {
    selectedKeys.value = [name]
  }
)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

.app-layout {
  min-height: 100%;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}

.app-header .ant-menu {
  flex: 1;
  min-width: 0;
  background: transparent;
}

.app-content {
  padding: 24px;
  background: #f5f5f5;
}
</style>

