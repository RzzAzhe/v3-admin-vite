import { pinia } from "@/pinia"

const STORAGE_KEYS = {
  USERS: "edu_users",
  COURSES: "edu_courses",
  SELECTIONS: "edu_selections",
  GRADES: "edu_grades",
  SCHEDULES: "edu_schedules",
  EXAMS: "edu_exams",
  RATINGS: "edu_ratings"
}

const INITIAL_USERS: UserInfo[] = [
  { id: 1, username: "admin", password: "12345678", name: "管理员", roles: "admin" },
  { id: 2, username: "student1", password: "12345678", name: "张三", roles: "student", studentId: "S2024001", className: "计算机1班", major: "计算机科学与技术" },
  { id: 3, username: "student2", password: "12345678", name: "李四", roles: "student", studentId: "S2024002", className: "计算机1班", major: "计算机科学与技术" },
  { id: 4, username: "teacher1", password: "12345678", name: "王教授", roles: "teacher" },
  { id: 5, username: "teacher2", password: "12345678", name: "李教授", roles: "teacher" }
]

const INITIAL_COURSES: Course[] = [
  { id: 1, name: "高等数学", code: "MATH001", description: "本课程主要讲授函数、极限、微积分等内容", teacherId: 4, teacherName: "王教授", credits: 4, assessmentMethod: "考试（平时30% + 期末70%）", maxStudents: 50, currentStudents: 2, status: "open", createTime: "2024-01-01" },
  { id: 2, name: "数据结构", code: "CS002", description: "本课程主要讲授线性表、树、图等数据结构", teacherId: 5, teacherName: "李教授", credits: 3, assessmentMethod: "考试（平时40% + 期末60%）", maxStudents: 45, currentStudents: 0, status: "open", createTime: "2024-01-02" },
  { id: 3, name: "数据库原理", code: "CS003", description: "本课程主要讲授数据库设计、SQL、事务等", teacherId: 4, teacherName: "王教授", credits: 3, assessmentMethod: "考试（平时30% + 期中20% + 期末50%）", maxStudents: 40, currentStudents: 1, status: "open", createTime: "2024-01-03" }
]

