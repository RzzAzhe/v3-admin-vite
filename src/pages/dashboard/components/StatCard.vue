<script lang="ts" setup>
import type { Component } from "vue"

interface Props {
  title: string
  value: string | number
  trend?: number
  icon?: Component
  color?: string
}

const { title, value, trend = 0, icon, color = "#409EFF" } = defineProps<Props>()

const isPositive = trend >= 0
</script>

<template>
  <el-card shadow="hover" class="stat-card">
    <div class="card-content">
      <div class="text-section">
        <div class="title">
          {{ title }}
        </div>
        <div class="value">
          {{ value }}
        </div>
        <div class="trend" :class="{ 'trend-positive': isPositive, 'trend-negative': !isPositive }">
          <el-icon v-if="isPositive">
            <CaretTop />
          </el-icon>
          <el-icon v-else>
            <CaretBottom />
          </el-icon>
          <span>{{ Math.abs(trend) }}% 较昨日</span>
        </div>
      </div>
      <div class="icon-section" :style="{ backgroundColor: `${color}20` }">
        <el-icon v-if="icon" class="icon" :style="{ color }">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.stat-card {
  :deep(.el-card__body) {
    padding: 24px;
  }

  .card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .text-section {
    .title {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .value {
      font-size: 28px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .trend {
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;

      &.trend-positive {
        color: var(--el-color-success);
      }

      &.trend-negative {
        color: var(--el-color-danger);
      }
    }
  }

  .icon-section {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 32px;
    }
  }
}
</style>
