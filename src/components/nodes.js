import G6 from '@antv/g6'

/**
 * 注册企业节点
 */
G6.registerNode('company-node', {
  draw(cfg, group) {
    const isSelected = cfg.selected
    const hasChildren = cfg.data.DetailCount > 0
    const expanded = cfg.expanded || false
    
    // 主节点矩形
    const rect = group.addShape('rect', {
      attrs: {
        x: -80,
        y: -25,
        width: 160,
        height: 50,
        radius: 4,
        fill: isSelected ? '#1890ff' : '#ffffff',
        stroke: '#1890ff',
        lineWidth: 1,
        cursor: 'pointer'
      },
      name: 'main-rect'
    })
    
    // 公司名称文字
    const text = cfg.data.Name || cfg.label
    const maxWidth = 140 // 文字最大宽度
    
    // 处理长文本换行
    const lines = this.wrapText(text, maxWidth, 14)
    const lineHeight = 18
    const totalHeight = lines.length * lineHeight
    const startY = -(totalHeight / 2) + (lineHeight / 2)
    
    lines.forEach((line, index) => {
      group.addShape('text', {
        attrs: {
          x: 0,
          y: startY + index * lineHeight,
          text: line,
          fontSize: 14,
          fill: isSelected ? '#ffffff' : '#000000',
          textAlign: 'center',
          textBaseline: 'middle',
          fontWeight: 'normal'
        },
        name: `company-name-${index}`
      })
    })
    
    // 展开/折叠按钮（如果有子节点）
    if (hasChildren) {
      // 按钮背景圆形
      group.addShape('circle', {
        attrs: {
          x: 0,
          y: 37,
          r: 10,
          fill: expanded ? '#666666' : '#1890ff',
          stroke: expanded ? '#666666' : '#1890ff',
          lineWidth: 1,
          cursor: 'pointer'
        },
        name: 'expand-btn'
      })
      
      // 按钮文字
      group.addShape('text', {
        attrs: {
          x: 0,
          y: 37,
          text: expanded ? '−' : '+',
          fontSize: 14,
          fill: '#ffffff',
          textAlign: 'center',
          textBaseline: 'middle',
          cursor: 'pointer',
          fontWeight: 'bold'
        },
        name: 'expand-text'
      })
    }
    
    return rect
  },
  
  update(cfg, item) {
    const group = item.getContainer()
    const isSelected = cfg.selected
    const expanded = cfg.expanded || false
    const hasChildren = cfg.data.DetailCount > 0
    
    // 更新主矩形样式
    const rect = group.find(e => e.get('name') === 'main-rect')
    if (rect) {
      rect.attr({
        fill: isSelected ? '#1890ff' : '#ffffff'
      })
    }
    
    // 更新文字颜色
    const textShapes = group.findAll(e => e.get('name') && e.get('name').startsWith('company-name'))
    textShapes.forEach(textShape => {
      textShape.attr({
        fill: isSelected ? '#ffffff' : '#000000'
      })
    })
    
    // 更新展开按钮状态
    const expandBtn = group.find(e => e.get('name') === 'expand-btn')
    const expandText = group.find(e => e.get('name') === 'expand-text')
    
    if (hasChildren) {
      // 如果有子节点，显示并更新按钮
      if (expandBtn) {
        expandBtn.show()
        expandBtn.attr({
          fill: expanded ? '#666666' : '#1890ff',
          stroke: expanded ? '#666666' : '#1890ff'
        })
      }
      
      if (expandText) {
        expandText.show()
        expandText.attr({
          text: expanded ? '−' : '+'
        })
      }
    } else {
      // 如果没有子节点，隐藏按钮
      if (expandBtn) {
        expandBtn.hide()
      }
      
      if (expandText) {
        expandText.hide()
      }
    }
  },
  
  // 文字换行处理
  wrapText(text, maxWidth, fontSize) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = `${fontSize}px sans-serif`
    
    const words = text.split('')
    const lines = []
    let currentLine = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i]
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // 最多显示2行，超出部分用省略号
    if (lines.length > 2) {
      lines[1] = lines[1].slice(0, -1) + '...'
      return lines.slice(0, 2)
    }
    
    return lines
  }
})

/**
 * 注册自然人节点
 */
