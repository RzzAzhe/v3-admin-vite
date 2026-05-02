<script lang="ts" setup>
import type { FormRules } from "element-plus"
import { CirclePlus, Delete, Edit, Refresh } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"
import { useEduStore } from "@/pinia/stores/edu"

defineOptions({
  name: "ScheduleManagement"
})

const eduStore = useEduStore()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = useTemplateRef("formRef")

const DEFAULT_FORM_DATA: Partial<Schedule> = {
  id: undefined,
  courseId: undefined,
  courseName: "",
  teacherId: undefined,
  teacherName: "",
  dayOfWeek: 1,
  periodStart: 1,
  periodEnd: 2,
  classroom: "",
  weekStart: 1,
  weekEnd: 16
}

const formData = ref<Partial<Schedule>>(cloneDeep(DEFAULT_FORM_DATA))

const formRules: FormRules = {
  courseId: [{ required: true, message: "请选择课程", trigger: "change" }],
  dayOfWeek: [{ required: true, message: "请选择星期", trigger: "change" }],
  periodStart: [{ required: true, message: "请选择开始节次", trigger: "change" }],
  periodEnd: [{ required: true, message: "请选择结束节次", trigger: "change" }],
  classroom: [{ required: true, message: "请输入教室", trigger: "blur" }],
  weekStart: [{ required: true, message: "请选择开始周", trigger: "change" }],
  weekEnd: [{ required: true, message: "请选择结束周", trigger: "change" }]
}

const courses = computed(() => {
  return eduStore.courses.filter(c => c.status === "open")
})

const schedules = computed(() => {
  return eduStore.schedules
})

const weekDays = [
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
  { value: 7, label: "周日" }
]

const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const weeks = Array.from({ length: 16 }, (_, i) => i + 1)

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

function handleEdit(row: Schedule) {
  formData.value = cloneDeep(row)
  dialogVisible.value = true
}

function handleDelete(row: Schedule) {
  ElMessageBox.confirm(`确定要删除该排课记录吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    eduStore.deleteSchedule(row.id)
    ElMessage.success("删除成功")
  })
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (formData.value.periodStart! > formData.value.periodEnd!) {
      ElMessage.error("开始节次不能大于结束节次")
      return
    }
    if (formData.value.weekStart! > formData.value.weekEnd!) {
      ElMessage.error("开始周不能大于结束周")
      return
    }

    loading.value = true

    setTimeout(() => {
      if (formData.value.id) {
        eduStore.updateSchedule(formData.value.id, formData.value)
        ElMessage.success("修改成功")
      } else {
        eduStore.addSchedule(formData.value as Omit<Schedule, "id">)
        ElMessage.success("添加成功")
      }
      loading.value = false
      dialogVisible.value = false
    }, 300)
  })
}

function getWeekDayLabel(day: number): string {
  return weekDays.find(d => d.value === day)?.label || ""
}

function formatPeriods(start: number, end: number): string {
  return `第${start}-${end}节`
}

function formatWeeks(start: number, end: number): string {
  return `周${start}-${end}`
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">
            新增排课
          </el-button>
        </div>
        <div>
          <el-tooltip content="刷新">
            <el-button type="primary" :icon="Refresh" circle />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="schedules" style="width: 100%">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column label="星期" align="center">
            <template #default="scope">
              {{ getWeekDayLabel(scope.row.dayOfWeek) }}
            </template>
          </el-table-column>
          <el-table-column label="节次" align="center">
            <template #default="scope">
              {{ formatPeriods(scope.row.periodStart, scope.row.periodEnd) }}
            </template>
          </el-table-column>
          <el-table-column prop="classroom" label="教室" align="center" />
          <el-table-column label="周次" align="center">
            <template #default="scope">
              {{ formatWeeks(scope.row.weekStart, scope.row.weekEnd) }}
            </template>
          </el-table-column>
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
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '修改排课' : '新增排课'"
      width="600px"
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="星期" prop="dayOfWeek">
              <el-select v-model="formData.dayOfWeek" placeholder="请选择星期" style="width: 100%">
                <el-option v-for="item in weekDays" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教室" prop="classroom">
              <el-input v-model="formData.classroom" placeholder="请输入教室，如：教学楼A101" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始节次" prop="periodStart">
              <el-select v-model="formData.periodStart" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in periods" :key="p" :label="`第${p}节`" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束节次" prop="periodEnd">
              <el-select v-model="formData.periodEnd" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in periods" :key="p" :label="`第${p}节`" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始周" prop="weekStart">
              <el-select v-model="formData.weekStart" placeholder="请选择" style="width: 100%">
                <el-option v-for="w in weeks" :key="w" :label="`第${w}周`" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束周" prop="weekEnd">
              <el-select v-model="formData.weekEnd" placeholder="请选择" style="width: 100%">
                <el-option v-for="w in weeks" :key="w" :label="`第${w}周`" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
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
