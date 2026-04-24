<script lang="ts" setup>
import type { OperationLog } from "@@/composables/useOperationLog"
import { usePagination } from "@@/composables/usePagination"
import { computed } from "vue"
import { useOperationLogStore } from "@/pinia/stores/operation-log"
import { useUserStore } from "@/pinia/stores/user"

defineOptions({
  name: "Profile"
})

const userStore = useUserStore()
const operationLogStore = useOperationLogStore()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const userLogs = computed(() => {
  return operationLogStore.logs.filter(log => log.username === userStore.username)
})

const pagedLogs = computed(() => {
  const start = (paginationData.currentPage - 1) * paginationData.pageSize
  const end = start + paginationData.pageSize
  return userLogs.value.slice(start, end)
})

paginationData.total = userLogs.value.length

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
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>个人信息</span>
          </template>
          <div class="user-info">
            <el-avatar :size="80" class="avatar">
              <el-icon class="avatar-icon">
                <UserFilled />
              </el-icon>
            </el-avatar>
            <div class="info-content">
              <div class="username">
                {{ userStore.username }}
              </div>
              <div class="roles">
                <el-tag v-for="role in userStore.roles" :key="role" class="role-tag" size="small">
                  {{ role }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-divider />
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">
                {{ userLogs.length }}
              </div>
              <div class="stat-label">
                操作记录
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>我的操作日志</span>
              <el-badge :value="userLogs.length" class="item" />
            </div>
          </template>
          <el-table :data="pagedLogs" v-loading="false" stripe>
            <el-table-column prop="timestamp" label="时间" width="180" align="center" />
            <el-table-column prop="module" label="模块" width="120" align="center" />
            <el-table-column prop="action" label="操作" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getActionInfo(scope.row.action).type" effect="plain" size="small">
                  {{ getActionInfo(scope.row.action).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="详情" width="100" align="center">
              <template #default="scope">
                <el-popover placement="top" trigger="hover" :width="400" v-if="scope.row.details">
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
          <el-empty v-if="userLogs.length === 0" description="暂无操作记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .avatar {
    background-color: var(--el-color-primary-light-9);
    margin-bottom: 16px;

    .avatar-icon {
      font-size: 40px;
      color: var(--el-color-primary);
    }
  }

  .info-content {
    text-align: center;

    .username {
      font-size: 20px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
    }

    .roles {
      .role-tag {
        margin-right: 4px;
      }
    }
  }
}

.stats {
  display: flex;
  justify-content: center;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: var(--el-color-primary);
    }

    .stat-label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-content {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
