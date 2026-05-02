import { setToken as _setToken, getToken, removeToken } from "@@/utils/local-storage"
import { pinia } from "@/pinia"
import { resetRouter } from "@/router"
import { routerConfig } from "@/router/config"
import { useSettingsStore } from "./settings"
import { useTagsViewStore } from "./tags-view"

const USER_INFO_KEY = "edu_user_info"

function getStoredUserInfo() {
  try {
    const data = localStorage.getItem(USER_INFO_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function setStoredUserInfo(info: { username: string, roles: string[] }) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

function removeStoredUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")

  const storedInfo = getStoredUserInfo()
  const roles = ref<string[]>(storedInfo?.roles || [])

  const username = ref<string>(storedInfo?.username || "")

  const tagsViewStore = useTagsViewStore()

  const settingsStore = useSettingsStore()

  // 设置 Token
  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }

  // 设置用户信息（登录时调用）
  const setUserInfo = (info: { username: string, roles: string[] }) => {
    username.value = info.username
    setStoredUserInfo(info)
  }

  // 获取用户详情（从本地存储恢复）
  const getInfo = async () => {
    const storedInfo = getStoredUserInfo()
    if (storedInfo) {
      username.value = storedInfo.username
      roles.value = storedInfo.roles
    } else {
      // 如果没有存储的信息，使用默认角色
      roles.value = routerConfig.defaultRoles
    }
  }

  // 模拟角色变化
  const changeRoles = (role: string) => {
    const newToken = `token-${role}`
    token.value = newToken
    _setToken(newToken)
    // 用刷新页面代替重新登录
    location.reload()
  }

  // 登出
  const logout = () => {
    removeToken()
    removeStoredUserInfo()
    token.value = ""
    roles.value = []
    username.value = ""
    resetRouter()
    resetTagsView()
  }

  // 重置 Token
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }

  // 重置 Visited Views 和 Cached Views
  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, username, setToken, setUserInfo, getInfo, changeRoles, logout, resetToken }
})

/**
 * @description 在 SPA 应用中可用于在 pinia 实例被激活前使用 store
 * @description 在 SSR 应用中可用于在 setup 外使用 store
 */
export function useUserStoreOutside() {
  return useUserStore(pinia)
}
