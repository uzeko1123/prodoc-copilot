// @generated-by-ai

/**
 * ProDoc Copilot 产品首页（路由 "/"，纯静态营销页，无任何后端请求）。
 *
 * 页面结构：导航 → Hero → 能力速览 → AI 智能写作 / 排版与格式 / 协作与评审
 * → 任务工作流 → 知识库 & 模板 → CTA → 页脚。全页唯一行动入口为 /dashboard。
 *
 * 视觉：黑白灰单色调，强调色统一使用 primary（近黑）；除 Hero 与底部 CTA
 * 居中聚焦外，其余区块一律左对齐，保持整齐的版面节奏。
 *
 * 配图说明：页面所有图片均为 <ImageSlot> 占位。生图提示词（已组装、可直接
 * 复制使用）位于 src/assets/img/index/<槽位名>.png.txt；出图后保存为同目录
 * 的 <槽位名>.png 即自动替换占位，无需改动任何代码。
 */
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Kbd } from '@/components/shadcn/ui/kbd';
import { createFileRoute, Link } from '@tanstack/react-router';
import { cn } from 'cn';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  CirclePlusIcon,
  DatabaseIcon,
  FormIcon,
  ImagePlusIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  PaletteIcon,
  PencilIcon,
  PencilSparklesIcon,
  PenLineIcon,
  ScaleIcon,
  SparklesIcon,
  StampIcon,
  WandSparklesIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 首页配图自动拾取：把出图保存为 src/assets/img/index/<槽位名>.png 放入该
 * 目录，即可自动替换对应占位（开发时新增文件热更新，构建时由 Vite 打包），
 * 无需改动任何代码。生图提示词见同目录 <槽位名>.png.txt（已组装可直接复制）。
 */
const SLOT_SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../assets/img/index/*.png', {
      eager: true,
      import: 'default',
    }),
  ).map(([path, url]) => {
    const file = path.split('/').pop() ?? path;
    return [file.replace(/\.png$/, ''), url];
  }),
);

/** <ImageSlot> 图片占位组件 —— 首页配图统一由此渲染 */
function ImageSlot({
  slot,
  src,
  alt,
  ratio = 'aspect-video',
  caption,
  className,
}: {
  /** 槽位 id，自动对应 src/assets/img/index/<slot>.png */
  slot: string;
  /** 显式图片地址，优先于自动拾取；两者皆缺省时渲染占位样式 */
  src?: string;
  /** 真图的 alt 文本；占位态作为 aria-label 使用 */
  alt: string;
  /** Tailwind 宽高比工具类，默认 'aspect-video' */
  ratio?: string;
  /** 占位卡片正中的说明文字：这张图应画什么 */
  caption: string;
  className?: string;
}) {
  const containerClass = cn(
    'relative overflow-hidden rounded-xl border bg-card',
    ratio,
    className,
  );

  const resolved = src ?? SLOT_SOURCES[slot];

  if (resolved) {
    return (
      <div className={containerClass}>
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div role="img" aria-label={alt} className={containerClass}>
      <div
        aria-hidden="true"
        className="bg-muted/40 from-primary/10 to-primary/5 absolute inset-0 bg-linear-to-br via-transparent"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <ImagePlusIcon aria-hidden="true" className="text-primary/50 size-8" />
        <p className="text-muted-foreground text-sm">{caption}</p>
        <span className="text-primary/60 font-mono text-xs">
          image slot: {slot}
        </span>
      </div>
    </div>
  );
}

/** 区块标题：眉标 Badge + H2 + 描述（左对齐） */
function SectionHeading({
  eyebrow,
  title,
  description,
  titleId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** 供所在 section 的 aria-labelledby 引用 */
  titleId: string;
}) {
  return (
    <div className="max-w-2xl">
      <Badge
        variant="outline"
        className="border-primary/10 bg-primary/5 text-primary"
      >
        {eyebrow}
      </Badge>
      <h2
        id={titleId}
        className="mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl"
      >
        {title}
      </h2>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
        {description}
      </p>
    </div>
  );
}

/** 指令 / 快捷键小标签：<code> 指令 + 灰色说明 */
function CommandChip({ command, label }: { command: string; label: string }) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
      <code className="text-primary font-mono">{command}</code>
      {label}
    </span>
  );
}

