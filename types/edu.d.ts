interface UserInfo {
  id: number
  username: string
  password: string
  name: string
  roles: string
  studentId?: string
  className?: string
  major?: string
}

interface Course {
  id: number
  name: string
  code: string
  description: string
  teacherId: number | null
  teacherName: string
  credits: number
  assessmentMethod: string
  maxStudents: number
  currentStudents: number
  status: "open" | "closed"
  createTime: string
}

interface CourseSelection {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  teacherId: number
  teacherName: string
  selectTime: string
  status: "selected" | "dropped"
}

interface Grade {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  teacherId: number
  teacherName: string
  usualScore: number
  midScore: number
  finalScore: number
  totalScore: number
  updateTime: string
}

interface Schedule {
  id: number
  courseId: number
  courseName: string
  teacherId: number
  teacherName: string
  dayOfWeek: number
  periodStart: number
  periodEnd: number
  classroom: string
  weekStart: number
  weekEnd: number
}

interface Exam {
  id: number
  courseId: number
  courseName: string
  teacherId: number
  teacherName: string
  examTime: string
  examLocation: string
  examType: string
}

interface TeacherRating {
  id: number
  teacherId: number
  teacherName: string
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  teachingAttitude: number
  teachingContent: number
  teachingMethod: number
  teachingEffect: number
  comment: string
  ratingTime: string
}
