<script lang="ts" setup>
import type { FormRules } from "element-plus"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { Lock, User } from "@element-plus/icons-vue"
import { useEduStore } from "@/pinia/stores/edu"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"
import Owl from "./components/Owl.vue"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const eduStore = useEduStore()

const loginFormRef = useTemplateRef("loginFormRef")
const loading = ref(false)

interface LoginFormData {
  username: string
  password: string
  role: "admin" | "student" | "teacher"
}

const loginFormData: LoginFormData = reactive({
  username: "admin",
  password: "12345678",
  role: "admin"
})

const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 16, message: "长度在 6 到 16 个字符", trigger: "blur" }
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }]
}

function handleLogin() {
  loginFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true

    setTimeout(() => {
      const user = eduStore.login(loginFormData.username, loginFormData.password)

      if (user) {
        if (user.roles !== loginFormData.role) {
          ElMessage.error("用户名与角色不匹配，请选择正确的角色")
          loading.value = false
          return
        }

        userStore.setToken(`token-${user.roles}-${user.id}`)
        userStore.setUserInfo({
          username: user.name,
          roles: [user.roles]
        })

        ElMessage.success(`登录成功！欢迎 ${user.roles === "admin" ? "管理员" : user.roles === "student" ? "同学" : "老师"}：${user.name}`)

        const redirect = route.query.redirect
        if (redirect && typeof redirect === "string") {
          router.push(decodeURIComponent(redirect))
        } else {
          router.push("/")
        }
      } else {
        ElMessage.error("用户名或密码错误")
      }

      loading.value = false
    }, 500)
  })
}
</script>

<template>
  <div class="login-container">
    <ThemeSwitch v-if="settingsStore.showThemeSwitch" class="theme-switch" />
    <Owl />
    <div class="login-card">
      <div class="title">
        <div class="system-title">
          教务管理系统
        </div>
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="role">
            <el-radio-group v-model="loginFormData.role" class="role-selector">
              <el-radio-button value="admin">
                管理员
              </el-radio-button>
              <el-radio-button value="student">
                学生
              </el-radio-button>
              <el-radio-button value="teacher">
                教师
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              :placeholder="loginFormData.role === 'admin' ? '请输入管理员账号' : loginFormData.role === 'student' ? '请输入学生账号' : '请输入教师账号'"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="请输入密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-alert title="测试账号" type="info" :closable="false" class="login-tip" show-icon>
            <template #default>
              <div class="tip-content">
                <p>管理员: admin / 12345678</p>
                <p>学生: student1 / 12345678</p>
                <p>教师: teacher1 / 12345678</p>
              </div>
            </template>
          </el-alert>

          <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin">
            登 录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }

  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    background-color: var(--el-bg-color);
    overflow: hidden;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
      background: linear-gradient(135deg, #409eff 0%, #667eea 100%);

      .system-title {
        font-size: 28px;
        font-weight: bold;
        color: #fff;
        letter-spacing: 8px;
      }
    }

    .content {
      padding: 30px 50px 50px 50px;

      .role-selector {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .login-tip {
        margin-bottom: 20px;

        .tip-content {
          font-size: 12px;
          line-height: 1.8;

          p {
            margin: 0;
            color: #606266;
          }
        }
      }

      .el-button {
        width: 100%;
        margin-top: 10px;
        height: 48px;
        font-size: 18px;
        border-radius: 8px;
      }
    }
  }
}
</style>