/** 功能清单：对勾 + 「标题 — 说明」列表 */
function FeatureChecklist({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <CheckIcon
            aria-hidden="true"
            className="text-primary mt-0.5 size-4 shrink-0"
          />
          <p className="text-sm leading-relaxed">
            <span className="font-medium">{item.title}</span>
            <span className="text-muted-foreground"> — {item.description}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/** 品牌标：与侧边栏 / favicon 一致的 PencilSparkles 图标 */
function BrandMark() {
  return (
    <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
      <PencilSparklesIcon aria-hidden="true" className="size-4" />
    </span>
  );
}

function LandingNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <a
            href="#top"
            aria-label="ProDoc Copilot，返回顶部"
            className="flex items-center gap-2.5"
          >
            <BrandMark />
            <span className="text-base font-semibold">ProDoc Copilot</span>
          </a>
          <nav
            aria-label="主导航"
            className="text-muted-foreground ml-6 hidden items-center gap-6 text-sm md:flex"
          >
            <a
              className="hover:text-foreground transition-colors"
              href="#features"
            >
              功能特性
            </a>
            <a
              className="hover:text-foreground transition-colors"
              href="#workflow"
            >
              任务工作流
            </a>
            <a
              className="hover:text-foreground transition-colors"
              href="#knowledge"
            >
              知识库
            </a>
          </nav>
        </div>
        <Button asChild>
          <Link to="/dashboard">进入工作台</Link>
        </Button>
      </div>
    </header>
  );
}

function LandingHero() {
  return (
    <section id="top" className="scroll-mt-20 pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/10 bg-primary/5 text-primary"
          >
            <SparklesIcon aria-hidden="true" />
            专业文档 AI 助手
          </Badge>
          <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight text-balance md:text-6xl">
            专业文档写作，从此有了 AI 搭档
          </h1>
          <p className="text-muted-foreground mt-5 text-base leading-relaxed md:text-lg">
            续写、润色、校对、翻译、评阅——12 项 AI
            指令融入写作流程；修改以「修订」标注，逐条接受或拒绝，绝不悄悄改动您的文字。
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild className="h-11 px-6 text-base">
              <Link to="/dashboard">
                进入工作台
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 text-base">
              <a href="#features">了解功能</a>
            </Button>
          </div>
        </div>
        <div className="mt-12 md:mt-16">
          {/* 生图提示词见 src/assets/img/index/hero-main.png.txt；
              出图存为同目录 hero-main.png 即自动替换 */}
          <ImageSlot
            slot="hero-main"
            ratio="aspect-[16/9]"
            alt="ProDoc Copilot 界面示意：AI 在文档中以修订形式给出建议"
            caption="主视觉：AI 协作写作场景（文档 + 修订建议 + AI 面板）"
            className="shadow-2xl shadow-black/10"
          />
        </div>
      </div>
    </section>
  );
}

const HIGHLIGHTS = [
  {
    value: '12 项',
    label: 'AI 写作指令',
    note: '续写、润色、校对、翻译、评阅……',
  },
  {
    value: '3 类',
    label: '指令场景',
    note: '内容生成 · 文档编辑 · 对话评论',
  },
  {
    value: '4 个',
    label: '任务流转阶段',
    note: '撰写 → 评审 → 修订 → 定稿',
  },
  {
    value: '100%',
    label: '修改可追溯',
    note: '每条 AI 修订均可逐条取舍',
  },
];