G6.registerNode('person-node', {
  draw(cfg, group) {
    // 圆形背景 - 直径与企业节点高度一致（50px）
    const circle = group.addShape('circle', {
      attrs: {
        x: 0,
        y: 0,
        r: 25, // 半径25px，直径50px
        fill: '#ff9500',
        stroke: '#ff9500',
        lineWidth: 1,
        cursor: 'pointer'
      },
      name: 'main-circle'
    })
    
    // 人名 - 添加换行处理
    const name = cfg.data.Name || cfg.label
    const maxWidth = 40 // 圆圈内文字最大宽度
    
    // 处理长文本换行
    const lines = this.wrapText(name, maxWidth, 12)
    const lineHeight = 14
    const totalHeight = lines.length * lineHeight
    const startY = -(totalHeight / 2) + (lineHeight / 2)
    
    lines.forEach((line, index) => {
      group.addShape('text', {
        attrs: {
          x: 0,
          y: startY + index * lineHeight,
          text: line,
          fontSize: 12,
          fill: '#ffffff',
          textAlign: 'center',
          textBaseline: 'middle',
          fontWeight: 'normal'
        },
        name: `person-name-${index}`
      })
    })
    
    return circle
  },
  
  update(cfg, item) {
    // 自然人节点样式相对固定，暂不需要特殊更新逻辑
  },
  
  // 文字换行处理（复用企业节点的方法）
  wrapText(text, maxWidth, fontSize) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = `${fontSize}px sans-serif`
    
    const words = text.split('')
    const lines = []
    let currentLine = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i]
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // 最多显示2行，超出部分用省略号
    if (lines.length > 2) {
      lines[1] = lines[1].slice(0, -1) + '...'
      return lines.slice(0, 2)
    }
    
    return lines
  }
})

/**
 * 注册三段式自定义连线
 */
G6.registerEdge('three-segment-edge', {
  draw(cfg, group) {
    const sourceNode = cfg.sourceNode;
    const targetNode = cfg.targetNode;
    const sourceModel = sourceNode.getModel();
    const targetModel = targetNode.getModel();

    const parentId = cfg.source;
    const parentCenter = { x: sourceModel.x, y: sourceModel.y };
    const childTopCenter = { x: targetModel.x, y: targetModel.y - 25 };
    const virtualPoint = { x: parentCenter.x, y: parentCenter.y + 80 };

    // 计算所有兄弟节点的x坐标范围
    let minX = childTopCenter.x;
    let maxX = childTopCenter.x;
    
    const graph = sourceNode.get('graph');
    if (graph) {
      const edges = graph.getEdges();
      edges.forEach(edge => {
        const source = edge.getSource();
        if (source && source.get('id') === parentId) {
          const target = edge.getTarget();
          if (target) {
            const targetModel = target.getModel();
            minX = Math.min(minX, targetModel.x);
            maxX = Math.max(maxX, targetModel.x);
          }
        }
      });
    }

    // 绘制主干线（从父节点中心垂直向下）
    group.addShape('path', {
      attrs: {
        path: [
          ['M', parentCenter.x, parentCenter.y],
          ['L', parentCenter.x, virtualPoint.y]
        ],
        stroke: '#d9d9d9',
        lineWidth: 1
      },
      name: 'main-trunk'
    });
    
    // 绘制水平汇总线（连接所有子节点的纵向连接点）
    // 如果只有一个子节点，水平线从父节点中心延伸到子节点位置
    if (minX === maxX) {
      // 单个子节点情况：从父节点中心到子节点的水平连接
      group.addShape('path', {
        attrs: {
          path: [
            ['M', parentCenter.x, virtualPoint.y],
            ['L', childTopCenter.x, virtualPoint.y]
          ],
          stroke: '#d9d9d9',
          lineWidth: 1
        },
        name: 'horizontal-line'
      });
    } else {
      // 多个子节点情况：水平线覆盖所有子节点x坐标范围
      group.addShape('path', {
        attrs: {
          path: [
            ['M', minX, virtualPoint.y],
            ['L', maxX, virtualPoint.y]
          ],
          stroke: '#d9d9d9',
          lineWidth: 1
        },
        name: 'horizontal-line'
      });
    }

    // --- 每条边独有的部分：分支线和标签 ---
    const branchLine = group.addShape('path', {
      attrs: {
        path: [
          ['M', childTopCenter.x, virtualPoint.y],
          ['L', childTopCenter.x, childTopCenter.y],
        ],
        stroke: '#d9d9d9',
        lineWidth: 1,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#1890ff',
        },
      },
      name: 'branch-line',
    });

    if (cfg.label) {
      const labelX = childTopCenter.x;
      const labelY = (virtualPoint.y + childTopCenter.y) / 2;
      group.addShape('text', {
        attrs: {
          x: labelX,
          y: labelY,
          text: cfg.label,
          fontSize: 12,
          fill: '#1890ff',
          textAlign: 'center',
          textBaseline: 'middle',
        },
        name: 'label-text',
      });
    }

    return branchLine;
  }
})

