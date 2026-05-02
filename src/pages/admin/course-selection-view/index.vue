<script lang="ts" setup>
import { Refresh, Search, View } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"

defineOptions({
  name: "CourseSelectionView"
})

const eduStore = useEduStore()

const loading = ref(false)
const detailDialogVisible = ref(false)
const selectedCourse = ref<Course | null>(null)

const searchData = reactive({
  courseName: "",
  studentName: ""
})

const courses = computed(() => {
  return eduStore.courses.filter(c => c.status === "open")
})

const allSelections = computed(() => {
  let list = eduStore.selections.filter(s => s.status === "selected")
  if (searchData.courseName) {
    list = list.filter(s => s.courseName.includes(searchData.courseName))
  }
  if (searchData.studentName) {
    list = list.filter(s => s.studentName.includes(searchData.studentName))
  }
  return list
})

const courseSelections = computed(() => {
  if (!selectedCourse.value) return []
  return eduStore.getCourseSelections(selectedCourse.value.id)
})

function handleViewDetails(course: Course) {
  selectedCourse.value = course
  detailDialogVisible.value = true
}

function handleSearch() {
  // 数据是响应式的
}

function resetSearch() {
  searchData.courseName = ""
  searchData.studentName = ""
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("zh-CN")
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="课程名称">
          <el-input v-model="searchData.courseName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="searchData.studentName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              开放课程数
            </div>
            <div class="stat-value" style="color: #409eff">
              {{ courses.length }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">
              总选课人次
            </div>
            <div class="stat-value" style="color: #67c23a">
              {{ allSelections.length }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-loading="loading" shadow="never">
      <template #header>
        <span>选课情况总览</span>
      </template>
      <div class="table-wrapper">
        <el-table :data="allSelections" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="studentName" label="选课学生" align="center" />
          <el-table-column label="选课时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.selectTime) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card shadow="never" class="mt-20">
      <template #header>
        <span>按课程查看选课情况</span>
      </template>
      <div class="table-wrapper">
        <el-table :data="courses" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="code" label="课程代码" align="center" />
          <el-table-column prop="name" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="credits" label="学分" align="center" />
          <el-table-column label="选课情况" align="center">
            <template #default="scope">
              <el-progress
                :percentage="Math.round((scope.row.currentStudents / scope.row.maxStudents) * 100)"
                :stroke-width="20"
              >
                <template #default>
                  <span class="percentage-text">
                    {{ scope.row.currentStudents }}/{{ scope.row.maxStudents }}
                  </span>
                </template>
              </el-progress>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                text
                size="small"
                :icon="View"
                @click="handleViewDetails(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      :title="`【${selectedCourse?.name}】选课详情`"
      width="800px"
    >
      <div class="course-info" v-if="selectedCourse">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="课程代码">
            {{ selectedCourse.code }}
          </el-descriptions-item>
          <el-descriptions-item label="课程名称">
            {{ selectedCourse.name }}
          </el-descriptions-item>
          <el-descriptions-item label="授课教师">
            {{ selectedCourse.teacherName }}
          </el-descriptions-item>
          <el-descriptions-item label="学分">
            {{ selectedCourse.credits }}
          </el-descriptions-item>
          <el-descriptions-item label="当前选课人数">
            {{ selectedCourse.currentStudents }}
          </el-descriptions-item>
          <el-descriptions-item label="最大人数">
            {{ selectedCourse.maxStudents }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider>已选学生列表</el-divider>

      <div class="table-wrapper">
        <el-table :data="courseSelections" style="width: 100%" v-if="courseSelections.length > 0">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="studentName" label="学生姓名" align="center" />
          <el-table-column label="选课时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.selectTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无学生选择该课程" />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
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

.percentage-text {
  color: #606266;
  font-size: 13px;
}

.course-info {
  margin-bottom: 20px;
}
</style>
