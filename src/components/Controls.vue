<template>
  <div class="controls">
    <!-- 适应画布按钮 -->
    <button class="control-btn fit-view-btn" @click="$emit('fit-view')" title="适应画布 (F)">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2h3v1H3v2H2V2zm0 9v3h3v-1H3v-2H2zm9 3h3v-3h-1v2h-2v1zm3-12h-3v1h2v2h1V2z"/>
        <path d="M6 6h4v4H6V6z"/>
      </svg>
    </button>
    
    <!-- 缩放比例显示 -->
    <div class="zoom-indicator">
      {{ Math.round(zoom * 100) }}%
    </div>
  </div>
</template>

<script>
export default {
  name: 'Controls',
  props: {
    zoom: {
      type: Number,
      default: 1
    }
  },
  emits: ['fit-view']
}
</script>

<style scoped>
.controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #1890ff;
  color: #1890ff;
}

.control-btn:active {
  transform: scale(0.95);
}

.zoom-indicator {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #666666;
  text-align: center;
  backdrop-filter: blur(4px);
  min-width: 50px;
}
</style>
