<script lang="ts" setup>
import { Document, Edit, Refresh, Search } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"

defineOptions({
  name: "GradeManagement"
})

const eduStore = useEduStore()

const loading = ref(false)
const editDialogVisible = ref(false)
const formRef = useTemplateRef("formRef")

const searchData = reactive({
  courseName: "",
  studentName: ""
})

const selectedCourse = ref<Course | null>(null)

const DEFAULT_FORM_DATA = {
  id: undefined as number | undefined,
  studentId: undefined as number | undefined,
  studentName: "",
  courseId: undefined as number | undefined,
  courseName: "",
  teacherId: undefined as number | undefined,
  teacherName: "",
  usualScore: 0,
  midScore: 0,
  finalScore: 0
}

const formData = ref({ ...DEFAULT_FORM_DATA })

const courses = computed(() => {
  return eduStore.courses
})

const allGrades = computed(() => {
  let list = eduStore.grades
  if (searchData.courseName) {
    list = list.filter(g => g.courseName.includes(searchData.courseName))
  }
  if (searchData.studentName) {
    list = list.filter(g => g.studentName.includes(searchData.studentName))
  }
  return list
})

const courseSelections = computed(() => {
  if (!selectedCourse.value) return []
  return eduStore.getCourseSelections(selectedCourse.value.id)
})

function handleEditGrade(selection: CourseSelection) {
  const existingGrade = eduStore.grades.find(
    g => g.studentId === selection.studentId && g.courseId === selection.courseId
  )

  if (existingGrade) {
    formData.value = {
      id: existingGrade.id,
      studentId: existingGrade.studentId,
      studentName: existingGrade.studentName,
      courseId: existingGrade.courseId,
      courseName: existingGrade.courseName,
      teacherId: existingGrade.teacherId,
      teacherName: existingGrade.teacherName,
      usualScore: existingGrade.usualScore,
      midScore: existingGrade.midScore,
      finalScore: existingGrade.finalScore
    }
  } else {
    formData.value = {
      ...DEFAULT_FORM_DATA,
      studentId: selection.studentId,
      studentName: selection.studentName,
      courseId: selection.courseId,
      courseName: selection.courseName,
      teacherId: selection.teacherId,
      teacherName: selection.teacherName
    }
  }

  editDialogVisible.value = true
}

type TagType = "success" | "warning" | "danger" | "info" | "primary"

function calculateTotalScore(usual: number, mid: number, final: number): number {
  return Math.round(usual * 0.3 + mid * 0.3 + final * 0.4)
}

function handleSubmit() {
  loading.value = true

  setTimeout(() => {
    const totalScore = calculateTotalScore(
      formData.value.usualScore,
      formData.value.midScore,
      formData.value.finalScore
    )

    eduStore.addOrUpdateGrade({
      id: formData.value.id,
      studentId: formData.value.studentId!,
      studentName: formData.value.studentName,
      courseId: formData.value.courseId!,
      courseName: formData.value.courseName,
      teacherId: formData.value.teacherId!,
      teacherName: formData.value.teacherName,
      usualScore: formData.value.usualScore,
      midScore: formData.value.midScore,
      finalScore: formData.value.finalScore,
      totalScore
    })

    ElMessage.success("成绩录入成功")
    loading.value = false
    editDialogVisible.value = false
  }, 300)
}

function handleSearch() {
  // 数据是响应式的
}

function resetSearch() {
  searchData.courseName = ""
  searchData.studentName = ""
}

function getStudentGrade(studentId: number, courseId: number) {
  return eduStore.grades.find(g => g.studentId === studentId && g.courseId === courseId)
}

