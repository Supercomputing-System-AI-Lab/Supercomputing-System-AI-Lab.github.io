### SSAIL Blogs 发布指南

以下步骤将指导你如何获取源码、写作、构建并发布到主分支的 `blogs/` 目录。

### 前置要求
- 已安装 Git
- 已安装 Hugo（参考官方安装文档）

安装 Hugo 请参考官方文档：[Hugo 安装教程](https://gohugo.io/installation/)

### 1) 获取仓库源码（blog_update 分支）
```powershell
git clone -b blog_update --single-branch https://github.com/Supercomputing-System-AI-Lab/Supercomputing-System-AI-Lab.github.io.git
cd Supercomputing-System-AI-Lab.github.io\blog_src
```

说明：`blog_src` 目录是 Hugo 的站点源码目录，后续写作与构建都在该目录内进行。

### 2) 本地构建静态站点
确保已安装 Hugo，然后在 `blog_src` 下执行：
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```
构建完成后，静态文件输出在 `blog_src\public` 目录。

### 3) 发布新 Blog 的写作规范
- **添加作者信息**：在 `blog_src\data\authors` 中新增一个作者 `yaml` 文件，例如：`Your_Name.yaml`
```yaml
name: Your Name
website: https://example.com        # 可选：个人网站，作者名会链接到此网址
avatar: images/authors/yourname.jpg # 可选：头像相对路径（相对于 static/ 根）
```
- **添加作者头像**：将头像图片放在 `blog_src\static\images\authors` 中；或者使用已有的 `default.png`。
- **创建文章目录**：在 `blog_src\content\blog` 下为你的文章新建一个文件夹，例如：`your-post`，其结构建议为：
```
blog_src\content\blog\your-post\
├─ index.md
└─ img\
   ├─ fig1.png
   └─ ...
```
请将文章使用到的所有图片放入上述 `img` 文件夹中。
- **`index.md` 题头（front matter）示例**：
```yaml
---
title: "文章标题"
date: 2025-09-14
lastmod: 2025-09-14
draft: false
summary: "一句话摘要。"
categories: []
tags: []
contributors: []
authors: ["Your Name"]
---

在这里撰写你的 Markdown 正文内容。
```

题头请参考已有文章，至少包含以下字段：`title`, `date`, `lastmod`, `draft`, `summary`, `categories: []`, `tags: []`, `contributors: []`, `authors: []`。

### 4) 重新构建站点
每次完成/更新文章后，在 `blog_src` 下执行：
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```

### 5) 发布到主分支的 `blogs/` 目录
构建完成后，会产生 `blog_src\public` 目录。将该目录内的全部内容复制到仓库主分支（`main`）下的 `blogs/` 目录并推送。

一种可行的方式（在仓库根目录执行）：
```powershell
cd ..  # 回到仓库根目录 Supercomputing-System-AI-Lab.github.io
# 获取并切换到 main 分支（首次需 fetch）
git fetch origin main:main
git checkout main

# 确保存在 blogs 目录
mkdir -Force blogs | Out-Null

# 将构建产物复制到 blogs/（Windows 下使用 robocopy）
robocopy .\blog_src\public .\blogs /E /NFL /NDL /NJH /NJS /nc /ns /np

# 提交并推送
git add blogs
git commit -m "Publish blog: your-post"
git push origin main
```

完成以上步骤后，站点将从 `https://supercomputing-system-ai-lab.github.io/blogs/` 提供最新内容。

### 附：可选本地预览
在写作过程中，你也可以本地预览（可选）：
```powershell
hugo server -D
```
访问命令行中给出的本地地址查看效果。
