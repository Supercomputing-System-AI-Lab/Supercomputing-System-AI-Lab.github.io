### SSAIL Blogs Publishing Guide

This guide explains how to clone the source, write a post, build the site, and publish the output to the `blogs/` directory on the `main` branch.

### Prerequisites
- Git installed
- Hugo installed (see official docs)

Install Hugo by following the official guide: https://gohugo.io/installation/

### 1) Clone the repository (blog_update branch)
```powershell
git clone -b blog_update --single-branch https://github.com/Supercomputing-System-AI-Lab/Supercomputing-System-AI-Lab.github.io.git
cd Supercomputing-System-AI-Lab.github.io\blog_src
```

Note: `blog_src` is the Hugo site source directory. You will do author/post edits and builds inside this directory.

### 2) Build the static site locally
Ensure Hugo is installed, then run in `blog_src`:
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```
After the build completes, the static files are generated in `blog_src\public`.

### 3) Create and publish a new blog post
- **Add author info**: create a new author YAML file under `blog_src\data\authors`, e.g. `Your_Name.yaml`:
```yaml
name: Your Name
website: https://example.com        # Optional: personal website; author name will link to this URL
avatar: images/authors/yourname.jpg # Optional: avatar path relative to the static/ root
```
- **Add author avatar**: place the avatar image under `blog_src\static\images\authors`; or use the existing `default.png`.
- **Create a post directory**: under `blog_src\content\blog`, create a folder for your post, e.g. `your-post`, with the following structure:
```
blog_src\content\blog\your-post\
├─ index.md
└─ img\
   ├─ fig1.png
   └─ ...
```
Put all images used by the post inside the `img` folder above.
- **`index.md` front matter example**:
```yaml
---
title: "Post Title"
date: 2025-09-14
lastmod: 2025-09-14
draft: false
summary: "One-sentence summary."
categories: []
tags: []
contributors: []
authors: ["Your Name"]
---

Write your Markdown content here.
```

The front matter should at least include: `title`, `date`, `lastmod`, `draft`, `summary`, `categories: []`, `tags: []`, `contributors: []`, `authors: []`. You can refer to existing posts for more examples.

### 4) Rebuild the site
After creating/updating a post, run in `blog_src`:
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```

### 5) Publish to the `blogs/` directory on the `main` branch
After building, you will have output in `blog_src\public`. Copy everything from that directory into the repository's `main` branch under `blogs/`, then push.