function getGradeTagType(score: number): TagType {
  if (score >= 80) return "success"
  if (score >= 60) return "warning"
  return "danger"
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

    <el-card v-loading="loading" shadow="never">
      <template #header>
        <span>已录入成绩列表</span>
      </template>
      <div class="table-wrapper">
        <el-table :data="allGrades" style="width: 100%" v-if="allGrades.length > 0">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="studentName" label="学生姓名" align="center" />
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
          <el-table-column prop="updateTime" label="更新时间" align="center" />
          <el-table-column fixed="right" label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                text
                size="small"
                :icon="Edit"
                @click="handleEditGrade(scope.row)"
              >
                修改
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无成绩数据" />
      </div>
    </el-card>

    <el-card shadow="never" class="mt-20">
      <template #header>
        <div class="card-header">
          <span>按课程录入成绩</span>
          <el-icon><Document /></el-icon>
        </div>
      </template>
      <div class="course-select-wrapper">
        <el-select
          v-model="selectedCourse"
          placeholder="请选择要录入成绩的课程"
          style="width: 400px"
          :disabled="false"
        >
          <el-option
            v-for="course in courses"
            :key="course.id"
            :label="`${course.name} (${course.teacherName}) - 已选${course.currentStudents}人`"
            :value="course"
          />
        </el-select>
      </div>

      <div class="table-wrapper" v-if="selectedCourse">
        <el-table :data="courseSelections" style="width: 100%" v-if="courseSelections.length > 0">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="studentName" label="学生姓名" align="center" />
          <el-table-column label="平时成绩" align="center">
            <template #default="scope">
              <span v-if="getStudentGrade(scope.row.studentId, selectedCourse!.id)">
                <el-tag :type="getGradeTagType(getStudentGrade(scope.row.studentId, selectedCourse!.id)!.usualScore)">
                  {{ getStudentGrade(scope.row.studentId, selectedCourse!.id)!.usualScore }}
                </el-tag>
              </span>
              <el-tag v-else type="info">
                未录入
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="期中成绩" align="center">
            <template #default="scope">
              <span v-if="getStudentGrade(scope.row.studentId, selectedCourse!.id)">
                <el-tag :type="getGradeTagType(getStudentGrade(scope.row.studentId, selectedCourse!.id)!.midScore)">
                  {{ getStudentGrade(scope.row.studentId, selectedCourse!.id)!.midScore }}
                </el-tag>
              </span>
              <el-tag v-else type="info">
                未录入
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="期末成绩" align="center">
            <template #default="scope">
              <span v-if="getStudentGrade(scope.row.studentId, selectedCourse!.id)">
                <el-tag :type="getGradeTagType(getStudentGrade(scope.row.studentId, selectedCourse!.id)!.finalScore)">
                  {{ getStudentGrade(scope.row.studentId, selectedCourse!.id)!.finalScore }}
                </el-tag>
              </span>
              <el-tag v-else type="info">
                未录入
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总评" align="center">
            <template #default="scope">
              <span v-if="getStudentGrade(scope.row.studentId, selectedCourse!.id)">
                <el-tag :type="getGradeTagType(getStudentGrade(scope.row.studentId, selectedCourse!.id)!.totalScore)" size="large">
                  {{ getStudentGrade(scope.row.studentId, selectedCourse!.id)!.totalScore }}
                </el-tag>
              </span>
              <el-tag v-else type="info">
                未录入
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                text
                size="small"
                :icon="Edit"
                @click="handleEditGrade(scope.row)"
              >
                录入/修改
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="该课程暂无学生选课" />
      </div>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      title="成绩录入"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border class="mb-20">
        <el-descriptions-item label="课程名称">
          {{ formData.courseName }}
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">
          {{ formData.studentName }}
        </el-descriptions-item>
        <el-descriptions-item label="授课教师">
          {{ formData.teacherName }}
        </el-descriptions-item>
        <el-descriptions-item label="考核方式">
          平时30% + 期中20% + 期末50%
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-form-item label="平时成绩">
          <el-input-number
            v-model="formData.usualScore"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
            placeholder="请输入平时成绩(0-100)"
          />
          <span class="help-text">占比 30%</span>
        </el-form-item>

        <el-form-item label="期中成绩">
          <el-input-number
            v-model="formData.midScore"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
            placeholder="请输入期中成绩(0-100)"
          />
          <span class="help-text">占比 20%</span>
        </el-form-item>

        <el-form-item label="期末成绩">
          <el-input-number
            v-model="formData.finalScore"
            :min="0"
            :max="100"
            :precision="0"
            style="width: 100%"
            placeholder="请输入期末成绩(0-100)"
          />
          <span class="help-text">占比 50%</span>
        </el-form-item>

        <el-divider>总评计算</el-divider>
        <div class="total-preview">
          <span class="label">总评成绩：</span>
          <span class="value" :class="{ 'is-fail': (formData.usualScore * 0.3 + formData.midScore * 0.2 + formData.finalScore * 0.5) < 60 }">
            {{ (formData.usualScore * 0.3 + formData.midScore * 0.2 + formData.finalScore * 0.5).toFixed(1) }}
          </span>
          <span class="formula">= 平时×30% + 期中×20% + 期末×50%</span>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认提交
        </el-button>
      </template>
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

.mt-20 {
  margin-top: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-select-wrapper {
  margin-bottom: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.help-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.total-preview {
  display: flex;
  align-items: center;
  font-size: 16px;

  .label {
    color: #606266;
  }

  .value {
    font-weight: bold;
    font-size: 24px;
    color: #67c23a;
    margin: 0 10px;

    &.is-fail {
      color: #f56c6c;
    }
  }

  .formula {
    color: #909399;
    font-size: 12px;
  }
}
</style>
