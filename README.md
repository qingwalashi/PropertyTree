# Vue3 股权穿透图

基于 Vue3 + AntV G6 实现的股权穿透图可视化项目，仿照企查查的股权穿透功能。

## 项目特性

- 🎯 **股权穿透可视化** - 清晰展示企业股权结构和投资关系
- 🔄 **动态展开折叠** - 支持节点的展开和折叠操作
- 🎨 **自定义节点样式** - 企业节点和自然人节点的差异化设计
- 📐 **对称布局算法** - 实现左右对称的美观布局效果
- 🔗 **三段式连线** - 纵向-横向-纵向的规范连线样式
- 🎮 **交互控制** - 缩放、拖拽、适应画布等交互功能
- ⌨️ **键盘快捷键** - F键快速适应画布
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **图形引擎**: AntV G6
- **样式**: CSS3
- **开发语言**: JavaScript

## 项目结构

```
PropertyTree/
├── public/                 # 静态资源
│   ├── root_node.json     # 根节点数据
│   └── child_node.json    # 子节点数据
├── src/
│   ├── components/        # 组件目录
│   │   ├── nodes.js      # 自定义节点和连线
│   │   ├── Legend.vue    # 图例组件
│   │   └── Controls.vue  # 控制面板组件
│   ├── utils/            # 工具函数
│   │   └── dataTransform.js # 数据转换工具
│   ├── App.vue           # 主应用组件
│   ├── main.js           # 应用入口
│   └── style.css         # 全局样式
├── index.html            # HTML模板
├── package.json          # 项目配置
├── vite.config.js        # Vite配置
└── README.md            # 项目说明
```

## 安装和运行

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用说明

### 基本操作

1. **查看股权结构** - 页面加载后自动显示根节点及其基本信息
2. **展开子节点** - 点击节点上的展开按钮（+）查看下级股权关系
3. **折叠子节点** - 点击节点上的折叠按钮（-）隐藏下级节点
4. **节点选择** - 点击节点主体区域选中节点（蓝色高亮）
5. **画布操作** - 鼠标拖拽移动画布，滚轮缩放视图

### 控制面板

- **适应画布按钮** - 自动调整图形大小以适应整个画布
- **缩放比例显示** - 实时显示当前缩放百分比

### 键盘快捷键

- **F键** - 快速适应画布

### 图例说明

- **蓝色矩形节点** - 企业/公司
- **橙色圆形节点** - 自然人
- **蓝色箭头连线** - 投资关系
- **百分比标签** - 持股比例

## 数据格式

### 根节点数据 (root_node.json)

```json
{
  "KeyNo": "节点唯一标识",
  "Name": "企业名称",
  "Category": "企业类型",
  "OperName": "法定代表人",
  "StartDate": "成立日期",
  "Status": "企业状态",
  "Percent": "持股比例",
  "Logo": "企业logo",
  "IsController": "是否控股",
  "StockPercentTotal": "总持股比例",
  "children": []
}
```

### 子节点数据 (child_node.json)

```json
{
  "data": [
    {
      "KeyNo": "子节点标识",
      "Name": "子企业名称",
      "Percent": "持股比例",
      // ... 其他字段
    }
  ]
}
```

## 自定义开发

### 添加新的节点类型

在 `src/components/nodes.js` 中注册新的节点类型：

```javascript
G6.registerNode('custom-node', {
  draw(cfg, group) {
    // 自定义绘制逻辑
  }
})
```

### 修改布局算法

在 `src/App.vue` 中的 `applySymmetricLayout` 函数中修改布局逻辑。

### 自定义连线样式

在 `src/components/nodes.js` 中修改 `custom-edge` 的绘制逻辑。

## 浏览器兼容性

- Chrome >= 80
- Firefox >= 78
- Safari >= 13
- Edge >= 80

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 更新日志

### v1.0.0
- 初始版本发布
- 实现基本的股权穿透图功能
- 支持节点展开折叠
- 实现对称布局和三段式连线
