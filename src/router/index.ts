import type { RouteRecordRaw } from "vue-router"
import { createRouter } from "vue-router"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name 常驻路由
 * @description 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置唯一的 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      },
      {
        path: "profile",
        component: () => import("@/pages/profile/index.vue"),
        name: "Profile",
        meta: {
          title: "个人中心",
          elIcon: "UserFilled"
        }
      }
    ]
  },
  {
    path: "/demo",
    component: Layouts,
    redirect: "/demo/unocss",
    name: "Demo",
    meta: {
      title: "示例集合",
      elIcon: "DataBoard"
    },
    children: [
      {
        path: "unocss",
        component: () => import("@/pages/demo/unocss/index.vue"),
        name: "UnoCSS",
        meta: {
          title: "原子化样式"
        }
      },
      {
        path: "element-plus",
        component: () => import("@/pages/demo/element-plus/index.vue"),
        name: "ElementPlus",
        meta: {
          title: "表格管理",
          keepAlive: true
        }
      },
      {
        path: "vxe-table",
        component: () => import("@/pages/demo/vxe-table/index.vue"),
        name: "VxeTable",
        meta: {
          title: "高级表格",
          keepAlive: true
        }
      },
      {
        path: "level2",
        component: () => import("@/pages/demo/level2/index.vue"),
        redirect: "/demo/level2/level3",
        name: "Level2",
        meta: {
          title: "二级路由",
          alwaysShow: true
        },
        children: [
          {
            path: "level3",
            component: () => import("@/pages/demo/level2/level3/index.vue"),
            name: "Level3",
            meta: {
              title: "三级路由",
              keepAlive: true
            }
          }
        ]
      },
      {
        path: "composable-demo",
        redirect: "/demo/composable-demo/use-fetch-select",
        name: "ComposableDemo",
        meta: {
          title: "组合式函数"
        },
        children: [
          {
            path: "use-fetch-select",
            component: () => import("@/pages/demo/composable-demo/use-fetch-select.vue"),
            name: "UseFetchSelect",
            meta: {
              title: "下拉选择器"
            }
          },
          {
            path: "use-fullscreen-loading",
            component: () => import("@/pages/demo/composable-demo/use-fullscreen-loading.vue"),
            name: "UseFullscreenLoading",
            meta: {
              title: "全屏加载"
            }
          },
          {
            path: "use-watermark",
            component: () => import("@/pages/demo/composable-demo/use-watermark.vue"),
            name: "UseWatermark",
            meta: {
              title: "水印功能"
            }
          }
        ]
      }
    ]
  },
  {
    path: "/link",
    meta: {
      title: "文档链接",
      elIcon: "Link"
    },
    children: [
      {
        path: "https://juejin.cn/post/7445151895121543209",
        component: () => {},
        name: "Link1",
        meta: {
          title: "中文文档"
        }
      },
      {
        path: "https://juejin.cn/column/7207659644487139387",
        component: () => {},
        name: "Link2",
        meta: {
          title: "新手教程"
        }
      }
    ]
  }
]

/**
 * @name 动态路由
 * @description 用来放置有权限 (Roles 属性) 的路由
 * @description 必须带有唯一的 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/student",
    component: Layouts,
    redirect: "/student/course-selection",
    name: "Student",
    meta: {
      title: "学生端",
      elIcon: "User",
      roles: ["student"],
      alwaysShow: true
    },
    children: [
      {
        path: "course-selection",
        component: () => import("@/pages/student/course-selection/index.vue"),
        name: "StudentCourseSelection",
        meta: {
          title: "选课退课",
          elIcon: "List",
          roles: ["student"]
        }
      },
      {
        path: "schedule-view",
        component: () => import("@/pages/student/schedule-view/index.vue"),
        name: "StudentScheduleView",
        meta: {
          title: "查看课表",
          elIcon: "Calendar",
          roles: ["student"]
        }
      },
      {
        path: "grade-view",
        component: () => import("@/pages/student/grade-view/index.vue"),
        name: "StudentGradeView",
        meta: {
          title: "查看成绩",
          elIcon: "DocumentChecked",
          roles: ["student"]
        }
      },
      {
        path: "teacher-rating",
        component: () => import("@/pages/student/teacher-rating/index.vue"),
        name: "StudentTeacherRating",
        meta: {
          title: "教师评价",
          elIcon: "Star",
          roles: ["student"]
        }
      }
    ]
  },
  {
    path: "/admin",
    component: Layouts,
    redirect: "/admin/course-management",
    name: "Admin",
    meta: {
      title: "管理员端",
      elIcon: "Setting",
      roles: ["admin"],
      alwaysShow: true
    },
    children: [
      {
        path: "course-management",
        component: () => import("@/pages/admin/course-management/index.vue"),
        name: "AdminCourseManagement",
        meta: {
          title: "课程管理",
          elIcon: "Menu",
          roles: ["admin"]
        }
      },
      {
        path: "course-selection-view",
        component: () => import("@/pages/admin/course-selection-view/index.vue"),
        name: "AdminCourseSelectionView",
        meta: {
          title: "选课情况",
          elIcon: "View",
          roles: ["admin"]
        }
      },
      {
        path: "schedule-management",
        component: () => import("@/pages/admin/schedule-management/index.vue"),
        name: "AdminScheduleManagement",
        meta: {
          title: "排课管理",
          elIcon: "Calendar",
          roles: ["admin"]
        }
      },
      {
        path: "grade-management",
        component: () => import("@/pages/admin/grade-management/index.vue"),
        name: "AdminGradeManagement",
        meta: {
          title: "成绩录入",
          elIcon: "EditPen",
          roles: ["admin"]
        }
      },
      {
        path: "exam-management",
        component: () => import("@/pages/admin/exam-management/index.vue"),
        name: "AdminExamManagement",
        meta: {
          title: "考试安排",
          elIcon: "Clock",
          roles: ["admin"]
        }
      }
    ]
  },
  {
    path: "/system",
    component: Layouts,
    redirect: "/system/operation-log",
    name: "System",
    meta: {
      title: "系统管理",
      elIcon: "Tools",
      roles: ["admin"],
      alwaysShow: true
    },
    children: [
      {
        path: "operation-log",
        component: () => import("@/pages/operation-log/index.vue"),
        name: "OperationLog",
        meta: {
          title: "操作日志",
          roles: ["admin"]
        }
      }
    ]
  }
]

/** 路由实例 */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    location.reload()
  }
}

// 注册路由导航守卫
registerNavigationGuard(router)
