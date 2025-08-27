<template>
  <div id="app">
    <div id="container" ref="container"></div>
    <Legend />
    <Controls :zoom="currentZoom" @fit-view="handleFitView" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import G6 from '@antv/g6'
import Legend from './components/Legend.vue'
import Controls from './components/Controls.vue'
import { transformData, mergeChildData, getDescendantNodeIds } from './utils/dataTransform.js'
import './components/nodes.js'

export default {
  name: 'App',
  components: {
    Legend,
    Controls
  },
  setup() {
    const container = ref(null)
    let graph = null
    let graphData = { nodes: [], edges: [] }
    const currentZoom = ref(1)
    
    // 模拟数据加载
    const loadRootData = async () => {
      try {
        const response = await fetch('/root_node.json')
        return await response.json()
      } catch (error) {
        console.error('加载根节点数据失败:', error)
        return null
      }
    }
    
    const loadChildData = async () => {
      try {
        const response = await fetch('/child_node.json')
        return await response.json()
      } catch (error) {
        console.error('加载子节点数据失败:', error)
        return null
      }
    }
    
    // 局部布局函数 - 以父节点为中心展开子节点
    const applyLocalLayout = (data, expandedNodeId) => {
      if (!expandedNodeId) return
      
      const nodes = data.nodes
      const edges = data.edges
      
      // 找到展开的父节点
      const parentNode = nodes.find(node => node.id === expandedNodeId)
      if (!parentNode) return
      
      // 找到该父节点的直接子节点
      const childEdges = edges.filter(edge => edge.source === expandedNodeId)
      const childNodes = childEdges.map(edge => nodes.find(node => node.id === edge.target)).filter(Boolean)
      
      if (childNodes.length === 0) return
      
      // 保持父节点位置不变
      const parentX = parentNode.x
      const parentY = parentNode.y
      
      // 子节点布局在父节点下方150px处
      const childY = parentY + 150
      
      if (childNodes.length === 1) {
        // 单个子节点直接在父节点正下方
        childNodes[0].x = parentX
        childNodes[0].y = childY
      } else {
        // 多个子节点以父节点为中心左右对称分布
        const spacing = 200
        const totalWidth = (childNodes.length - 1) * spacing
        const startX = parentX - totalWidth / 2
        
        childNodes.forEach((node, index) => {
          node.x = startX + index * spacing
          node.y = childY
        })
      }
    }

    // 全局布局函数 - 用于初始化时的完整布局
    const initializeGlobalLayout = (data) => {
      const nodes = data.nodes
      const edges = data.edges
      
      // 找到根节点
      const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id))
      if (!rootNode) return
      
      // 设置根节点位置
      const centerX = window.innerWidth / 2
      const centerY = 100
      rootNode.x = centerX
      rootNode.y = centerY
      
      // 获取每个层级的节点
      const levels = {}
      const visited = new Set()
      
      const buildLevels = (nodeId, level = 0) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)
        
        if (!levels[level]) levels[level] = []
        levels[level].push(nodeId)
        
        // 找到子节点
        const childEdges = edges.filter(edge => edge.source === nodeId)
        childEdges.forEach(edge => {
          buildLevels(edge.target, level + 1)
        })
      }
      
      buildLevels(rootNode.id)
      
      // 为每个层级的节点设置对称位置
      Object.keys(levels).forEach(level => {
        const levelNodes = levels[level].map(id => nodes.find(n => n.id === id))
        const nodeCount = levelNodes.length
        
        if (nodeCount === 1) {
          // 单个节点居中
          levelNodes[0].x = centerX
          levelNodes[0].y = centerY + (parseInt(level) * 150)
        } else {
          // 多个节点左右对称分布
          const spacing = 200
          const totalWidth = (nodeCount - 1) * spacing
          const startX = centerX - totalWidth / 2
          
          levelNodes.forEach((node, index) => {
            node.x = startX + index * spacing
            node.y = centerY + (parseInt(level) * 150)
          })
        }
      })
    }

    // 初始化图形
    const initGraph = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      graph = new G6.Graph({
        container: container.value,
        width,
        height,
        defaultNode: {
          type: 'company-node',
          size: [160, 50]
        },
        defaultEdge: {
          type: 'three-segment-edge',
          style: {
            stroke: '#1890ff',
            lineWidth: 1,
            endArrow: {
              path: 'M 0,0 L 8,4 L 8,-4 Z',
              fill: '#1890ff'
            }
          },
          labelCfg: {
            style: {
              background: {
                fill: '#ffffff',
                stroke: '#ffffff',
                padding: [2, 4, 2, 4],
                radius: 2
              },
              fontSize: 12,
              fill: '#1890ff'
            }
          }
        },
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            {
              type: 'click-select',
              multiple: false
            }
          ]
        },
        fitView: true,
        fitViewPadding: 50
      })
      
      // 监听节点点击事件
      graph.on('node:click', handleNodeClick)
      
      // 监听缩放变化
      graph.on('viewportchange', (e) => {
        if (e.action === 'zoom') {
          currentZoom.value = graph.getZoom()
        }
      })
      
      // 监听画布大小变化
      window.addEventListener('resize', handleResize)
      
      // 监听键盘事件
      window.addEventListener('keydown', handleKeydown)
    }
    
    // 处理节点点击事件
    const handleNodeClick = async (evt) => {
      const { item, target } = evt
      const model = item.getModel()
      const nodeData = model.data
      
      // 检查是否点击了展开按钮
      const targetName = target.get('name')
      const isExpandButtonClick = (targetName === 'expand-btn' || targetName === 'expand-text') && nodeData.DetailCount > 0
      
      if (isExpandButtonClick) {
        await handleExpandCollapse(model)
      } else {
        // 普通节点点击，更新选中状态
        handleNodeSelect(model)
      }
    }
    
    // 处理节点选中
    const handleNodeSelect = (model) => {
      // 清除所有节点的选中状态
      graphData.nodes.forEach(node => {
        node.selected = false
      })
      
      // 设置当前节点为选中状态
      const targetNode = graphData.nodes.find(node => node.id === model.id)
      if (targetNode) {
        targetNode.selected = true
      }
      
      // 更新图形数据
      graph.data(graphData)
      graph.render()
      
      // 不进行自动居中，避免画布移动导致内容跑到屏幕外
      // 用户可以通过适应画布按钮手动调整视图
    }
    
    // 获取节点层级
    const getNodeLevel = (nodeId) => {
      let level = 0
      let currentId = nodeId
      
      while (true) {
        const parentEdge = graphData.edges.find(edge => edge.target === currentId)
        if (!parentEdge) break
        currentId = parentEdge.source
        level++
      }
      
      return level
    }
    
    // 获取同层级的所有节点
    const getSameLevelNodes = (nodeId) => {
      const targetLevel = getNodeLevel(nodeId)
      return graphData.nodes.filter(node => getNodeLevel(node.id) === targetLevel)
    }
    
    // 折叠同层级的其他已展开节点
    const collapseSameLevelNodes = (currentNodeId) => {
      const sameLevelNodes = getSameLevelNodes(currentNodeId)
      sameLevelNodes.forEach(node => {
        if (node.id !== currentNodeId && node.expanded) {
          collapseNode(node.id)
        }
      })
    }
    
    // 处理展开/折叠
    const handleExpandCollapse = async (model) => {
      const nodeData = model.data
      const isExpanded = model.expanded
      
      if (isExpanded) {
        // 折叠节点
        collapseNode(model.id)
      } else {
        // 先折叠同层级的其他节点，再展开当前节点
        collapseSameLevelNodes(model.id)
        await expandNode(model.id, nodeData)
      }
    }
    
    // 展开节点
    const expandNode = async (nodeId, nodeData) => {
      let childData = null
      
      // 统一使用子节点数据进行展开，支持无限展开
      childData = await loadChildData()
      
      if (childData) {
        // 所有节点都使用合并逻辑，确保无限展开
        graphData = mergeChildData(graphData, childData, nodeId)
        
        // 更新父节点的展开状态
        const parentNode = graphData.nodes.find(node => node.id === nodeId)
        if (parentNode) {
          parentNode.expanded = true
          // 确保展开的节点被选中
          graphData.nodes.forEach(node => {
            node.selected = node.id === nodeId
          })
        }
        
        // 应用局部布局，以展开的节点为中心
        applyLocalLayout(graphData, nodeId)
        graph.data(graphData)
        graph.render()
        
        // 不自动居中，避免画布移动导致内容跑到屏幕外
        // 用户可以通过适应画布按钮手动调整视图
      }
    }
    
    // 折叠节点
    const collapseNode = (nodeId) => {
      // 获取所有子节点ID
      const childNodeIds = getDescendantNodeIds(graphData.edges, nodeId)
      childNodeIds.shift() // 移除父节点本身
      
      // 移除子节点和相关边
      graphData.nodes = graphData.nodes.filter(node => !childNodeIds.includes(node.id))
      graphData.edges = graphData.edges.filter(edge => 
        !childNodeIds.includes(edge.source) && !childNodeIds.includes(edge.target)
      )
      
      // 更新父节点的展开状态
      const parentNode = graphData.nodes.find(node => node.id === nodeId)
      if (parentNode) {
        parentNode.expanded = false
      }
      
      // 更新图形
      graph.data(graphData)
      graph.render()
      
      // 应用局部布局
      applyLocalLayout(graphData, nodeId)
      graph.data(graphData)
      graph.render()
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (graph && !graph.get('destroyed')) {
        const width = window.innerWidth
        const height = window.innerHeight
        graph.changeSize(width, height)
        graph.fitView()
      }
    }
    
    // 处理适应画布
    const handleFitView = () => {
      if (graph && !graph.get('destroyed')) {
        graph.fitView(50, {
          easing: 'easeCubic',
          duration: 500
        })
        currentZoom.value = graph.getZoom()
      }
    }
    
    // 键盘快捷键处理
    const handleKeydown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        handleFitView()
      }
    }
    
    // 初始化数据
    const initData = async () => {
      const rootData = await loadRootData()
      if (rootData) {
        graphData = transformData(rootData)
        // 初始化时使用全局布局
        initializeGlobalLayout(graphData)
        graph.data(graphData)
        graph.render()
        graph.fitView()
        currentZoom.value = graph.getZoom()
      }
    }
    
    onMounted(async () => {
      initGraph()
      await initData()
    })
    
    onUnmounted(() => {
      if (graph && !graph.get('destroyed')) {
        graph.destroy()
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      container,
      currentZoom,
      handleFitView
    }
  }
}
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

#container {
  width: 100%;
  height: 100%;
}
</style>
