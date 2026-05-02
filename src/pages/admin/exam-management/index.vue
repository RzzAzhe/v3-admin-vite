<script lang="ts" setup>
import type { FormRules } from "element-plus"
import { CirclePlus, Delete, Edit, Refresh } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"
import { useEduStore } from "@/pinia/stores/edu"

defineOptions({
  name: "ExamManagement"
})

const eduStore = useEduStore()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = useTemplateRef("formRef")

const DEFAULT_FORM_DATA: Partial<Exam> = {
  id: undefined,
  courseId: undefined,
  courseName: "",
  teacherId: undefined,
  teacherName: "",
  examTime: "",
  examLocation: "",
  examType: "期末考试"
}

const formData = ref<Partial<Exam>>(cloneDeep(DEFAULT_FORM_DATA))

const formRules: FormRules = {
  courseId: [{ required: true, message: "请选择课程", trigger: "change" }],
  examTime: [{ required: true, message: "请选择考试时间", trigger: "change" }],
  examLocation: [{ required: true, message: "请输入考试地点", trigger: "blur" }],
  examType: [{ required: true, message: "请选择考试类型", trigger: "change" }]
}

const courses = computed(() => {
  return eduStore.courses.filter(c => c.status === "open")
})

const exams = computed(() => {
  return eduStore.exams
})

const examTypes = [
  { value: "期中考试", label: "期中考试" },
  { value: "期末考试", label: "期末考试" },
  { value: "补考", label: "补考" },
  { value: "测验", label: "测验" }
]

type TagType = "success" | "warning" | "danger" | "info" | "primary"

function handleCourseChange(courseId: number) {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    formData.value.courseName = course.name
    formData.value.teacherId = course.teacherId ?? undefined
    formData.value.teacherName = course.teacherName
  }
}

function handleAdd() {
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
  dialogVisible.value = true
}

function handleEdit(row: Exam) {
  formData.value = cloneDeep(row)
  dialogVisible.value = true
}

function handleDelete(row: Exam) {
  ElMessageBox.confirm(`确定要删除该考试安排吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    eduStore.deleteExam(row.id)
    ElMessage.success("删除成功")
  })
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true

    setTimeout(() => {
      if (formData.value.id) {
        eduStore.updateExam(formData.value.id, formData.value)
        ElMessage.success("修改成功")
      } else {
        eduStore.addExam(formData.value as Omit<Exam, "id">)
        ElMessage.success("添加成功")
      }
      loading.value = false
      dialogVisible.value = false
    }, 300)
  })
}

function getExamTypeTag(type: string): TagType {
  const tagMap: Record<string, TagType> = {
    期中考试: "warning",
    期末考试: "danger",
    补考: "info",
    测验: "primary"
  }
  return tagMap[type] || "info"
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">
            新增考试安排
          </el-button>
        </div>
        <div>
          <el-tooltip content="刷新">
            <el-button type="primary" :icon="Refresh" circle />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="exams" style="width: 100%" v-if="exams.length > 0">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="任课教师" align="center" />
          <el-table-column label="考试类型" align="center">
            <template #default="scope">
              <el-tag :type="getExamTypeTag(scope.row.examType)">
                {{ scope.row.examType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="考试时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.examTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="examLocation" label="考试地点" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" :icon="Edit" @click="handleEdit(scope.row)">
                修改
              </el-button>
              <el-button type="danger" text bg size="small" :icon="Delete" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无考试安排">
          <template #description>
            <span>暂无考试安排，请点击上方按钮添加</span>
          </template>
          <el-button type="primary" @click="handleAdd">
            立即添加
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '修改考试安排' : '新增考试安排'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="选择课程" prop="courseId">
          <el-select
            v-model="formData.courseId"
            placeholder="请选择课程"
            style="width: 100%"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="`${course.name} (${course.teacherName})`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="formData.examType" placeholder="请选择考试类型" style="width: 100%">
            <el-option
              v-for="item in examTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="考试时间" prop="examTime">
          <el-date-picker
            v-model="formData.examTime"
            type="datetime"
            placeholder="请选择考试时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="考试地点" prop="examLocation">
          <el-input v-model="formData.examLocation" placeholder="请输入考试地点，如：教学楼A101" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}
</style>
