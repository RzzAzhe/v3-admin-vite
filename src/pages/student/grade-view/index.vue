<script lang="ts" setup>
import { Download, Refresh } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"
import { useUserStore } from "@/pinia/stores/user"

defineOptions({
  name: "GradeView"
})

const userStore = useUserStore()
const eduStore = useEduStore()

const loading = ref(false)

const currentStudentId = computed(() => {
  const user = eduStore.users.find(u => u.username === userStore.username)
  return user?.id || 0
})

const currentStudent = computed(() => {
  return eduStore.users.find(u => u.username === userStore.username)
})

const grades = computed(() => {
  return eduStore.getStudentGrades(currentStudentId.value)
})

const gpa = computed(() => {
  if (grades.value.length === 0) return "0.00"
  const totalScore = grades.value.reduce((sum, g) => sum + g.totalScore, 0)
  return (totalScore / grades.value.length).toFixed(2)
})

const passedCount = computed(() => {
  return grades.value.filter(g => g.totalScore >= 60).length
})

const failedCount = computed(() => {
  return grades.value.filter(g => g.totalScore < 60).length
})

function getGradeLevel(score: number): string {
  if (score >= 90) return "优秀"
  if (score >= 80) return "良好"
  if (score >= 70) return "中等"
  if (score >= 60) return "及格"
  return "不及格"
}

type TagType = "success" | "warning" | "danger" | "info" | "primary"

function getGradeTagType(score: number): TagType {
  if (score >= 80) return "success"
  if (score >= 60) return "warning"
  return "danger"
}

function handleRefresh() {
  // 数据已经是响应式的，不需要额外操作
  ElMessage.success("已刷新")
}
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              平均成绩
            </div>
            <div class="stat-value" style="color: #409eff">
              {{ gpa }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              已修课程
            </div>
            <div class="stat-value" style="color: #67c23a">
              {{ grades.length }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              及格课程
            </div>
            <div class="stat-value" style="color: #409eff">
              {{ passedCount }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              不及格课程
            </div>
            <div class="stat-value" style="color: #f56c6c">
              {{ failedCount }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <span class="text-gray-500">
            学生：{{ currentStudent?.name }} | 学号：{{ currentStudent?.studentId }} | 班级：{{ currentStudent?.className }}
          </span>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新">
            <el-button type="primary" :icon="Refresh" circle @click="handleRefresh" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="grades" style="width: 100%" v-if="grades.length > 0">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="usualScore" label="平时成绩" align="center" />
          <el-table-column prop="midScore" label="期中成绩" align="center" />
          <el-table-column prop="finalScore" label="期末成绩" align="center" />
          <el-table-column label="总评" align="center">
            <template #default="scope">
              <el-tag :type="getGradeTagType(scope.row.totalScore)">
                {{ scope.row.totalScore }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="等级" align="center">
            <template #default="scope">
              <el-tag :type="getGradeTagType(scope.row.totalScore)" effect="plain">
                {{ getGradeLevel(scope.row.totalScore) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" align="center" />
        </el-table>
        <el-empty v-else description="暂无成绩数据" />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.mb-20 {
  margin-bottom: 20px;
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
    }
  }
}

.text-gray-500 {
  color: #909399;
}
</style>