const INITIAL_SELECTIONS: CourseSelection[] = [
  { id: 1, studentId: 2, studentName: "张三", courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", selectTime: "2024-02-01 09:00:00", status: "selected" },
  { id: 2, studentId: 3, studentName: "李四", courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", selectTime: "2024-02-01 10:00:00", status: "selected" },
  { id: 3, studentId: 2, studentName: "张三", courseId: 3, courseName: "数据库原理", teacherId: 4, teacherName: "王教授", selectTime: "2024-02-02 09:00:00", status: "selected" }
]

const INITIAL_SCHEDULES: Schedule[] = [
  { id: 1, courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", dayOfWeek: 1, periodStart: 1, periodEnd: 2, classroom: "教学楼A101", weekStart: 1, weekEnd: 16 },
  { id: 2, courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", dayOfWeek: 3, periodStart: 3, periodEnd: 4, classroom: "教学楼A101", weekStart: 1, weekEnd: 16 },
  { id: 3, courseId: 3, courseName: "数据库原理", teacherId: 4, teacherName: "王教授", dayOfWeek: 2, periodStart: 5, periodEnd: 6, classroom: "教学楼B203", weekStart: 1, weekEnd: 16 }
]

const INITIAL_GRADES: Grade[] = [
  { id: 1, studentId: 2, studentName: "张三", courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", usualScore: 85, midScore: 0, finalScore: 88, totalScore: 87.1, updateTime: "2024-06-15" },
  { id: 2, studentId: 3, studentName: "李四", courseId: 1, courseName: "高等数学", teacherId: 4, teacherName: "王教授", usualScore: 78, midScore: 0, finalScore: 82, totalScore: 80.8, updateTime: "2024-06-15" }
]

function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function getNextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1
}

export const useEduStore = defineStore("edu", () => {
  const users = ref<UserInfo[]>(getStorageData(STORAGE_KEYS.USERS, INITIAL_USERS))
  const courses = ref<Course[]>(getStorageData(STORAGE_KEYS.COURSES, INITIAL_COURSES))
  const selections = ref<CourseSelection[]>(getStorageData(STORAGE_KEYS.SELECTIONS, INITIAL_SELECTIONS))
  const grades = ref<Grade[]>(getStorageData(STORAGE_KEYS.GRADES, INITIAL_GRADES))
  const schedules = ref<Schedule[]>(getStorageData(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES))
  const exams = ref<Exam[]>(getStorageData(STORAGE_KEYS.EXAMS, []))
  const ratings = ref<TeacherRating[]>(getStorageData(STORAGE_KEYS.RATINGS, []))

  // #region 用户管理
  function _saveUsers() {
    setStorageData(STORAGE_KEYS.USERS, users.value)
  }

  function login(username: string, password: string): UserInfo | null {
    const user = users.value.find(u => u.username === username && u.password === password)
    return user || null
  }

  function getTeachers(): UserInfo[] {
    return users.value.filter(u => u.roles === "teacher")
  }

  function getStudents(): UserInfo[] {
    return users.value.filter(u => u.roles === "student")
  }
  // #endregion

  // #region 课程管理
  function saveCourses() {
    setStorageData(STORAGE_KEYS.COURSES, courses.value)
  }

  function addCourse(course: Omit<Course, "id" | "createTime" | "currentStudents">) {
    const newCourse: Course = {
      ...course,
      id: getNextId(courses.value),
      currentStudents: 0,
      status: "open",
      createTime: new Date().toISOString().split("T")[0]
    }
    courses.value.push(newCourse)
    saveCourses()
  }

  function updateCourse(id: number, updates: Partial<Course>) {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...updates }
      saveCourses()
    }
  }

  function deleteCourse(id: number) {
    const hasSelections = selections.value.some(s => s.courseId === id && s.status === "selected")
    if (hasSelections) {
      ElMessage.error("该课程已有学生选课，无法删除")
      return
    }
    courses.value = courses.value.filter(c => c.id !== id)
    saveCourses()
  }
  // #endregion

  // #region 选课管理
  function saveSelections() {
    setStorageData(STORAGE_KEYS.SELECTIONS, selections.value)
  }

  function selectCourse(studentId: number, courseId: number): boolean {
    const student = users.value.find(u => u.id === studentId)
    const course = courses.value.find(c => c.id === courseId)
    if (!student || !course) return false

    const existing = selections.value.find(s => s.studentId === studentId && s.courseId === courseId && s.status === "selected")
    if (existing) {
      ElMessage.warning("已选择该课程")
      return false
    }

    if (course.currentStudents >= course.maxStudents) {
      ElMessage.warning("该课程已选满")
      return false
    }

    const selection: CourseSelection = {
      id: getNextId(selections.value),
      studentId,
      studentName: student.name,
      courseId,
      courseName: course.name,
      teacherId: course.teacherId || 0,
      teacherName: course.teacherName,
      selectTime: new Date().toISOString(),
      status: "selected"
    }
    selections.value.push(selection)

    const courseIndex = courses.value.findIndex(c => c.id === courseId)
    if (courseIndex !== -1) {
      courses.value[courseIndex].currentStudents++
    }

    saveSelections()
    saveCourses()
    return true
  }

  function dropCourse(selectionId: number): boolean {
    const selection = selections.value.find(s => s.id === selectionId)
    if (!selection || selection.status === "dropped") return false

    const index = selections.value.findIndex(s => s.id === selectionId)
    if (index !== -1) {
      selections.value[index].status = "dropped"
    }

    const courseIndex = courses.value.findIndex(c => c.id === selection.courseId)
    if (courseIndex !== -1 && courses.value[courseIndex].currentStudents > 0) {
      courses.value[courseIndex].currentStudents--
    }

    saveSelections()
    saveCourses()
    return true
  }

  function getStudentSelections(studentId: number): CourseSelection[] {
    return selections.value.filter(s => s.studentId === studentId && s.status === "selected")
  }

  function getCourseSelections(courseId: number): CourseSelection[] {
    return selections.value.filter(s => s.courseId === courseId && s.status === "selected")
  }
  // #endregion

  // #region 成绩管理
  function saveGrades() {
    setStorageData(STORAGE_KEYS.GRADES, grades.value)
  }

  function addOrUpdateGrade(grade: Omit<Grade, "id" | "updateTime"> & { id?: number }) {
    const now = new Date().toISOString().split("T")[0]
    if (grade.id) {
      const index = grades.value.findIndex(g => g.id === grade.id)
      if (index !== -1) {
        const total = grade.usualScore * 0.3 + grade.midScore * 0.2 + grade.finalScore * 0.5
        grades.value[index] = {
          ...grades.value[index],
          ...grade,
          totalScore: Number(total.toFixed(1)),
          updateTime: now
        }
      }
    } else {
      const total = grade.usualScore * 0.3 + grade.midScore * 0.2 + grade.finalScore * 0.5
      const newGrade: Grade = {
        ...grade,
        id: getNextId(grades.value),
        totalScore: Number(total.toFixed(1)),
        updateTime: now
      }
      grades.value.push(newGrade)
    }
    saveGrades()
  }

  function getStudentGrades(studentId: number): Grade[] {
    return grades.value.filter(g => g.studentId === studentId)
  }

  function getCourseGrades(courseId: number): Grade[] {
    return grades.value.filter(g => g.courseId === courseId)
  }
  // #endregion

  // #region 排课管理
  function saveSchedules() {
    setStorageData(STORAGE_KEYS.SCHEDULES, schedules.value)
  }

  function addSchedule(schedule: Omit<Schedule, "id">) {
    const newSchedule: Schedule = {
      ...schedule,
      id: getNextId(schedules.value)
    }
    schedules.value.push(newSchedule)
    saveSchedules()
  }

  function updateSchedule(id: number, updates: Partial<Schedule>) {
    const index = schedules.value.findIndex(s => s.id === id)
    if (index !== -1) {
      schedules.value[index] = { ...schedules.value[index], ...updates }
      saveSchedules()
    }
  }

  function deleteSchedule(id: number) {
    schedules.value = schedules.value.filter(s => s.id !== id)
    saveSchedules()
  }

  function getCourseSchedules(courseId: number): Schedule[] {
    return schedules.value.filter(s => s.courseId === courseId)
  }

  function getStudentSchedule(studentId: number): Schedule[] {
    const studentSelections = getStudentSelections(studentId)
    const courseIds = studentSelections.map(s => s.courseId)
    return schedules.value.filter(s => courseIds.includes(s.courseId))
  }
  // #endregion

  // #region 考试管理
  function saveExams() {
    setStorageData(STORAGE_KEYS.EXAMS, exams.value)
  }

  function addExam(exam: Omit<Exam, "id">) {
    const newExam: Exam = {
      ...exam,
      id: getNextId(exams.value)
    }
    exams.value.push(newExam)
    saveExams()
  }

  function updateExam(id: number, updates: Partial<Exam>) {
    const index = exams.value.findIndex(e => e.id === id)
    if (index !== -1) {
      exams.value[index] = { ...exams.value[index], ...updates }
      saveExams()
    }
  }

  function deleteExam(id: number) {
    exams.value = exams.value.filter(e => e.id !== id)
    saveExams()
  }

  function getStudentExams(studentId: number): Exam[] {
    const studentSelections = getStudentSelections(studentId)
    const courseIds = studentSelections.map(s => s.courseId)
    return exams.value.filter(e => courseIds.includes(e.courseId))
  }

  function getCourseExams(courseId: number): Exam[] {
    return exams.value.filter(e => e.courseId === courseId)
  }
  // #endregion

  // #region 教师评分
  function saveRatings() {
    setStorageData(STORAGE_KEYS.RATINGS, ratings.value)
  }

  function addRating(rating: Omit<TeacherRating, "id" | "ratingTime">) {
    const existing = ratings.value.find(
      r => r.studentId === rating.studentId && r.teacherId === rating.teacherId && r.courseId === rating.courseId
    )
    if (existing) {
      ElMessage.warning("您已经对该教师进行过评分")
      return false
    }

    const newRating: TeacherRating = {
      ...rating,
      id: getNextId(ratings.value),
      ratingTime: new Date().toISOString()
    }
    ratings.value.push(newRating)
    saveRatings()
    return true
  }

  function getTeacherRatings(teacherId: number): TeacherRating[] {
    return ratings.value.filter(r => r.teacherId === teacherId)
  }

  function getStudentRatings(studentId: number): TeacherRating[] {
    return ratings.value.filter(r => r.studentId === studentId)
  }
  // #endregion

  return {
    users,
    courses,
    selections,
    grades,
    schedules,
    exams,
    ratings,
    login,
    getTeachers,
    getStudents,
    addCourse,
    updateCourse,
    deleteCourse,
    selectCourse,
    dropCourse,
    getStudentSelections,
    getCourseSelections,
    addOrUpdateGrade,
    getStudentGrades,
    getCourseGrades,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getCourseSchedules,
    getStudentSchedule,
    addExam,
    updateExam,
    deleteExam,
    getStudentExams,
    getCourseExams,
    addRating,
    getTeacherRatings,
    getStudentRatings
  }
})

export function useEduStoreOutside() {
  return useEduStore(pinia)
}
