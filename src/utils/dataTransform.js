/**
 * 数据转换工具类
 * 将API数据转换为G6图形库所需的格式
 */

/**
 * 将API数据转换为G6格式
 * @param {Object} apiData - API返回的数据
 * @param {string} parentId - 父节点ID，用于构建边关系
 * @returns {Object} - 包含nodes和edges的G6数据格式
 */
export function transformData(apiData, parentId = null) {
  const nodes = []
  const edges = []
  
  if (!apiData || !apiData.Result) {
    return { nodes, edges }
  }
  
  const result = apiData.Result
  
  // 添加根节点（如果没有父节点ID，说明这是根节点）
  if (!parentId) {
    nodes.push({
      id: result.KeyNo,
      label: result.CompanyName,
      type: 'company-node',
      data: {
        ...result,
        Name: result.CompanyName,
        isRoot: true
      },
      expanded: true, // 根节点默认展开显示子节点
      selected: true // 根节点默认选中
    })
  }
  
  // 添加子节点和边
  if (result.EquityShareDetail && result.EquityShareDetail.length > 0) {
    result.EquityShareDetail.forEach(item => {
      // 判断是否为自然人节点（根据Org字段，0表示企业，1表示自然人）
      const nodeType = item.Org === 1 ? 'person-node' : 'company-node'
      
      nodes.push({
        id: item.KeyNo,
        label: item.Name,
        type: nodeType,
        data: {
          ...item,
          isRoot: false
        },
        expanded: false,
        selected: false
      })
      
      // 创建边关系
      edges.push({
        source: parentId || result.KeyNo,
        target: item.KeyNo,
        label: item.Percent
      })
    })
  }
  
  return { nodes, edges }
}

/**
 * 合并新的子节点数据到现有图数据中
 * @param {Object} currentData - 当前图数据
 * @param {Object} newData - 新的子节点数据
 * @param {string} parentId - 父节点ID
 * @returns {Object} - 合并后的图数据
 */
export function mergeChildData(currentData, newData, parentId) {
  // 生成动态子节点数据，确保每个节点都有子节点可以展开
  const dynamicChildData = generateDynamicChildData(newData, parentId)
  const { nodes: newNodes, edges: newEdges } = transformData(dynamicChildData, parentId)
  
  // 过滤掉已存在的节点
  const existingNodeIds = new Set(currentData.nodes.map(node => node.id))
  const uniqueNewNodes = newNodes.filter(node => !existingNodeIds.has(node.id))
  
  // 过滤掉已存在的边
  const existingEdgeKeys = new Set(
    currentData.edges.map(edge => `${edge.source}-${edge.target}`)
  )
  const uniqueNewEdges = newEdges.filter(
    edge => !existingEdgeKeys.has(`${edge.source}-${edge.target}`)
  )
  
  return {
    nodes: [...currentData.nodes, ...uniqueNewNodes],
    edges: [...currentData.edges, ...uniqueNewEdges]
  }
}

/**
 * 生成动态子节点数据，确保无限展开
 * @param {Object} baseData - 基础数据模板
 * @param {string} parentId - 父节点ID
 * @returns {Object} - 动态生成的子节点数据
 */
export function generateDynamicChildData(baseData, parentId) {
  if (!baseData || !baseData.Result) {
    return baseData
  }
  
  const result = { ...baseData.Result }
  
  // 为每个子节点生成唯一的ID和名称，确保可以无限展开
  if (result.EquityShareDetail && result.EquityShareDetail.length > 0) {
    result.EquityShareDetail = result.EquityShareDetail.map((item, index) => {
      // 基于父节点ID和索引生成唯一的子节点ID
      const uniqueId = `${parentId}_child_${index}_${Date.now()}`
      
      return {
        ...item,
        KeyNo: uniqueId,
        Name: `${item.Name}_${parentId.slice(-4)}`, // 添加父节点标识确保名称唯一
        DetailCount: Math.max(1, item.DetailCount || 2), // 确保每个节点都有子节点可展开
        isGenerated: true // 标记为动态生成的节点
      }
    })
  }
  
  return {
    ...baseData,
    Result: result
  }
}

/**
 * 获取节点的所有子节点ID
 * @param {Array} edges - 边数据
 * @param {string} nodeId - 节点ID
 * @returns {Array} - 子节点ID数组
 */
export function getChildNodeIds(edges, nodeId) {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target)
}

/**
 * 递归获取节点及其所有后代节点ID
 * @param {Array} edges - 边数据
 * @param {string} nodeId - 节点ID
 * @param {Set} visited - 已访问的节点集合，防止循环引用
 * @returns {Array} - 包含节点本身及所有后代节点的ID数组
 */
export function getDescendantNodeIds(edges, nodeId, visited = new Set()) {
  // 防止循环引用导致无限递归
  if (visited.has(nodeId)) {
    return []
  }
  
  visited.add(nodeId)
  const descendants = [nodeId]
  const children = getChildNodeIds(edges, nodeId)
  
  children.forEach(childId => {
    descendants.push(...getDescendantNodeIds(edges, childId, visited))
  })
  
  return descendants
}
