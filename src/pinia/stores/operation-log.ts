import type { OperationLog, OperationLogAction } from "@@/composables/useOperationLog"
import { generateId } from "@@/composables/useOperationLog"
import { addOperationLog, clearOperationLogs, getOperationLogs } from "@@/utils/local-storage"
import dayjs from "dayjs"
import { pinia } from "@/pinia"
import { useUserStore } from "./user"

export const useOperationLogStore = defineStore("operationLog", () => {
  const logs = ref<OperationLog[]>(getOperationLogs())

  const userStore = useUserStore()

  function recordLog(options: {
    module: string
    action: OperationLogAction
    description: string
    details?: Record<string, unknown>
  }) {
    const log: OperationLog = {
      id: generateId(),
      username: userStore.username || "未知用户",
      module: options.module,
      action: options.action,
      description: options.description,
      details: options.details,
      ip: "",
      userAgent: navigator.userAgent,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }
    addOperationLog(log)
    logs.value = getOperationLogs()
  }

  function clearLogs() {
    clearOperationLogs()
    logs.value = []
  }

  function getLogsByUser(username: string) {
    return computed(() => logs.value.filter(log => log.username === username))
  }

  function getLogsByModule(module: string) {
    return computed(() => logs.value.filter(log => log.module === module))
  }

  function getLogsByAction(action: OperationLogAction) {
    return computed(() => logs.value.filter(log => log.action === action))
  }

  return {
    logs,
    recordLog,
    clearLogs,
    getLogsByUser,
    getLogsByModule,
    getLogsByAction
  }
})

export function useOperationLogStoreOutside() {
  return useOperationLogStore(pinia)
}
