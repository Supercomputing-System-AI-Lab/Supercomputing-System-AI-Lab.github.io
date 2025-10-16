### SSAIL Blogs Publishing Guide

This guide explains how to clone the source, write a post, build the site, and publish the output to the `blogs/` directory on the `main` branch.

### Prerequisites

- Git installed
- Node.js >= 20.11 installed
- Hugo Extended installed (not the standard edition)

Install Hugo Extended by following the official guide: https://gohugo.io/installation/

Verify your tools:
```powershell
hugo version  # output should contain "extended"
node -v       # v20.11.0 or newer
```

### 1) Clone the repository (blog_update branch)
```powershell
git clone -b blog_update --single-branch https://github.com/Supercomputing-System-AI-Lab/Supercomputing-System-AI-Lab.github.io.git
cd Supercomputing-System-AI-Lab.github.io\blog_src
```

Note: `blog_src` is the Hugo site source directory. You will do author/post edits and builds inside this directory.

### 2) Install theme dependencies (first run on a machine)
This project mounts layouts/assets from npm packages under `node_modules` (see `blog_src\config\_default\module.toml`). Install them before building:
```powershell
npm install
```
Without this step you may see errors like `partial "head/head" not found`.

### 3) Ensure you are using Hugo Extended
SCSS compilation requires Hugo Extended. If `hugo version` does not show `extended`, install it:
- Windows (Chocolatey): `choco install hugo-extended -y`
- Windows (Scoop): `scoop install hugo-extended`
- Or download the Extended binary from the official releases and replace your `hugo.exe`.

### 4) Build the static site locally
Ensure Hugo is installed, then run in `blog_src`:
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```
After the build completes, the static files are generated in `blog_src\public`.

### 5) Create and publish a new blog post
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
authors: ["Your Author File Name"]
time-to-read：5
---

Write your Markdown content here.
```

The front matter should at least include: `title`, `date`, `lastmod`, `draft`, `summary`, `categories: []`, `tags: []`, `contributors: []`, `authors: []`, `time-to-read`. You can refer to existing posts for more examples.

Note on `authors`: In your post's `index.md`, set `authors` to the base names (without the `.yaml` suffix) of the author files you created under `blog_src\data\authors`. For example, if you created `blog_src\data\authors\Your_Name.yaml`, use `authors: ["Your_Name"]`.

### 6) Rebuild the site
After creating/updating a post, run in `blog_src`:
```powershell
hugo --gc --minify -b "https://supercomputing-system-ai-lab.github.io/blogs/"
```

### 7) Publish to the `blogs/` directory on the `main` branch
After building, you will have output in `blog_src\public`. Copy everything from that directory into the repository's `main` branch under `blogs/`, then push.

View published site: https://supercomputing-system-ai-lab.github.io/blogs/

### **Important: Don't forget to commit and push any modified site framework/source back to the `blog_update` branch.**

### Math / LaTeX in posts

To typeset LaTeX in a post, wrap the expression with the Hugo math shortcode.

For example, write `{{< math >}}$E=mc^2${{< /math >}}` not `$E=mc^2$`。

### Troubleshooting
- If you see `partial "head/head" not found`: run `npm install` in `blog_src` to fetch theme files into `node_modules`.
- If you see `TOCSS: failed to transform '/scss/app.scss'` or messages about SASS/SCSS: install and use Hugo Extended.
- Page renders without CSS: ensure every author listed in a post exists as a YAML under `blog_src\data\authors`. The `authors` names in `index.md` must exactly match the YAML base names (case-sensitive); otherwise theme components may fail to resolve assets and styles.