function HighlightsStrip() {
  return (
    <section
      aria-labelledby="highlights-title"
      className="bg-muted/30 border-y"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <h2 id="highlights-title" className="sr-only">
          能力速览
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item.label} className="border-t pt-4">
              <p className="text-3xl font-bold tabular-nums md:text-4xl">
                {item.value}
              </p>
              <p className="mt-1.5 text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {item.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const AI_COMMAND_GROUPS: {
  icon: LucideIcon;
  title: string;
  description: string;
  commands: { command: string; label: string }[];
}[] = [
  {
    icon: WandSparklesIcon,
    title: '内容生成',
    description: '光标置于段落即可运行，结果直接插入正文。',
    commands: [
      { command: '/continue', label: '自动续写' },
      { command: '/outline', label: '生成大纲' },
    ],
  },
  {
    icon: PenLineIcon,
    title: '文档编辑',
    description: '选中文字后运行，修改以「修订」标注，可逐条接受或拒绝。',
    commands: [
      { command: '/polish', label: '润色' },
      { command: '/fix', label: '校对' },
      { command: '/expand', label: '扩写' },
      { command: '/shorten', label: '精简' },
      { command: '/formal', label: '书面化' },
      { command: '/simplify', label: '通俗化' },
    ],
  },
  {
    icon: MessagesSquareIcon,
    title: '对话 & 评论',
    description: '结果以批注或 AI 对话的形式呈现。',
    commands: [
      { command: '/review', label: '智能评阅' },
      { command: '/translate', label: '中英互译' },
      { command: '/explain', label: '深度解释' },
      { command: '/summarize', label: '提炼总结' },
    ],
  },
];

function FeatureAiWriting() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-20 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          titleId="features-title"
          eyebrow="AI 智能写作"
          title="十二项 AI 指令，覆盖写作全流程"
          description="把光标放进段落，或选中一段文字，AI 指令随手唤起：生成结果直接写入正文，修改以「修订」标注在原文上——逐条接受或拒绝，改不改由您做主。"
        />
        <div className="mt-12 grid items-center gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-4">
            {AI_COMMAND_GROUPS.map((group) => (
              <Card key={group.title} className="gap-3 px-4">
                <div className="flex items-center gap-2.5">
                  <group.icon
                    aria-hidden="true"
                    className="text-primary size-5"
                  />
                  <h3 className="font-semibold">{group.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {group.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.commands.map((entry) => (
                    <CommandChip
                      key={entry.command}
                      command={entry.command}
                      label={entry.label}
                    />
                  ))}
                </div>
              </Card>
            ))}
            <p className="text-muted-foreground px-1 text-sm leading-relaxed">
              随时按下 <Kbd>Tab</Kbd>
              ，唤起 AI 面板，直接提问，或让它解释、翻译选中的段落。
            </p>
          </div>
          {/* 生图提示词见 src/assets/img/index/feature-ai.png.txt；
              出图存为同目录 feature-ai.png 即自动替换 */}
          <ImageSlot
            slot="feature-ai"
            ratio="aspect-[4/3]"
            alt="AI 指令菜单与修订标注的界面特写"
            caption="功能图：斜杠指令菜单与修订标注特写"
          />
        </div>
      </div>
    </section>
  );
}

const TYPOGRAPHY_ITEMS = [
  {
    title: '丰富的文字样式',
    description: '加粗、斜体、上下标、行内代码、荧光标记，可叠加使用',
  },
  {
    title: '列表与表格',
    description: '多级嵌套列表，表格支持合并单元格',
  },
  {
    title: '数学公式',
    description: '行内与块级 LaTeX 公式，如 E=mc²',
  },
  {
    title: '代码块',
    description: '自动语法高亮',
  },
  {
    title: '图片与附件',
    description: '可调宽度的插图与图注，PDF 附件内嵌正文',
  },
  {
    title: '效率工具',
    description:
      '导入 / 导出、字体切换、阅读模式；左侧「大纲」跳转与全文「查找」',
  },
];

const MARKDOWN_SHORTCUTS = [
  { syntax: '#', label: '标题' },
  { syntax: '**文字**', label: '加粗' },
  { syntax: '`代码`', label: '行内代码' },
  { syntax: '-', label: '列表' },
  { syntax: '1.', label: '编号' },
  { syntax: '---', label: '分隔线' },
  { syntax: '$…$', label: '行内公式' },
  { syntax: '$$…$$', label: '块级公式' },
];

