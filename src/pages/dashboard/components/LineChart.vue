<script lang="ts" setup>
import * as echarts from "echarts"
import { onMounted, onUnmounted, ref } from "vue"

const props = defineProps<{
  title?: string
}>()
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const defaultTitle = props.title || "用户访问趋势"

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: {
      text: defaultTitle,
      left: "center"
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ["访问量", "注册量"],
      bottom: 10
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "访问量",
        type: "line",
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(102, 177, 255, 0.5)" },
            { offset: 1, color: "rgba(102, 177, 255, 0.05)" }
          ])
        },
        lineStyle: {
          color: "#409EFF",
          width: 2
        },
        itemStyle: {
          color: "#409EFF"
        }
      },
      {
        name: "注册量",
        type: "line",
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(103, 194, 58, 0.5)" },
            { offset: 1, color: "rgba(103, 194, 58, 0.05)" }
          ])
        },
        lineStyle: {
          color: "#67C23A",
          width: 2
        },
        itemStyle: {
          color: "#67C23A"
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="chart-container" />
</template>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 350px;
}
</style>
