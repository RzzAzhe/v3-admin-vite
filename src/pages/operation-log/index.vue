<script lang="ts" setup>
import type { OperationLog, OperationLogAction } from "@@/composables/useOperationLog"
import { usePagination } from "@@/composables/usePagination"
import { computed, watch } from "vue"
import { useOperationLogStore } from "@/pinia/stores/operation-log"

defineOptions({
  name: "OperationLog"
})

const operationLogStore = useOperationLogStore()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const searchFormRef = useTemplateRef("searchFormRef")

const searchData = reactive({
  username: "",
  module: "",
  action: "" as OperationLogAction | ""
})

const actionOptions = [
  { value: "", label: "全部" },
  { value: "create", label: "新增" },
  { value: "update", label: "修改" },
  { value: "delete", label: "删除" },
  { value: "view", label: "查看" },
  { value: "login", label: "登录" },
  { value: "logout", label: "登出" },
  { value: "export", label: "导出" },
  { value: "import", label: "导入" }
]

const moduleOptions = computed(() => {
  const modules = new Set<string>()
  operationLogStore.logs.forEach(log => modules.add(log.module))
  return [
    { value: "", label: "全部" },
    ...Array.from(modules).map(m => ({ value: m, label: m }))
  ]
})

const userOptions = computed(() => {
  const users = new Set<string>()
  operationLogStore.logs.forEach(log => users.add(log.username))
  return [
    { value: "", label: "全部" },
    ...Array.from(users).map(u => ({ value: u, label: u }))
  ]
})

const filteredLogs = computed(() => {
  return operationLogStore.logs.filter((log) => {
    const matchUsername = !searchData.username || log.username === searchData.username
    const matchModule = !searchData.module || log.module === searchData.module
    const matchAction = !searchData.action || log.action === searchData.action
    return matchUsername && matchModule && matchAction
  })
})

const pagedLogs = computed(() => {
  const start = (paginationData.currentPage - 1) * paginationData.pageSize
  const end = start + paginationData.pageSize
  return filteredLogs.value.slice(start, end)
})

watch(filteredLogs, (newLogs) => {
  paginationData.total = newLogs.length
})

paginationData.total = operationLogStore.logs.length

const actionMap: Record<string, { label: string, type: "success" | "warning" | "danger" | "info" | "primary" }> = {
  create: { label: "新增", type: "success" },
  update: { label: "修改", type: "warning" },
  delete: { label: "删除", type: "danger" },
  view: { label: "查看", type: "info" },
  login: { label: "登录", type: "primary" },
  logout: { label: "登出", type: "info" },
  export: { label: "导出", type: "success" },
  import: { label: "导入", type: "warning" }
}

function getActionInfo(action: string) {
  return actionMap[action] || { label: action, type: "info" as const }
}

function formatDetails(details: OperationLog["details"]) {
  if (!details) return "-"
  try {
    return JSON.stringify(details, null, 2)
  } catch {
    return String(details)
  }
}

function handleSearch() {
  paginationData.currentPage = 1
}

function resetSearch() {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function handleClearLogs() {
  ElMessageBox.confirm("确定要清空所有操作日志吗？此操作不可恢复。", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    operationLogStore.clearLogs()
    ElMessage.success("操作日志已清空")
  })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="用户名" prop="username">
          <el-select v-model="searchData.username" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模块" prop="module">
          <el-select v-model="searchData.module" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in moduleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作" prop="action">
          <el-select v-model="searchData.action" placeholder="请选择" clearable style="width: 120px">
            <el-option
              v-for="item in actionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-tag type="info">
            共 {{ filteredLogs.length }} 条记录
          </el-tag>
        </div>
        <div>
          <el-button type="danger" @click="handleClearLogs">
            清空日志
          </el-button>
        </div>
      </div>

      <el-table :data="pagedLogs" stripe border>
        <el-table-column prop="timestamp" label="操作时间" width="180" align="center" fixed="left" />
        <el-table-column prop="username" label="操作用户" width="120" align="center" />
        <el-table-column prop="module" label="操作模块" width="120" align="center" />
        <el-table-column prop="action" label="操作类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getActionInfo(scope.row.action).type" effect="plain" size="small">
              {{ getActionInfo(scope.row.action).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作详情" width="100" align="center">
          <template #default="scope">
            <el-popover placement="top" trigger="hover" :width="500" v-if="scope.row.details">
              <pre class="details-content">{{ formatDetails(scope.row.details) }}</pre>
              <template #reference>
                <el-button type="primary" link size="small">
                  查看详情
                </el-button>
              </template>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.ip">{{ scope.row.ip }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <el-empty v-if="filteredLogs.length === 0" description="暂无操作日志" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.details-content {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.text-muted {
  color: var(--el-text-color-secondary);
}
</style>
