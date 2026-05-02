<script lang="ts" setup>
import { Document, Refresh } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"
import { useUserStore } from "@/pinia/stores/user"

defineOptions({
  name: "ScheduleView"
})

const userStore = useUserStore()
const eduStore = useEduStore()

const currentWeek = ref(1)
const maxWeek = 16

const currentStudentId = computed(() => userStore.userId)

const currentStudent = computed(() => {
  return eduStore.users.find(u => u.id === userStore.userId)
})

const schedules = computed(() => {
  return eduStore.getStudentSchedule(currentStudentId.value)
})

const exams = computed(() => {
  return eduStore.getStudentExams(currentStudentId.value)
})

const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const periods = ["第1-2节", "第3-4节", "第5-6节", "第7-8节", "第9-10节"]

function getSchedulesForCell(day: number, periodIndex: number): Schedule[] {
  const periodStart = periodIndex * 2 + 1
  const periodEnd = periodStart + 1
  return schedules.value.filter((s) => {
    const inDay = s.dayOfWeek === day
    const inPeriod = s.periodStart <= periodEnd && s.periodEnd >= periodStart
    const inWeek = currentWeek.value >= s.weekStart && currentWeek.value <= s.weekEnd
    return inDay && inPeriod && inWeek
  })
}

function getCellColor(teacherName: string): string {
  const colors = [
    "background-color: #409eff; color: #fff;",
    "background-color: #67c23a; color: #fff;",
    "background-color: #e6a23c; color: #fff;",
    "background-color: #909399; color: #fff;",
    "background-color: #06989a; color: #fff;",
    "background-color: #8e44ad; color: #fff;"
  ]
  const index = teacherName.length % colors.length
  return colors[index]
}

function handleRefresh() {
  ElMessage.success("已刷新")
}

function prevWeek() {
  if (currentWeek.value > 1) {
    currentWeek.value--
  }
}

function nextWeek() {
  if (currentWeek.value < maxWeek) {
    currentWeek.value++
  }
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-20">
      <template #header>
        <div class="card-header">
          <span>课表查询</span>
          <div class="week-nav">
            <el-button type="primary" plain @click="prevWeek" :disabled="currentWeek <= 1">
              上一周
            </el-button>
            <span class="week-text">第 {{ currentWeek }} 周</span>
            <el-button type="primary" plain @click="nextWeek" :disabled="currentWeek >= maxWeek">
              下一周
            </el-button>
            <el-tooltip content="刷新">
              <el-button type="primary" :icon="Refresh" circle @click="handleRefresh" />
            </el-tooltip>
          </div>
        </div>
      </template>

      <div class="info-row" v-if="currentStudent">
        <span>学生：{{ currentStudent.name }}</span>
        <span>学号：{{ currentStudent.studentId }}</span>
        <span>班级：{{ currentStudent.className }}</span>
      </div>

      <div class="schedule-table">
        <el-table :data="periods" border style="width: 100%">
          <el-table-column label="时间" align="center" width="100">
            <template #default="scope">
              <div class="period-cell">
                <div class="period-text">
                  {{ scope.row }}
                </div>
                <div class="period-time">
                  {{ ['08:00-09:40', '10:00-11:40', '14:00-15:40', '16:00-17:40', '19:00-20:40'][scope.$index] }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(day, index) in weekDays"
            :key="day"
            :label="day"
            align="center"
            :width="day === '周六' || day === '周日' ? 100 : 140"
          >
            <template #default="scope">
              <div class="day-cell">
                <div
                  v-for="schedule in getSchedulesForCell(index + 1, scope.$index)"
                  :key="schedule.id"
                  class="course-item"
                  :style="getCellColor(schedule.teacherName)"
                >
                  <div class="course-name">
                    {{ schedule.courseName }}
                  </div>
                  <div class="course-teacher">
                    {{ schedule.teacherName }}
                  </div>
                  <div class="course-room">
                    {{ schedule.classroom }}
                  </div>
                  <div class="course-week">
                    周{{ schedule.weekStart }}-{{ schedule.weekEnd }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card shadow="never" v-if="exams.length > 0">
      <template #header>
        <div class="card-header">
          <span>考试安排</span>
          <el-icon><Document /></el-icon>
        </div>
      </template>
      <div class="table-wrapper">
        <el-table :data="exams" style="width: 100%">
          <el-table-column type="index" label="序号" align="center" width="60" />
          <el-table-column prop="courseName" label="课程名称" align="center" />
          <el-table-column prop="teacherName" label="任课教师" align="center" />
          <el-table-column prop="examTime" label="考试时间" align="center" />
          <el-table-column prop="examLocation" label="考试地点" align="center" />
          <el-table-column prop="examType" label="考试类型" align="center" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-text {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.info-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  color: #606266;
}

.schedule-table {
  :deep(.el-table) {
    .period-cell {
      text-align: center;
      padding: 10px 0;
    }

    .period-text {
      font-weight: bold;
    }

    .period-time {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
    }

    .day-cell {
      min-height: 80px;
    }

    .course-item {
      border-radius: 4px;
      padding: 5px;
      margin: 2px;
      font-size: 12px;
      text-align: center;

      .course-name {
        font-weight: bold;
        margin-bottom: 3px;
      }

      .course-teacher,
      .course-room,
      .course-week {
        font-size: 11px;
        margin-top: 2px;
        opacity: 0.9;
      }
    }
  }
}

.table-wrapper {
  margin-top: 10px;
}
</style>
