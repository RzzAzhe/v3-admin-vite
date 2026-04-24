<script lang="ts" setup>
import { ChatDotRound, Document, Edit, View } from "@element-plus/icons-vue"
import BarChart from "./BarChart.vue"
import LineChart from "./LineChart.vue"
import StatCard from "./StatCard.vue"
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <StatCard
          title="文章总数"
          value="3,256"
          :trend="5.2"
          :icon="Document"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="待编辑"
          value="128"
          :trend="-3.5"
          :icon="Edit"
          color="#E6A23C"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="已发布"
          value="2,890"
          :trend="8.1"
          :icon="View"
          color="#67C23A"
        />
      </el-col>
      <el-col :span="6">
        <StatCard
          title="评论数"
          value="15,680"
          :trend="12.3"
          :icon="ChatDotRound"
          color="#909399"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <BarChart title="月度文章发布统计" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <LineChart title="文章阅读趋势" />
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
