<template>
  <div class="legend">
    <div class="legend-item">
      <div class="legend-icon current-node"></div>
      <span class="legend-text">当前节点</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon company-node"></div>
      <span class="legend-text">企业</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon person-node"></div>
      <span class="legend-text">人员</span>
    </div>
    <div class="legend-item">
      <div class="legend-icon investment-arrow"></div>
      <span class="legend-text">投资</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Legend'
}
</script>

<style scoped>
.legend {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #666666;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.current-node {
  background-color: #1890ff;
  border-radius: 2px;
}

.company-node {
  background-color: #ffffff;
  border: 1px solid #1890ff;
  border-radius: 2px;
}

.person-node {
  background-color: #ff9500;
  border-radius: 50%;
}

.investment-arrow {
  background: linear-gradient(to right, transparent 0%, transparent 30%, #1890ff 30%, #1890ff 70%, transparent 70%, transparent 100%);
  position: relative;
}

.investment-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid #1890ff;
  border-top: 3px solid transparent;
  border-bottom: 3px solid transparent;
}

.legend-text {
  font-size: 12px;
  color: #666666;
}
</style>
