<script lang="ts" setup>
import { Refresh, Search } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"
import { useUserStore } from "@/pinia/stores/user"

defineOptions({
  name: "CourseSelection"
})

const userStore = useUserStore()
const eduStore = useEduStore()

const searchData = reactive({
  name: "",
  teacherName: ""
})

const currentStudentId = computed(() => userStore.userId)

const availableCourses = computed(() => {
  let courses = eduStore.courses.filter(c => c.status === "open")
  if (searchData.name) {
    courses = courses.filter(c => c.name.includes(searchData.name))
  }
  if (searchData.teacherName) {
    courses = courses.filter(c => c.teacherName.includes(searchData.teacherName))
  }
  return courses
})

const selectedCourses = computed(() => {
  return eduStore.getStudentSelections(currentStudentId.value)
})

function isCourseSelected(courseId: number) {
  return selectedCourses.value.some(s => s.courseId === courseId)
}

function handleSelectCourse(course: Course) {
  if (eduStore.selectCourse(currentStudentId.value, course.id)) {
    ElMessage.success("选课成功")
  }
}

function handleDropCourse(selection: CourseSelection) {
  ElMessageBox.confirm(`确定要退选课程：${selection.courseName} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (eduStore.dropCourse(selection.id)) {
      ElMessage.success("退课成功")
    }
  })
}

function handleSearch() {
  // 数据是响应式的，不需要额外操作
}

function resetSearch() {
  searchData.name = ""
  searchData.teacherName = ""
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="课程名称">
          <el-input v-model="searchData.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="searchData.teacherName" placeholder="请输入" clearable />
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

    <el-card shadow="never">
      <template #header>
        <span>可选课程</span>
      </template>
      <div class="table-wrapper">
        <el-table :data="availableCourses" style="width: 100%">
          <el-table-column prop="code" label="课程代码" align="center" />
          <el-table-column prop="name" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="credits" label="学分" align="center" />
          <el-table-column label="选课状态" align="center">
            <template #default="scope">
              <el-tag v-if="isCourseSelected(scope.row.id)" type="success">
                已选
              </el-tag>
              <el-tag v-else type="primary">
                可选
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人数限制" align="center">
            <template #default="scope">
              {{ scope.row.currentStudents }} / {{ scope.row.maxStudents }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                v-if="!isCourseSelected(scope.row.id) && scope.row.currentStudents < scope.row.maxStudents"
                type="primary"
                text
                size="small"
                @click="handleSelectCourse(scope.row)"
              >
                选课
              </el-button>
              <span v-else-if="isCourseSelected(scope.row.id)" class="text-gray-500">已选择</span>
              <span v-else class="text-red-500">已满</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card shadow="never" class="mt-20">
      <template #header>
        <span>已选课程</span>
      </template>
      <div class="table-wrapper">
        <el-table :data="selectedCourses" style="width: 100%" v-if="selectedCourses.length > 0">
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="selectTime" label="选课时间" align="center" />
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                text
                size="small"
                @click="handleDropCourse(scope.row)"
              >
                退课
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂未选择任何课程" />
      </div>
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

.table-wrapper {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
