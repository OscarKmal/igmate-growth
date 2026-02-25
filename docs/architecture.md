---
# Architecture

## 前端国际化（i18n）规范

### 目标

- 所有用户可见文本必须可国际化（包括：按钮文案、标题、提示语、Toast、占位符、错误文案等）。
- 统一使用浏览器扩展的 i18n 资源（`_locales/<locale>/messages.json`）管理文案。

### 统一入口

- 前端代码统一通过 `src/utils/commonFunction.ts` 中的 `t(key, vars?)` 获取文案。
- `t(key, vars?)` 基于 `browser.i18n.getMessage(key)`，并支持 `{变量名}` 的简单模板替换。

### Key 命名规范

- 采用模块前缀 + 语义化后缀。
- Popup 首页使用 `pop_home_*`，例如：
  - `pop_home_why_choose_us`
  - `pop_home_cta_start`

### 资源文件规范

- 每个新增 key 必须同时添加到以下四种语言文件中，保证 key 集合一致：
  - `locales/en/messages.json`
  - `locales/es/messages.json`
  - `locales/it/messages.json`
  - `locales/pt-BR/messages.json`

### 明令禁止

- 禁止在 React 组件中硬编码用户可见中文/英文文案（测试文本除外，且不得合入主分支）。
- 禁止在项目中混用多个 i18n 入口（例如部分用 `browser.i18n.getMessage`，部分用 `t()`），必须统一使用 `t()`。
- 禁止只更新某一种语言的 messages.json，导致其他语言缺 key。
