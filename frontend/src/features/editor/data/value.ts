// @generated-by-ai

import { normalizeStaticValue } from 'platejs';

const HOUR = 3_600_000;
const T_POLISH = Date.now() - 3 * HOUR;
const T_CONTINUE = Date.now() - 2 * HOUR;

export const value = normalizeStaticValue([
  // 开篇
  {
    children: [{ text: '' }],
    type: 'p',
  },
  {
    children: [{ text: 'ProDoc 功能导览' }],
    type: 'h1',
  },
  {
    children: [
      { text: '欢迎体验 ' },
      { bold: true, text: 'ProDoc ' },
      {
        text: '——一份会陪您写作的专业文档 AI 助手。文中出现所有功能，您都可以亲手实现，也欢迎随意改动，把它当作您的试验田。',
      },
    ],
    type: 'p',
  },
  {
    children: [{ text: '目录' }],
    type: 'h2',
  },
  {
    children: [{ text: '' }],
    type: 'toc',
  },
  {
    children: [{ text: '' }],
    type: 'hr',
  },
  // AI 智能写作（总）
  {
    children: [{ text: 'AI 智能写作' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: 'AI 能力直接融入写作流程：改写、续写、校对、翻译、评阅，样样在行。修改类的结果会以「修订」的形式标注在原文上——逐条接受或拒绝，由您做主，它绝不会悄悄改动您的文字。',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: '把光标放在段落中，或选中一段文字，点击工具栏的「AI 指令」按钮即可唤起指令菜单。指令按使用场景分为三组：内容生成（结果直接插入正文）、文档编辑（修改以修订标注在原文上）、对话 & 评论（以批注或对话的形式呈现）。下面分组介绍：',
      },
    ],
    type: 'p',
  },
  // AI 智能写作（分）：内容生成组
  {
    children: [{ text: '内容生成' }],
    type: 'h3',
  },
  {
    children: [{ text: '光标置于段落中即可运行，结果直接插入正文：' }],
    type: 'p',
  },
  {
    children: [
      { text: '自动续写 ' },
      { code: true, text: '/continue' },
      { text: '：顺着上下文补全下文，衔接自然，并保持您原有的语气与节奏；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '生成大纲 ' },
      { code: true, text: '/outline' },
      { text: '：为选题快速搭出章节骨架，写作不必从零开始。' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: '写到一半卡住了？光标停在段落末尾，运行「自动续写」，AI 会顺着上下文补全——',
      },
      {
        suggestion: true,
        suggestion_ai_continue: {
          id: 'ai_continue',
          createdAt: T_CONTINUE,
          createdByAI: true,
          type: 'insert',
          userId: 'alice',
        },
        text: '无论是补充论据、延展场景，还是收束观点，它都能自然衔接，并保持您原有的语气与节奏。',
      },
    ],
    type: 'p',
  },
  // AI 智能写作（分）：文档编辑组
  {
    children: [{ text: '文档编辑' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: '选中一段文字后运行，修改以修订形式标注在原文上，可逐条接受或拒绝：',
      },
    ],
    type: 'p',
  },
  {
    children: [
      { text: '智能润色 ' },
      { code: true, text: '/polish' },
      { text: '：在保留原意的前提下优化措辞与句式；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '语法校对 ' },
      { code: true, text: '/fix' },
      { text: '：逐句排查错别字、标点与语病；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '扩写内容 ' },
      { code: true, text: '/expand' },
      { text: '：为单薄的段落补充细节、例证与论据；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '精简内容 ' },
      { code: true, text: '/shorten' },
      { text: '：删去冗余表达、压缩篇幅，让长句短而有力；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '书面用语 ' },
      { code: true, text: '/formal' },
      { text: '：把口语化表达改写为正式书面语，适合报告与公文；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '通俗用语 ' },
      { code: true, text: '/simplify' },
      { text: '：把艰深的表述改得平实易懂，面向大众读者时尤其好用。' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: '运行「智能润色」，AI 会把修改直接标注在文中：删除线是原文，紧随其后的就是替换后的新文字——',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        suggestion: true,
        suggestion_ai_polish: {
          id: 'ai_polish',
          createdAt: T_POLISH,
          createdByAI: true,
          type: 'remove',
          userId: 'alice',
        },
        text: '这个功能把写得不好的句子改得更加的好读，很有用。',
      },
      {
        suggestion: true,
        suggestion_ai_polish: {
          id: 'ai_polish',
          createdAt: T_POLISH,
          createdByAI: true,
          type: 'insert',
          userId: 'alice',
        },
        text: '它能把生涩的句子改得流畅自然，读起来毫不费力。',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: '每条修订都可以在右侧「修订 & 评论」面板中统一接受或拒绝，也可以直接在修订气泡下回复讨论。',
      },
    ],
    type: 'p',
  },
  // AI 智能写作（分）：对话 & 评论组
  {
    children: [{ text: '对话 & 评论' }],
    type: 'h3',
  },
  {
    children: [{ text: '结果以批注或 AI 对话的形式呈现：' }],
    type: 'p',
  },
  {
    children: [
      { text: '智能评阅 ' },
      { code: true, text: '/review' },
      { text: '：像导师一样审读选中的内容，在关键句旁逐条批注；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '双语互译 ' },
      { code: true, text: '/translate' },
      { text: '：中英文互译，术语与格式保持原样，译文可继续追问；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '深度解释 ' },
      { code: true, text: '/explain' },
      { text: '：用通俗的语言讲清选中的概念或段落；' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '提炼总结 ' },
      { code: true, text: '/summarize' },
      { text: '：抽取长文要点，生成精炼摘要，结果可直接插入正文。' },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      { text: '「智能评阅」的批注长这样，试着点击下面这句高亮文字：' },
    ],
    type: 'p',
  },
  // 评论锚点：与 discussions.ts 的 d_ai_review 对应
  {
    children: [
      {
        comment: true,
        comment_d_ai_review: true,
        text: '据团队观察，启用智能评阅后，文档的平均返工次数减少了一半。',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: '除了菜单里的指令，随时按下 Tab，即可唤起「AI 指令」面板：让它解释选中的段落、翻译全文，或者直接提问。对话中产生的修改建议，同样会以修订形式落回文档。',
      },
    ],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    type: 'hr',
  },
  // 排版与格式
  {
    children: [{ text: '排版与格式' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '从标题、文字样式到表格、公式与代码，常用排版一应俱全；一至三级标题会收录进左侧「大纲」与开头的目录，点击即可跳转。',
      },
    ],
    type: 'p',
  },
  {
    children: [{ text: '文字样式' }],
    type: 'h3',
  },
  {
    children: [
      { text: '选中文字即可设置：' },
      { bold: true, text: '加粗' },
      { text: '、' },
      { italic: true, text: '斜体' },
      { text: '、' },
      { underline: true, text: '下划线' },
      { text: '、' },
      { strikethrough: true, text: '删除线' },
      { text: '、' },
      { code: true, text: '行内代码' },
      { text: '、上标 m' },
      { superscript: true, text: '2' },
      { text: '、下标 H' },
      { subscript: true, text: '2' },
      { text: 'O、' },
      { highlight: true, text: '荧光标记' },
      { text: '，还可以设置' },
      { bold: true, fontSize: '18px', text: '大号字体' },
      { text: '。多种样式可以叠加在同一处文字上。' },
    ],
    type: 'p',
  },
  {
    children: [{ text: '列表' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: '列表分为编号列表与符号列表两种，可以嵌套形成多级结构，常用于梳理步骤与要点：',
      },
    ],
    type: 'p',
  },
  {
    children: [{ text: '第一步：收集素材' }],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [{ text: '第二步：撰写草稿' }],
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [{ text: '先列提纲' }],
    indent: 2,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [{ text: '再填内容' }],
    indent: 2,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [{ text: '表格' }],
    type: 'h3',
  },
  {
    children: [
      {
        text: '点击工具栏的「表格」按钮插入表格，支持合并单元格（如表头的「指令分组」一栏），单元格里可以继续使用普通段落格式：',
      },
    ],
    type: 'p',
  },
  {
    type: 'table',
    children: [
      {
        children: [
          {
            children: [
              {
                children: [{ bold: true, text: '指令分组' }],
                type: 'p',
              },
            ],
            colSpan: 2,
            type: 'th',
          },
          {
            children: [
              {
                children: [{ bold: true, text: '结果形式' }],
                type: 'p',
              },
            ],
            type: 'th',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: '内容生成' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [{ children: [{ text: '光标置于段落中' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [{ children: [{ text: '直接插入正文' }], type: 'p' }],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: '文档编辑' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [{ children: [{ text: '选中一段文字' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              {
                children: [{ text: '以修订标注，可逐条接受或拒绝' }],
                type: 'p',
              },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
      {
        children: [
          {
            children: [{ children: [{ text: '对话 & 评论' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [{ children: [{ text: '选中或未选中均可' }], type: 'p' }],
            type: 'td',
          },
          {
            children: [
              { children: [{ text: '批注或 AI 对话中呈现' }], type: 'p' },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
      },
    ],
  },
  {
    children: [{ text: '数学公式' }],
    type: 'h3',
  },
  {
    children: [
      { text: '行内公式嵌在句子中间，例如质能方程 ' },
      {
        children: [{ text: '' }],
        texExpression: 'E=mc^2',
        type: 'inline_equation',
      },
      { text: '；块级公式独占一行，适合展示完整的推导与定义：' },
    ],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    texExpression: 'c = \\pm\\sqrt{a^2 + b^2}',
    type: 'equation',
  },
  {
    children: [{ text: '代码块' }],
    type: 'h3',
  },
  {
    children: [{ text: '整段代码放进代码块，自动语法高亮：' }],
    type: 'p',
  },
  {
    children: [
      { children: [{ text: 'function greet(name) {' }], type: 'code_line' },
      {
        children: [{ text: '  console.info(`你好，${name}！`);' }],
        type: 'code_line',
      },
      { children: [{ text: '}' }], type: 'code_line' },
      { children: [{ text: '' }], type: 'code_line' },
      { children: [{ text: "greet('写作者');" }], type: 'code_line' },
    ],
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [{ text: '快捷输入' }],
    type: 'h3',
  },
  {
    children: [
      { text: '如果您熟悉 Markdown，敲出符号就能直接触发对应格式：' },
      { code: true, text: '#' },
      { text: ' 得到标题、' },
      { code: true, text: '**文字**' },
      { text: ' 得到加粗、' },
      { code: true, text: '`代码`' },
      { text: ' 得到行内代码、' },
      { code: true, text: '-' },
      { text: ' 与 ' },
      { code: true, text: '1.' },
      { text: ' 开启两种列表、' },
      { code: true, text: '---' },
      { text: ' 插入分隔线、' },
      { code: true, text: '$…$' },
      { text: ' 与 ' },
      { code: true, text: '$$…$$' },
      { text: ' 分别插入行内与块级公式。更多用法可查阅 ' },
      {
        children: [{ text: 'Markdown 语法指南' }],
        type: 'a',
        url: 'https://www.markdownguide.org/basic-syntax/',
      },
      { text: '。' },
    ],
    type: 'p',
  },
  // 图片与文件
  {
    children: [{ text: '图片与文件' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '图片与各类文件都可以从工具栏上传，也可以直接拖拽或粘贴进文档。图片支持调整宽度、附加图注：',
      },
    ],
    type: 'p',
  },
  {
    caption: [{ text: '示例图片：可以调整宽度，也能附加图注' }],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    children: [{ text: '文件会作为附件嵌入正文，例如这份 PDF：' }],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    isUpload: true,
    name: 'sample.pdf',
    type: 'file',
    url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
  },
  // 评论
  {
    children: [{ text: '评论' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '协作时，选中一段文字，点击工具栏的「评论」按钮，即可发起讨论。试着在下面这句话上留一条评论：',
      },
    ],
    type: 'p',
  },
  // 评论锚点：与 discussions.ts 的 d_term 对应
  {
    children: [
      {
        comment: true,
        comment_d_term: true,
        text: '评论与回复会汇聚成一条讨论，任何成员都可以随时加入。',
      },
    ],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    type: 'hr',
  },
  // 结语
  {
    children: [{ text: '开始写作吧' }],
    type: 'h2',
  },
  {
    children: [
      {
        text: '工具栏里还有导入 / 导出、字体切换、阅读模式等效率工具，左侧面板则提供「大纲」跳转与全文「查找」。试着改几个字、发一条评论，或者按下 Tab，让 ',
      },
      { bold: true, text: 'ProDoc' },
      { text: ' 陪您写下一段。' },
    ],
    type: 'p',
  },
  {
    align: 'right',
    children: [{ italic: true, text: '—— ProDoc 团队' }],
    type: 'p',
  },
  {
    children: [{ text: '' }],
    type: 'p',
  },
]);