function FeatureTypography() {
  return (
    <section
      id="typography"
      aria-labelledby="typography-title"
      className="bg-muted/30 scroll-mt-20 border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          titleId="typography-title"
          eyebrow="排版与格式"
          title="专业排版，开箱即用"
          description="从文字样式到表格、公式与代码，常用排版一应俱全；熟悉 Markdown 的话，敲下符号即可直接触发对应格式。"
        />
        <div className="mt-12 grid items-center gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <div className="md:order-first">
            {/* 生图提示词见 src/assets/img/index/feature-typography.png.txt；
                出图存为同目录 feature-typography.png 即自动替换 */}
            <ImageSlot
              slot="feature-typography"
              ratio="aspect-[4/3]"
              alt="包含公式、代码块与表格的富文本文档示意"
              caption="功能图：富排版文档拼贴（公式、代码块、表格）"
            />
          </div>
          <div>
            <FeatureChecklist items={TYPOGRAPHY_ITEMS} />
            <div className="mt-8">
              <p className="text-sm font-medium">Markdown 快捷输入</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {MARKDOWN_SHORTCUTS.map((entry) => (
                  <CommandChip
                    key={entry.syntax}
                    command={entry.syntax}
                    label={entry.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const COLLABORATION_ITEMS = [
  {
    title: '评论与讨论',
    description: '选中即评论，回复汇聚成串，任何成员随时加入',
  },
  {
    title: '修订面板',
    description: 'AI 与协作者的修改集中呈现，逐条接受或拒绝',
  },
  {
    title: '智能评阅',
    description: 'AI 像导师一样在关键句旁逐条批注',
  },
  {
    title: '角色分工',
    description: '「我编写的」与「我评审的」两个视图，职责清晰',
  },
];

function FeatureCollaboration() {
  return (
    <section
      id="collaboration"
      aria-labelledby="collaboration-title"
      className="scroll-mt-20 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          titleId="collaboration-title"
          eyebrow="协作与评审"
          title="每一稿，都有据可循"
          description="选中文字即可发起评论，回复自动汇成讨论串；AI 与协作者的修改统一进入「修订 & 评论」面板，接受还是拒绝，一目了然。"
        />
        <div className="mt-12 grid items-center gap-10 md:mt-16 md:grid-cols-2 md:gap-16">
          <div>
            <FeatureChecklist items={COLLABORATION_ITEMS} />
          </div>
          {/* 生图提示词见 src/assets/img/index/feature-collaboration.png.txt；
              出图存为同目录 feature-collaboration.png 即自动替换 */}
          <ImageSlot
            slot="feature-collaboration"
            ratio="aspect-[4/3]"
            alt="评论讨论串与修订面板的界面特写"
            caption="功能图：评论讨论串与修订面板特写"
          />
        </div>
      </div>
    </section>
  );
}

const WORKFLOW_STEPS: {
  step: string;
  icon: LucideIcon;
  badge: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  title: string;
  description: string;
}[] = [
  {
    step: '01',
    icon: PencilIcon,
    badge: '撰写中',
    badgeVariant: 'secondary',
    title: '编写',
    description:
      '创建者执笔写作，AI 续写、润色、查资料全程相陪；完成后一键「提交评审」。',
  },
  {
    step: '02',
    icon: MessageSquareIcon,
    badge: '评审中',
    badgeVariant: 'default',
    title: '评审',
    description:
      '评审者批注评论、直接修改文字；不满意可「退回」，作者「重新提交」，往返皆有记录。',
  },
  {
    step: '03',
    icon: StampIcon,
    badge: '已定稿',
    badgeVariant: 'outline',
    title: '定稿',
    description: '评审「通过」后任务定稿，文档转为只读，内容与讨论完整留存。',
  },
];

function WorkflowSection() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-title"
      className="bg-muted/30 scroll-mt-20 border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          titleId="workflow-title"
          eyebrow="任务工作流"
          title="编写 → 评审 → 定稿，一气呵成"
          description="每份文档都是一个任务：撰写者执笔、评审者把关，往返修订有迹可循，定稿后文档转为只读、安心归档。"
        />
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {WORKFLOW_STEPS.map((entry) => (
            <Card key={entry.step} className="gap-4 px-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-mono text-sm font-medium">
                  {entry.step}
                </span>
                <Badge variant={entry.badgeVariant}>{entry.badge}</Badge>
              </div>
              <entry.icon aria-hidden="true" className="text-primary size-6" />
              <h3 className="text-lg font-semibold">{entry.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {entry.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const KNOWLEDGE_TILES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: FormIcon,
    title: '文档模板',
    description: '常用文种一键起步，格式天然统一',
  },
  {
    icon: BookOpenIcon,
    title: '写作指南',
    description: '团队约定好的写法，收敛在一份指南里',
  },
  {
    icon: ScaleIcon,
    title: '标准规范',
    description: '引用标准有处可查，行文有据可依',
  },
  {
    icon: PaletteIcon,
    title: '风格参考',
    description: '优秀范文与风格样例，写作时对照借鉴',
  },
  {
    icon: DatabaseIcon,
    title: '事实来源',
    description: '关键数据与事实的出处，集中沉淀',
  },
  {
    icon: CirclePlusIcon,
    title: '快速创建',
    description: '从模板或空白文档开始，几秒进入写作',
  },
];

function KnowledgeSection() {
  return (
    <section
      id="knowledge"
      aria-labelledby="knowledge-title"
      className="scroll-mt-20 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading
          titleId="knowledge-title"
          eyebrow="知识库 & 模板"
          title="好写法，值得沉淀下来"
          description="把团队的模板、指南与规范放进 ProDoc：新文档从模板起笔，写法向指南看齐，标准规范、风格参考与事实来源随手可查。"
        />
        {/* 生图提示词见 src/assets/img/index/knowledge-wide.png.txt；
            出图存为同目录 knowledge-wide.png 即自动替换 */}
        <div className="mt-10 md:mt-12">
          <ImageSlot
            slot="knowledge-wide"
            ratio="aspect-[21/9]"
            alt="知识库与模板库界面全景示意"
            caption="功能图：知识库与模板库全景"
          />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KNOWLEDGE_TILES.map((tile) => (
            <Card
              key={tile.title}
              className="flex-row items-start gap-3 px-4 py-4"
            >
              <tile.icon
                aria-hidden="true"
                className="text-primary mt-0.5 size-5 shrink-0"
              />
              <div>
                <h3 className="text-sm font-semibold">{tile.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {tile.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section aria-label="开始使用" className="pb-16 md:pb-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="border-primary/10 from-primary/10 to-primary/5 rounded-2xl border bg-linear-to-b px-6 py-14 text-center md:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            准备好让 AI 陪你写下一份文档了吗？
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-relaxed md:text-lg">
            从一张白纸到可以定稿的专业文档，ProDoc Copilot 全程相伴。
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild className="h-11 px-6 text-base">
              <Link to="/dashboard">
                进入工作台
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-semibold">ProDoc Copilot</span>
            </div>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              专业文档 AI 助手——让写作、评审与定稿在一处完成。
            </p>
          </div>
          <nav aria-label="页脚产品导航">
            <h3 className="text-sm font-semibold">产品</h3>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#features"
                >
                  功能特性
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#typography"
                >
                  排版与格式
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#collaboration"
                >
                  协作与评审
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#workflow"
                >
                  任务工作流
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="页脚资源导航">
            <h3 className="text-sm font-semibold">资源</h3>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>
                <Link
                  className="hover:text-foreground transition-colors"
                  to="/dashboard"
                >
                  文档模板
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-foreground transition-colors"
                  to="/dashboard"
                >
                  写作指南
                </Link>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#knowledge"
                >
                  知识库
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="https://www.markdownguide.org/basic-syntax/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Markdown 语法指南
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <h3 className="text-sm font-semibold">开始使用</h3>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              前往任务总览，开始您的第一份 AI 协作文档。
            </p>
            <Link
              to="/dashboard"
              className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              进入工作台
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
        <div className="text-muted-foreground mt-10 border-t pt-6 text-xs">
          <p>© 2026 ProDoc Copilot · 保留所有权利</p>
        </div>
      </div>
    </footer>
  );
}

function IndexPage() {
  return (
    <div className="bg-background text-foreground flex flex-1 flex-col">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <HighlightsStrip />
        <FeatureAiWriting />
        <FeatureTypography />
        <FeatureCollaboration />
        <WorkflowSection />
        <KnowledgeSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
