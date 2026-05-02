<script lang="ts" setup>
import type { FormRules } from "element-plus"
import { useEduStore } from "@/pinia/stores/edu"
import { useUserStore } from "@/pinia/stores/user"

defineOptions({
  name: "TeacherRating"
})

const userStore = useUserStore()
const eduStore = useEduStore()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = useTemplateRef("formRef")

const currentStudentId = computed(() => {
  const user = eduStore.users.find(u => u.username === userStore.username)
  return user?.id || 0
})

const currentStudent = computed(() => {
  return eduStore.users.find(u => u.username === userStore.username)
})

const myRatings = computed(() => {
  return eduStore.getStudentRatings(currentStudentId.value)
})

const availableCoursesForRating = computed(() => {
  const selections = eduStore.getStudentSelections(currentStudentId.value)
  const ratedCourseIds = myRatings.value.map(r => r.courseId)
  return selections.filter(s => !ratedCourseIds.includes(s.courseId) && s.teacherId)
})

const DEFAULT_FORM_DATA = {
  courseId: undefined as number | undefined,
  teacherId: undefined as number | undefined,
  teacherName: "",
  courseName: "",
  teachingAttitude: 3,
  teachingContent: 3,
  teachingMethod: 3,
  teachingEffect: 3,
  comment: ""
}

const formData = ref({ ...DEFAULT_FORM_DATA })

const formRules: FormRules = {
  courseId: [{ required: true, message: "请选择课程", trigger: "change" }],
  teachingAttitude: [{ required: true, message: "请评分", trigger: "change" }],
  teachingContent: [{ required: true, message: "请评分", trigger: "change" }],
  teachingMethod: [{ required: true, message: "请评分", trigger: "change" }],
  teachingEffect: [{ required: true, message: "请评分", trigger: "change" }]
}

function handleOpenDialog() {
  formData.value = { ...DEFAULT_FORM_DATA }
  dialogVisible.value = true
}

function handleCourseChange(courseId: number) {
  const selection = availableCoursesForRating.value.find(s => s.courseId === courseId)
  if (selection) {
    formData.value.teacherId = selection.teacherId
    formData.value.teacherName = selection.teacherName
    formData.value.courseName = selection.courseName
  }
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true

    const success = eduStore.addRating({
      teacherId: formData.value.teacherId!,
      teacherName: formData.value.teacherName,
      studentId: currentStudentId.value,
      studentName: currentStudent.value?.name || "",
      courseId: formData.value.courseId!,
      courseName: formData.value.courseName,
      teachingAttitude: formData.value.teachingAttitude,
      teachingContent: formData.value.teachingContent,
      teachingMethod: formData.value.teachingMethod,
      teachingEffect: formData.value.teachingEffect,
      comment: formData.value.comment
    })

    setTimeout(() => {
      loading.value = false
      if (success) {
        ElMessage.success("评分成功")
        dialogVisible.value = false
      }
    }, 500)
  })
}

function getAverageRating(rating: TeacherRating): number {
  const total = rating.teachingAttitude + rating.teachingContent + rating.teachingMethod + rating.teachingEffect
  return Number((total / 4).toFixed(1))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN")
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的评分记录</span>
          <el-button
            type="primary"
            @click="handleOpenDialog"
            :disabled="availableCoursesForRating.length === 0"
          >
            给老师评分
          </el-button>
        </div>
      </template>

      <div class="table-wrapper">
        <el-table :data="myRatings" style="width: 100%" v-if="myRatings.length > 0">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="teacherName" label="教师姓名" align="center" />
          <el-table-column prop="courseName" label="所授课程" align="center" />
          <el-table-column label="教学态度" align="center">
            <template #default="scope">
              <el-rate v-model="scope.row.teachingAttitude" disabled text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column label="教学内容" align="center">
            <template #default="scope">
              <el-rate v-model="scope.row.teachingContent" disabled text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column label="教学方法" align="center">
            <template #default="scope">
              <el-rate v-model="scope.row.teachingMethod" disabled text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column label="教学效果" align="center">
            <template #default="scope">
              <el-rate v-model="scope.row.teachingEffect" disabled text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column label="综合评分" align="center">
            <template #default="scope">
              <el-tag type="primary" size="large">
                {{ getAverageRating(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="评语" align="center" show-overflow-tooltip />
          <el-table-column label="评分时间" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.ratingTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评分记录">
          <template #description>
            <span>暂无评分记录，您可以对已选课程的老师进行评价</span>
          </template>
          <el-button type="primary" @click="handleOpenDialog" :disabled="availableCoursesForRating.length === 0">
            立即评价
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="教师评价"
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
            placeholder="请选择要评价的课程"
            style="width: 100%"
            @change="handleCourseChange"
          >
            <el-option
              v-for="item in availableCoursesForRating"
              :key="item.courseId"
              :label="`${item.courseName} (${item.teacherName})`"
              :value="item.courseId"
            />
          </el-select>
        </el-form-item>

        <el-divider>评分项目</el-divider>

        <el-form-item label="教学态度" prop="teachingAttitude">
          <el-rate
            v-model="formData.teachingAttitude"
            :max="5"
            show-score
            text-color="#ff9900"
          >
            <template #text="scope">
              <span class="score-text">{{ scope.value }} 分</span>
            </template>
          </el-rate>
        </el-form-item>

        <el-form-item label="教学内容" prop="teachingContent">
          <el-rate
            v-model="formData.teachingContent"
            :max="5"
            show-score
            text-color="#ff9900"
          >
            <template #text="scope">
              <span class="score-text">{{ scope.value }} 分</span>
            </template>
          </el-rate>
        </el-form-item>

        <el-form-item label="教学方法" prop="teachingMethod">
          <el-rate
            v-model="formData.teachingMethod"
            :max="5"
            show-score
            text-color="#ff9900"
          >
            <template #text="scope">
              <span class="score-text">{{ scope.value }} 分</span>
            </template>
          </el-rate>
        </el-form-item>

        <el-form-item label="教学效果" prop="teachingEffect">
          <el-rate
            v-model="formData.teachingEffect"
            :max="5"
            show-score
            text-color="#ff9900"
          >
            <template #text="scope">
              <span class="score-text">{{ scope.value }} 分</span>
            </template>
          </el-rate>
        </el-form-item>

        <el-form-item label="评语" prop="comment">
          <el-input
            v-model="formData.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评语（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-wrapper {
  margin-top: 10px;
}

.score-text {
  margin-left: 10px;
  color: #606266;
}
</style>
