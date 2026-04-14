# StarRocom 星洛 - 洛克王国工具

<p align="center">
  <img src="resources/logo.png" alt="StarRocom Logo" width="128" height="128">
</p>

<p align="center">
  <a href="https://github.com/xuanluoxiaofeng/StarRocom">
    <img src="https://img.shields.io/github/license/xuanluoxiaofeng/StarRocom" alt="License">
  </a>
  <a href="https://github.com/xuanluoxiaofeng/StarRocom">
    <img src="https://img.shields.io/github/v/release/xuanluoxiaofeng/StarRocom" alt="Version">
  </a>
  <a href="https://github.com/xuanluoxiaofeng/StarRocom">
    <img src="https://img.shields.io/github/stars/xuanluoxiaofeng/StarRocom" alt="Stars">
  </a>
</p>

## 📖 简介

StarRocom（星洛）是一款专为洛克王国玩家设计的桌面工具，提供宠物图鉴、属性克制表、进化链查询、地图浏览等功能，帮助玩家更好地了解游戏数据。

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔍 宠物图鉴 | 完整的洛克王国宠物数据查询，支持搜索和筛选 |
| ⚔️ 属性克制表 | 可视化属性克制关系，帮助战斗策略 |
| 🔄 进化链 | 清晰的宠物进化路径展示 |
| 🗺️ 游戏地图 | 内置洛克王国世界地图（数据来源：17173.com） |
| 🎯 智能搜索 | 支持按名称、属性、编号搜索宠物 |

## 📸 界面预览

![界面预览](preview.png)

## 🛠️ 技术栈

- **框架：** Electron 33+
- **前端：** HTML5、CSS3、JavaScript
- **打包工具：** electron-builder
- **代码混淆：** javascript-obfuscator

## 📦 安装

### 从源码运行

```bash
# 克隆仓库
git clone https://github.com/xuanluoxiaofeng/StarRocom.git

# 进入目录
cd StarRocom

# 安装依赖
npm install

# 运行应用
npm start
```

### 打包应用

```bash
# Windows 打包
npm run build:win
```

打包完成后，安装包会在 `dist` 目录中。

## 📁 项目结构

```
StarRocom/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
├── renderer.js          # 渲染进程逻辑
├── index.html           # 主页面
├── styles.css           # 样式文件
├── package.json         # 项目配置
├── public/              # 静态资源
│   ├── data/           # 游戏数据
│   │   ├── pets/       # 宠物数据
│   │   ├── tables/     # 游戏配置表
│   │   └── types.json  # 属性数据
│   └── favicon.ico
├── resources/          # 应用资源
│   ├── image/          # 图片资源
│   └── icon.ico       # 应用图标
└── dist/               # 打包输出目录
```

## 📋 数据说明

- 宠物数据来源于洛克王国游戏
- 地图数据来源于 [17173 洛克王国地图](https://map.17173.com/rocom/maps/shijie)
- 本工具为纯查询工具，不涉及游戏修改，不影响游戏平衡

## 🔒 免责声明

1. 本工具仅供学习和交流使用
2. 不包含任何作弊、外挂功能
3. 不会修改游戏内存或拦截游戏数据包
4. 使用本工具不会导致游戏账号被封禁

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v1.1.2
- 新增游戏地图功能
- 优化用户界面
- 修复已知问题

### v1.1.1
- 优化宠物搜索功能
- 改进属性克制表显示

### v1.1.0
- 初始版本发布
- 基础功能：宠物图鉴、属性克制表、进化链

## 📬 联系方式

- **GitHub:** https://github.com/xuanluoxiaofeng
- **Bilibili:** https://space.bilibili.com/345719547

---

## 📄 许可证

本项目采用 MIT 协议开源，详情请查看 [LICENSE](LICENSE) 文件。

---

<p align="center">Made with ❤️ by 璇洛</p>
