<script lang="ts" setup>
import * as echarts from "echarts"
import { onMounted, onUnmounted, ref } from "vue"

const props = defineProps<{
  title?: string
}>()
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const defaultTitle = props.title || "月度数据统计"

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: {
      text: defaultTitle,
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "销售额",
        type: "bar",
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1380, 1520, 1610, 1780],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#409EFF" },
            { offset: 1, color: "#66b1ff" }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#66b1ff" },
              { offset: 1, color: "#409EFF" }
            ])
          }
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
