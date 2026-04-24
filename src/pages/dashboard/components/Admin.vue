<script lang="ts" setup>
import { DataAnalysis, Money, ShoppingCart, UserFilled } from "@element-plus/icons-vue"
import BarChart from "./BarChart.vue"
import LineChart from "./LineChart.vue"
import StatCard from "./StatCard.vue"
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <StatCard
          title="总用户数"
          value="12,580"
          :trend="12.5"
          :icon="UserFilled"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="今日订单"
          value="1,256"
          :trend="8.3"
          :icon="ShoppingCart"
          color="#67C23A"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="本月营收"
          value="¥98,560"
          :trend="-2.1"
          :icon="Money"
          color="#E6A23C"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="访问量"
          value="89,432"
          :trend="15.8"
          :icon="DataAnalysis"
          color="#F56C6C"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <BarChart title="月度销售统计" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <LineChart title="用户访问趋势" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.stat-row {
  margin-bottom: 20px;
}
</style>
