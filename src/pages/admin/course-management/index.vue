<script lang="ts" setup>
import type { FormRules } from "element-plus"
import { CirclePlus, Delete, Edit, Refresh, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"
import { useEduStore } from "@/pinia/stores/edu"

defineOptions({
  name: "CourseManagement"
})

const eduStore = useEduStore()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = useTemplateRef("formRef")

const searchData = reactive({
  name: "",
  teacherName: ""
})

const DEFAULT_FORM_DATA: Partial<Course> = {
  id: undefined,
  name: "",
  code: "",
  description: "",
  teacherId: null,
  teacherName: "",
  credits: 2,
  assessmentMethod: "",
  maxStudents: 40,
  status: "open"
}

const formData = ref<Partial<Course>>(cloneDeep(DEFAULT_FORM_DATA))

const formRules: FormRules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入课程代码", trigger: "blur" }],
  teacherId: [{ required: true, message: "请选择授课教师", trigger: "change" }],
  credits: [{ required: true, message: "请输入学分", trigger: "blur" }],
  maxStudents: [{ required: true, message: "请输入最大人数", trigger: "blur" }]
}

const teachers = computed(() => {
  return eduStore.getTeachers()
})

const courses = computed(() => {
  let list = eduStore.courses
  if (searchData.name) {
    list = list.filter(c => c.name.includes(searchData.name))
  }
  if (searchData.teacherName) {
    list = list.filter(c => c.teacherName.includes(searchData.teacherName))
  }
  return list
})

function handleTeacherChange(teacherId: number) {
  const teacher = teachers.value.find(t => t.id === teacherId)
  if (teacher) {
    formData.value.teacherName = teacher.name
  }
}

function handleAdd() {
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
  dialogVisible.value = true
}

function handleEdit(row: Course) {
  formData.value = cloneDeep(row)
  dialogVisible.value = true
}

function handleDelete(row: Course) {
  ElMessageBox.confirm(`确定要删除课程：${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    eduStore.deleteCourse(row.id)
    ElMessage.success("删除成功")
  })
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true

    setTimeout(() => {
      if (formData.value.id) {
        eduStore.updateCourse(formData.value.id, formData.value)
        ElMessage.success("修改成功")
      } else {
        eduStore.addCourse(formData.value as Omit<Course, "id" | "createTime" | "currentStudents">)
        ElMessage.success("添加成功")
      }
      loading.value = false
      dialogVisible.value = false
    }, 300)
  })
}

function handleSearch() {
  // 数据是响应式的
}

function resetSearch() {
  searchData.name = ""
  searchData.teacherName = ""
}

type TagType = "success" | "warning" | "danger" | "info" | "primary"

function getStatusTag(status: string): { type: TagType, text: string } {
  return status === "open" ? { type: "success" as TagType, text: "开放" } : { type: "info" as TagType, text: "关闭" }
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

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">
            新增课程
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="courses" style="width: 100%">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="code" label="课程代码" align="center" />
          <el-table-column prop="name" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="授课教师" align="center" />
          <el-table-column prop="credits" label="学分" align="center" />
          <el-table-column prop="description" label="课程描述" align="center" show-overflow-tooltip />
          <el-table-column prop="assessmentMethod" label="考核标准" align="center" show-overflow-tooltip />
          <el-table-column label="选课人数" align="center">
            <template #default="scope">
              {{ scope.row.currentStudents }} / {{ scope.row.maxStudents }}
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status).type">
                {{ getStatusTag(scope.row.status).text }}
              </el-tag>
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
      :title="formData.id ? '修改课程' : '新增课程'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程代码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入课程代码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="授课教师" prop="teacherId">
              <el-select
                v-model="formData.teacherId"
                placeholder="请选择授课教师"
                style="width: 100%"
                @change="handleTeacherChange"
              >
                <el-option
                  v-for="teacher in teachers"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学分" prop="credits">
              <el-input-number v-model="formData.credits" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大人数" prop="maxStudents">
              <el-input-number v-model="formData.maxStudents" :min="10" :max="200" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="开放" value="open" />
                <el-option label="关闭" value="closed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入课程描述"
          />
        </el-form-item>

        <el-form-item label="考核标准" prop="assessmentMethod">
          <el-input
            v-model="formData.assessmentMethod"
            type="textarea"
            :rows="2"
            placeholder="请输入考核标准，如：考试（平时30% + 期末70%）"
          />
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

.table-wrapper {
  margin-bottom: 20px;
}
</style>
