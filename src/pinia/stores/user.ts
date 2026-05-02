import { setToken as _setToken, getToken, removeToken } from "@@/utils/local-storage"
import { pinia } from "@/pinia"
import { resetRouter } from "@/router"
import { routerConfig } from "@/router/config"
import { useSettingsStore } from "./settings"
import { useTagsViewStore } from "./tags-view"

const USER_INFO_KEY = "edu_user_info"

interface StoredUserInfo {
  userId: number
  loginUsername: string
  displayName: string
  roles: string[]
}

function getStoredUserInfo(): StoredUserInfo | null {
  try {
    const data = localStorage.getItem(USER_INFO_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function setStoredUserInfo(info: StoredUserInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

function removeStoredUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")

  const storedInfo = getStoredUserInfo()
  const roles = ref<string[]>(storedInfo?.roles || [])

  const userId = ref<number>(storedInfo?.userId || 0)
  const loginUsername = ref<string>(storedInfo?.loginUsername || "")
  const username = ref<string>(storedInfo?.displayName || "")

  const tagsViewStore = useTagsViewStore()

  const settingsStore = useSettingsStore()

  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }

  const setUserInfo = (info: { userId: number, loginUsername: string, displayName: string, roles: string[] }) => {
    userId.value = info.userId
    loginUsername.value = info.loginUsername
    username.value = info.displayName
    roles.value = info.roles
    setStoredUserInfo({
      userId: info.userId,
      loginUsername: info.loginUsername,
      displayName: info.displayName,
      roles: info.roles
    })
  }

  const getInfo = async () => {
    const storedInfo = getStoredUserInfo()
    if (storedInfo) {
      userId.value = storedInfo.userId
      loginUsername.value = storedInfo.loginUsername
      username.value = storedInfo.displayName
      roles.value = storedInfo.roles
    } else {
      roles.value = routerConfig.defaultRoles
    }
  }

  const changeRoles = (role: string) => {
    const newToken = `token-${role}`
    token.value = newToken
    _setToken(newToken)
    location.reload()
  }

  const logout = () => {
    removeToken()
    removeStoredUserInfo()
    token.value = ""
    roles.value = []
    userId.value = 0
    loginUsername.value = ""
    username.value = ""
    resetRouter()
    resetTagsView()
  }

  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }

  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return {
    token,
    roles,
    userId,
    loginUsername,
    username,
    setToken,
    setUserInfo,
    getInfo,
    changeRoles,
    logout,
    resetToken
  }
})

export function useUserStoreOutside() {
  return useUserStore(pinia)
}
