// @generated-by-ai

/**
 * ProDoc Copilot 产品首页（路由 "/"，纯静态营销页，无任何后端请求）。
 *
 * 页面结构：导航 → Hero → 能力速览 → AI 智能写作 / 排版与格式 / 协作与评审
 * → 任务工作流（含任务总览）→ 知识库 & 模板（愿景界面）→ CTA → 页脚。
 * 全页唯一行动入口为 /dashboard。
 *
 * 视觉：黑白灰单色调，强调色统一使用 primary（近黑）；除 Hero 与底部 CTA
 * 居中聚焦外，其余区块一律左对齐，保持整齐的版面节奏。
 *
 * 功能展示：页面不使用任何配图，全部由静态界面复刻（mock 场景）承担——
 * 仅用原生 HTML + shadcn 通用件 + lucide 图标，零 hooks、零交互，不引入
 * platejs 等编辑器依赖。场景样式对齐工作台真实 UI（三栏布局、line 标签条、
 * 四阶段徽章、任务表格等），mock 内可交互件一律 tabIndex={-1}。
 */
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card } from '@/components/shadcn/ui/card';
import { Kbd } from '@/components/shadcn/ui/kbd';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { createFileRoute, Link } from '@tanstack/react-router';
import { cn } from 'cn';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BadgeQuestionMarkIcon,
  BoldIcon,
  BookOpenIcon,
  CaseSensitiveIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  DatabaseIcon,
  EllipsisVerticalIcon,
  FeatherIcon,
  FileDownIcon,
  FileUpIcon,
  FormIcon,
  GraduationCapIcon,
  HighlighterIcon,
  ImageIcon,
  IndentIncreaseIcon,
  ItalicIcon,
  LanguagesIcon,
  LayoutDashboardIcon,
  ListMinusIcon,
  ListPlusIcon,
  ListTreeIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  MinusIcon,
  PaletteIcon,
  PanelLeftIcon,
  PaperclipIcon,
  PencilIcon,
  PencilSparklesIcon,
  PenLineIcon,
  PlusIcon,
  QuoteIcon,
  Redo2Icon,
  ScaleIcon,
  SendIcon,
  SparklesIcon,
  SpellCheckIcon,
  SquareSlashIcon,
  StampIcon,
  SummaryIcon,
  TableIcon,
  Undo2Icon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ────────────────────────── mock 场景骨架小件 ────────────────────────── */

/** 场景窗口容器：圆角描边「应用窗口」，整卡视为一张示意图 */
function MockFrame({
  label,
  className,
  children,
}: {
  /** 示意图的屏幕阅读器描述 */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'bg-card overflow-hidden rounded-xl border shadow-2xl shadow-black/10',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 静态标签条：复刻工作台面板顶部的 line 变体 Tabs（无交互） */
function MockTabsBar({
  tabs,
  active,
  className,
}: {
  /** 标签名列表 */
  tabs: string[];
  /** 高亮标签名 */
  active: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'text-muted-foreground flex h-10 min-h-10 w-full items-center gap-1 border-b px-1',
        className,
      )}
    >
      {tabs.map((tab) => (
        <span
          key={tab}
          className={cn(
            'relative flex h-full items-center px-2.5 text-sm whitespace-nowrap',
            tab === active
              ? 'text-foreground font-medium'
              : 'text-muted-foreground',
          )}
        >
          {tab}
          {tab === active && (
            <span className="bg-foreground absolute inset-x-1.5 bottom-0 h-0.5" />
          )}
        </span>
      ))}
    </div>
  );
}

/** 静态工具栏图标钮：复刻编辑器工具栏按钮（无交互） */
function MockToolbarButton({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  /** 悬停提示，兼作示意图注 */
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={label}
      className={cn(
        'text-muted-foreground flex size-7 cursor-default items-center justify-center rounded-md',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

/** 静态工具栏分隔线 */
function MockSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('bg-border mx-1 h-4 w-px shrink-0', className)}
    />
  );
}

/** 静态首字母头像：复刻评论区用户头像（无交互） */
function MockAvatar({
  name,
  className,
}: {
  /** 展示姓名，取首字符作头像字 */
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        className,
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

/** 静态 ghost 图标钮（头栏返回、表格行菜单等） */
function MockGhostIconButton({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={label}
      className={cn(
        'text-muted-foreground flex size-7 items-center justify-center rounded-md',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

/* ─────────────────────────── 场景：工作台 ─────────────────────────── */

/** Hero 大纲条目（左栏），active 对应当前滚动位置 */
const HERO_TOC: { depth: 1 | 2; title: string; active?: boolean }[] = [
  { depth: 1, title: '1 产品概述', active: true },
  { depth: 2, title: '1.1 目标用户' },
  { depth: 2, title: '1.2 核心场景' },
  { depth: 1, title: '2 功能需求' },
  { depth: 2, title: '2.1 数据同步' },
  { depth: 2, title: '2.2 健康报告' },
  { depth: 1, title: '3 非功能需求' },
];

/**
 * Hero 场景：复刻工作台三栏布局——左「大纲」、中文档与固定工具栏、
 * 右「AI 对话」面板（上下文引用 + 斜杠指令 + 流式回复 + 输入栏）。
 */
function HeroWorkbenchScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="工作台界面示意：左侧大纲、中间文档正文与修订标注、右侧 AI 对话面板"
      className={className}
    >
      {/* 头栏：任务名 + 阶段徽章 + 工作流按钮 + 用户 */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-2">
        <MockGhostIconButton icon={ArrowLeftIcon} label="返回总览" />
        <span className="text-sm font-semibold">智能手环 App 产品需求文档</span>
        <Badge>评审中</Badge>
        <span className="text-muted-foreground hidden text-xs lg:inline">
          当前阶段由对方编辑，你仅可查看与评论
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs"
            tabIndex={-1}
            aria-hidden="true"
          >
            退回
          </Button>
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs"
            tabIndex={-1}
            aria-hidden="true"
          >
            通过
          </Button>
          <MockAvatar name="王" className="size-6" />
        </div>
      </div>

      {/* 三栏主体：窄屏仅保留中部文档 */}
      <div className="grid md:grid-cols-[168px_minmax(0,1fr)_264px]">
        {/* 左栏：大纲 */}
        <div className="hidden border-r md:block">
          <MockTabsBar tabs={['大纲', '查找']} active="大纲" />
          <nav className="p-2">
            {HERO_TOC.map((item) => (
              <span
                key={item.title}
                className={cn(
                  'block truncate px-0.5 py-1.5 text-xs font-medium',
                  item.depth === 1 ? 'pl-2' : 'pl-5',
                  item.active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {item.title}
              </span>
            ))}
          </nav>
        </div>

        {/* 中栏：固定工具栏 + 文档正文 */}
        <div className="min-w-0">
          <div
            aria-hidden="true"
            className="flex h-10 min-h-10 items-center border-b px-2"
          >
            <MockToolbarButton icon={PanelLeftIcon} label="大纲面板" />
            <MockSeparator />
            <MockToolbarButton icon={FileUpIcon} label="导入" />
            <MockToolbarButton icon={FileDownIcon} label="导出" />
            <MockSeparator className="hidden sm:mx-1 sm:block" />
            <MockToolbarButton
              icon={Undo2Icon}
              label="撤销"
              className="hidden sm:flex"
            />
            <MockToolbarButton
              icon={Redo2Icon}
              label="重做"
              className="hidden sm:flex"
            />
            <MockSeparator className="hidden sm:mx-1 sm:block" />
            <MockToolbarButton
              icon={BoldIcon}
              label="加粗"
              className="hidden sm:flex"
            />
            <MockToolbarButton
              icon={ItalicIcon}
              label="斜体"
              className="hidden sm:flex"
            />
            <MockToolbarButton
              icon={HighlighterIcon}
              label="荧光笔"
              className="hidden sm:flex"
            />
            <div className="grow" />
            <MockToolbarButton icon={SparklesIcon} label="AI 指令" />
            <MockSeparator />
            <MockToolbarButton icon={BookOpenIcon} label="阅读模式" />
          </div>
          <div className="space-y-2.5 p-4 text-xs leading-relaxed md:p-5 md:text-sm">
            <h3 className="text-sm font-bold md:text-base">1 产品概述</h3>
            <p>
              智能手环 App{' '}
              <span className="text-muted-foreground line-through">
                提供基础的健康数据记录功能
              </span>
              <span className="underline underline-offset-2">
                面向注重健康的都市用户，提供全天候心率监测、睡眠分析与运动记录
              </span>
              ，与手机端数据实时同步。
            </p>
            <p className="text-muted-foreground">
              目标版本{' '}
              <code className="bg-muted rounded px-1 py-0.5 font-mono">
                v2.3.0
              </code>{' '}
              计划于本季度末发布。
              <span className="bg-foreground ml-0.5 inline-block h-3 w-0.5 animate-pulse align-middle" />
            </p>
          </div>
        </div>

        {/* 右栏：AI 对话 */}
        <div className="hidden border-l md:block">
          <MockTabsBar tabs={['AI 对话', '评论 & 修订']} active="AI 对话" />
          <div className="flex flex-col gap-2.5 p-3">
            {/* 上下文引用条 */}
            <div className="text-muted-foreground bg-muted/40 relative rounded-md border px-2.5 py-2 text-xs leading-relaxed">
              <QuoteIcon className="absolute top-1.5 right-1.5 size-3 opacity-40" />
              1 产品概述：智能手环 App
              提供基础的健康数据记录功能，与手机端数据实时同步……
              <span className="bg-muted ml-1 rounded px-1 py-0.5 font-mono text-[10px]">
                /section
              </span>
              <XIcon className="absolute right-1.5 bottom-1.5 size-3 opacity-40" />
            </div>
            {/* 用户指令 */}
            <div className="bg-primary text-primary-foreground self-end rounded-lg px-2.5 py-1.5 text-xs">
              /polish 润色这段介绍
            </div>
            {/* AI 流式回复 */}
            <div className="text-muted-foreground bg-muted/40 self-start rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed">
              已生成 2
              条修订：将「提供基础的健康数据记录功能」细化为具体能力描述，并修正语序。
              <span className="bg-foreground ml-0.5 inline-block h-3 w-0.5 animate-pulse align-middle" />
            </div>
          </div>
          {/* 输入栏 */}
          <div className="flex items-center gap-2 border-t px-2.5 py-2">
            <SquareSlashIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="text-muted-foreground grow truncate text-xs">
              发送 AI 指令 . . .
            </span>
            <Badge variant="outline" className="px-1.5 text-[10px]">
              修订
            </Badge>
            <Kbd className="text-[10px]">Tab</Kbd>
            <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full">
              <ArrowUpIcon className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ─────────────────────── 场景：AI 指令菜单 ─────────────────────── */

/** AI 指令面板分组（与工作台斜杠菜单一致：直接发送 + 三类场景共 12 条指令） */
const AI_MENU_GROUPS: {
  heading: string | null;
  items: {
    icon: LucideIcon;
    label: string;
    value: string;
    active?: boolean;
  }[];
}[] = [
  {
    heading: null,
    items: [{ icon: SendIcon, label: '直接发送', value: '/' }],
  },
  {
    heading: '内容生成',
    items: [
      { icon: PencilSparklesIcon, label: '自动续写', value: '/continue' },
      { icon: ListTreeIcon, label: '生成大纲', value: '/outline' },
    ],
  },
  {
    heading: '文档编辑',
    items: [
      {
        icon: WandSparklesIcon,
        label: '智能润色',
        value: '/polish',
        active: true,
      },
      { icon: SpellCheckIcon, label: '语法校对', value: '/fix' },
      { icon: ListPlusIcon, label: '扩写内容', value: '/expand' },
      { icon: ListMinusIcon, label: '精简内容', value: '/shorten' },
      { icon: GraduationCapIcon, label: '书面用语', value: '/formal' },
      { icon: FeatherIcon, label: '通俗用语', value: '/simplify' },
    ],
  },
  {
    heading: '对话 & 评论',
    items: [
      { icon: MessageSquareIcon, label: '智能评阅', value: '/review' },
      { icon: LanguagesIcon, label: '双语互译', value: '/translate' },
      { icon: BadgeQuestionMarkIcon, label: '深度解释', value: '/explain' },
      { icon: SummaryIcon, label: '提炼总结', value: '/summarize' },
    ],
  },
];

/** 「AI 智能写作」场景：文档底衬 + 浮出斜杠指令面板 + 上下文与模式标签 */
function AiCommandScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="AI 指令菜单界面示意：选中文字后唤起斜杠指令面板，十二项指令按场景分组"
      className={className}
    >
      <div className="relative">
        {/* 文档底衬：一段带选区的正文 */}
        <div className="text-muted-foreground/80 p-4 pb-28 text-xs leading-relaxed sm:text-sm">
          <h3 className="text-foreground mb-2 text-sm font-bold sm:text-base">
            1 产品概述
          </h3>
          <p>
            智能手环 App{' '}
            <span className="bg-primary/10 text-foreground rounded px-0.5">
              提供基础的健康数据记录功能
            </span>
            ，与手机端数据实时同步。用户可在手机端查看完整的健康趋势报告，
            并接收个性化的运动建议。
          </p>
        </div>

        {/* 浮出的斜杠指令面板 */}
        <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-lg border shadow-lg sm:inset-x-auto sm:left-6 sm:w-80">
          <div className="bg-card text-muted-foreground flex h-9 items-center border-b px-3 text-sm">
            发送 AI 指令 . . .
          </div>
          <div className="bg-card relative max-h-56 overflow-hidden">
            {AI_MENU_GROUPS.map((group) => (
              <div key={group.heading ?? '直接发送'}>
                {group.heading && (
                  <p className="text-muted-foreground/80 px-3 pt-2 pb-1 text-xs font-medium">
                    {group.heading}
                  </p>
                )}
                {group.items.map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 text-sm',
                      item.active && 'bg-accent text-foreground',
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className="text-muted-foreground size-4 shrink-0"
                    />
                    <span>{item.label}</span>
                    <div className="grow" />
                    {item.value !== '/' && (
                      <code className="text-muted-foreground font-mono text-xs font-medium">
                        {item.value}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {/* 底部渐隐，暗示列表可滚动 */}
            <div
              aria-hidden="true"
              className="to-card pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-transparent"
            />
          </div>
        </div>
      </div>

      {/* 底栏：上下文范围与 AI 模式 */}
      <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-3">
        <span className="text-muted-foreground flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs">
          /section 本节
        </span>
        <span className="text-muted-foreground flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs">
          /fulltext 全文
        </span>
        <div className="grow" />
        {['对话', '评论', '修订', '自动'].map((mode) => (
          <span
            key={mode}
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              mode === '修订'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground border',
            )}
          >
            {mode}
          </span>
        ))}
      </div>
    </MockFrame>
  );
}

/* ─────────────────────── 场景：富排版文档 ─────────────────────── */

/** 静态行内标记小件：复刻正文中的各种 mark */
function Mark({ kind, children }: { kind: string; children: string }) {
  const cls: Record<string, string> = {
    bold: 'font-bold',
    italic: 'italic',
    code: 'bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]',
    highlight: 'bg-highlight rounded px-0.5',
    sup: 'align-super text-[0.7em]',
  };
  return <span className={cls[kind]}>{children}</span>;
}

/** 语法高亮的静态 python 代码块（单色调手工着色） */
function CodeBlock() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="bg-muted/50 text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 font-mono text-xs">
        <span>python</span>
        <span className="bg-background flex gap-1 rounded-full border px-1.5 py-0.5">
          <span className="size-1.5 rounded-full bg-current opacity-60" />
          <span className="size-1.5 rounded-full bg-current opacity-30" />
        </span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        <code>
          <span className="font-semibold">def</span> energy(m, v=
          <span className="italic">0</span>):{'\n'}
          {'    '}
          <span className="text-muted-foreground italic">
            # 相对论能量：静止质量对应的能量
          </span>
          {'\n'}
          {'    '}
          <span className="font-semibold">return</span> m * c **{' '}
          <span className="italic">2</span>
          {'\n\n    '}
          <span className="text-muted-foreground/70"># 代码块自动语法高亮</span>
        </code>
      </pre>
    </div>
  );
}

/** 「排版与格式」场景：固定工具栏 + 含表格、公式、代码块的文档片段 */
function DocumentPageScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="富文本文档界面示意：工具栏与含表格、公式、代码块的正文"
      className={className}
    >
      {/* 固定工具栏（复刻真实按钮排布） */}
      <div
        aria-hidden="true"
        className="flex h-10 min-h-10 items-center border-b px-2"
      >
        <MockToolbarButton icon={PanelLeftIcon} label="大纲面板" />
        <MockSeparator />
        <MockToolbarButton icon={FileUpIcon} label="导入" />
        <MockToolbarButton icon={FileDownIcon} label="导出" />
        <MockSeparator />
        <MockToolbarButton icon={CaseSensitiveIcon} label="字体" />
        <MockToolbarButton
          icon={IndentIncreaseIcon}
          label="首行缩进"
          className="hidden sm:flex"
        />
        <MockSeparator className="hidden sm:mx-1 sm:block" />
        <MockToolbarButton
          icon={Undo2Icon}
          label="撤销"
          className="hidden sm:flex"
        />
        <MockToolbarButton
          icon={Redo2Icon}
          label="重做"
          className="hidden sm:flex"
        />
        <MockSeparator className="hidden sm:mx-1 sm:block" />
        <MockToolbarButton
          icon={TableIcon}
          label="表格"
          className="hidden sm:flex"
        />
        <MockToolbarButton
          icon={ImageIcon}
          label="图片"
          className="hidden sm:flex"
        />
        <MockToolbarButton
          icon={PaperclipIcon}
          label="附件"
          className="hidden sm:flex"
        />
        <div className="grow" />
        <MockToolbarButton icon={HighlighterIcon} label="荧光笔" />
        <MockToolbarButton icon={MessageSquareIcon} label="评论" />
        <MockToolbarButton icon={SparklesIcon} label="AI 指令" />
        <MockSeparator />
        <MockToolbarButton icon={BookOpenIcon} label="阅读模式" />
      </div>

      {/* 文档正文 */}
      <div className="space-y-4 p-5 text-sm leading-relaxed md:p-6">
        <div>
          <h3 className="mb-2 text-base font-bold">2 实验与测量</h3>
          <p>
            本节记录关键参数的测量方法。其中激光器输出功率以{' '}
            <Mark kind="code">P = 3.2 mW</Mark> 记录，测量结果以
            <Mark kind="bold">加粗</Mark>标注，
            <Mark kind="italic">斜体</Mark>表示推算值；关键结论以
            <Mark kind="highlight">荧光标记</Mark>，单位上标写作 m·s
            <Mark kind="sup">-1</Mark>。
          </p>
        </div>

        {/* 合并表头的表格 */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-medium" rowSpan={2}>
                  方案
                </th>
                <th className="px-3 py-2 text-center font-medium" colSpan={2}>
                  相对误差
                </th>
              </tr>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-center font-medium">第一次</th>
                <th className="px-3 py-2 text-center font-medium">第二次</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b last:border-0">
                <td className="px-3 py-2">基准方案</td>
                <td className="px-3 py-2 text-center">2.4%</td>
                <td className="px-3 py-2 text-center">2.1%</td>
              </tr>
              <tr className="border-b last:border-0">
                <td className="px-3 py-2">改进方案</td>
                <td className="px-3 py-2 text-center">0.9%</td>
                <td className="px-3 py-2 text-center">0.8%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 块级 LaTeX 公式 */}
        <div className="relative rounded-lg border px-4 py-4">
          <span className="text-muted-foreground/70 absolute top-2 right-2.5 font-mono text-[10px]">
            $$…$$
          </span>
          <p className="text-center font-serif text-lg italic">
            E = mc<sup>2</sup>
          </p>
        </div>

        <CodeBlock />
      </div>
    </MockFrame>
  );
}

/* ─────────────────────── 场景：评论与修订 ─────────────────────── */

/** 单条评论行：头像 + 姓名 + 日期，正文在竖线之下 */
function CommentRow({
  name,
  date,
  children,
  thread = false,
}: {
  name: string;
  date: string;
  children: React.ReactNode;
  thread?: boolean;
}) {
  return (
    <div className={cn('relative', thread && 'pl-6.5')}>
      {thread && (
        <span className="bg-muted absolute top-0 left-3 h-full w-0.5" />
      )}
      <div className="flex items-center">
        <MockAvatar name={name} />
        <h4 className="mx-2 text-sm leading-none font-semibold">{name}</h4>
        <div className="text-muted-foreground/80 text-xs leading-none">
          {date}
        </div>
      </div>
      <div className="my-1 pl-6.5 text-sm">{children}</div>
    </div>
  );
}

/**
 * 「协作与评审」场景：左侧文档摘录（评论选区 + 行内修订 + 评论数角标），
 * 右侧复刻「评论 & 修订」面板：多轮讨论串卡片 + AI 修订卡片。
 * 单色调纪律：删除项用删除线、新增项用下划线表达，不引入红蓝 diff 色。
 */
function ReviewScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="评论讨论串与修订面板界面示意：讨论串可回复与解决，AI 修订可逐条接受或拒绝"
      className={className}
    >
      <div className="grid sm:grid-cols-2">
        {/* 左：文档摘录 */}
        <div className="border-b sm:border-r sm:border-b-0">
          <div className="relative space-y-3 p-5 text-sm leading-relaxed">
            <h3 className="text-base font-bold">3 结果与讨论</h3>
            <div className="flex items-start gap-1">
              <p>
                实验表明，
                <span className="border-muted-foreground/60 border-b-2 border-dotted">
                  改进方案在低信噪比场景下的测量稳定性明显优于基准方案
                </span>
                ，两次重复实验的相对误差均低于 1%。
              </p>
              {/* 行内评论数角标 */}
              <span
                aria-hidden="true"
                className="bg-muted text-muted-foreground mt-0.5 flex h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-semibold"
              >
                <MessagesSquareIcon className="size-3.5" />2
              </span>
            </div>
            <p>
              这一结论
              <span className="text-muted-foreground line-through">
                基本上可以说是
              </span>
              <span className="underline underline-offset-2">充分</span>
              验证了第 1 节提出的假设，与相关文献的报道一致。
            </p>
          </div>
        </div>

        {/* 右：「评论 & 修订」面板 */}
        <div>
          <MockTabsBar tabs={['AI 对话', '评论 & 修订']} active="评论 & 修订" />

          {/* 卡片一：评论讨论串 */}
          <div className="relative p-4">
            <div className="flex items-center">
              <MockAvatar name="王" />
              <h4 className="mx-2 text-sm leading-none font-semibold">
                王评审
              </h4>
              <div className="text-muted-foreground/80 text-xs leading-none">
                10-18
              </div>
              {/* 解决按钮 */}
              <span
                aria-hidden="true"
                title="标记为已解决"
                className="text-muted-foreground absolute top-4 right-4 flex size-6 items-center justify-center"
              >
                <CheckIcon className="size-4" />
              </span>
            </div>
            {/* 引用的原文 */}
            <div className="relative mt-1 flex pl-8 text-sm">
              <span className="bg-muted absolute top-1.25 left-3 h-full w-0.5" />
              <span className="bg-highlight my-px w-0.5 shrink-0" />
              <span className="text-muted-foreground ml-2">
                改进方案在低信噪比场景下的测量稳定性明显优于基准方案
              </span>
            </div>
            <div className="mt-1">
              <CommentRow name="王" date="10-18">
                「明显优于」建议给出量化对比，或引用表 2 的数据支撑。
              </CommentRow>
              <CommentRow name="李" date="10-18" thread>
                已在正文补充两次实验的误差对比，谢谢指出。
              </CommentRow>
            </div>
            {/* 回复输入 */}
            <div className="mt-2 flex items-center gap-2">
              <MockAvatar name="王" />
              <div className="bg-muted/50 text-muted-foreground flex h-8 flex-1 items-center justify-between rounded-md border px-3 text-sm">
                添加评论 . . .
                <span className="bg-primary/10 text-primary flex size-5 items-center justify-center rounded-full">
                  <ArrowUpIcon className="size-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-muted h-px w-full" />

          {/* 卡片二：AI 修订 */}
          <div className="relative p-4">
            <div className="flex items-center">
              <MockAvatar name="李" />
              <h4 className="mx-2 text-sm leading-none font-semibold">
                李作者
              </h4>
              <span title="由 AI 生成">
                <SparklesIcon
                  aria-hidden="true"
                  className="text-primary mr-1 size-3"
                />
              </span>
              <div className="text-muted-foreground/80 text-xs leading-none">
                10-19
              </div>
            </div>
            {/* 接受 / 拒绝 */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span
                aria-hidden="true"
                title="接受"
                className="text-muted-foreground flex size-6 items-center justify-center"
              >
                <CheckIcon className="size-4" />
              </span>
              <span
                aria-hidden="true"
                title="拒绝"
                className="text-muted-foreground flex size-6 items-center justify-center"
              >
                <XIcon className="size-4" />
              </span>
            </div>
            <div className="mt-2 mb-2 flex flex-col gap-2 pl-8">
              <div className="text-muted-foreground flex items-start gap-2 text-sm">
                <MinusIcon className="my-0.5 size-4 shrink-0" />
                <span className="line-through">基本上可以说是</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <PlusIcon className="my-0.5 size-4 shrink-0" />
                <span className="underline underline-offset-2">充分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ─────────────────────── 场景：任务总览 ─────────────────────── */

/** 任务总览侧栏（复刻仪表盘侧边栏的任务分组） */
const DASHBOARD_NAV: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}[] = [
  { icon: LayoutDashboardIcon, label: '总览' },
  { icon: CirclePlusIcon, label: '快速创建' },
  { icon: PencilIcon, label: '我编写的', active: true },
  { icon: CheckCheckIcon, label: '我评审的' },
];

/** 任务表格行：覆盖全部四个流转阶段 */
const DASHBOARD_TASKS: {
  name: string;
  stage: string;
  stageVariant: 'default' | 'secondary' | 'outline';
  created: string;
  updated: string;
  action: string;
}[] = [
  {
    name: 'Q4 市场推广复盘',
    stage: '撰写中',
    stageVariant: 'secondary',
    created: '10-15',
    updated: '10-19',
    action: '进入编写',
  },
  {
    name: '智能手环 App 产品需求文档',
    stage: '评审中',
    stageVariant: 'default',
    created: '10-12',
    updated: '10-18',
    action: '查看任务',
  },
  {
    name: '数据平台接口规范',
    stage: '修订中',
    stageVariant: 'outline',
    created: '09-28',
    updated: '10-17',
    action: '进入修改',
  },
  {
    name: '新员工入职指南',
    stage: '已定稿',
    stageVariant: 'outline',
    created: '08-30',
    updated: '09-21',
    action: '查看任务',
  },
];

/** 「任务总览」场景：侧栏角色分组 + 任务表格（阶段徽章与进入操作） */
function DashboardScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="任务总览界面示意：按「我编写的 / 我评审的」分组的任务表格，含四阶段徽章与进入操作"
      className={className}
    >
      <div className="grid sm:grid-cols-[148px_minmax(0,1fr)]">
        {/* 迷你侧栏 */}
        <div
          aria-hidden="true"
          className="bg-muted/30 hidden border-r p-2 sm:block"
        >
          {DASHBOARD_NAV.map((item) => (
            <span
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                item.active
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </span>
          ))}
        </div>

        {/* 任务表格 */}
        <div className="min-w-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">我编写的</h3>
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs"
              tabIndex={-1}
              aria-hidden="true"
            >
              <PlusIcon className="size-3.5" />
              新建任务
            </Button>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    创建时间
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    更新时间
                  </TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {DASHBOARD_TASKS.map((task) => (
                  <TableRow key={task.name}>
                    <TableCell className="max-w-40 truncate font-medium sm:max-w-none">
                      {task.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.stageVariant}>{task.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {task.created}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {task.updated}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          {task.action}
                        </Button>
                        <MockGhostIconButton
                          icon={EllipsisVerticalIcon}
                          label="更多操作"
                          className="size-6"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ─────────────────────── 场景：知识库 ─────────────────────── */

/** 知识库侧栏条目（对齐仪表盘侧边栏的「模板 & 指南 / 知识库」分组） */
const KNOWLEDGE_NAV: {
  group: string;
  items: { icon: LucideIcon; label: string; active?: boolean }[];
}[] = [
  {
    group: '模板 & 指南',
    items: [
      { icon: FormIcon, label: '文档模板', active: true },
      { icon: BookOpenIcon, label: '写作指南' },
    ],
  },
  {
    group: '知识库',
    items: [
      { icon: ScaleIcon, label: '标准规范' },
      { icon: PaletteIcon, label: '风格参考' },
      { icon: DatabaseIcon, label: '事实来源' },
    ],
  },
];

/** 指南 / 规范条目行 */
const KNOWLEDGE_ENTRIES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: BookOpenIcon,
    title: '写作指南',
    description: '术语表、数字用法与图表规范',
  },
  {
    icon: ScaleIcon,
    title: '标准规范',
    description: 'GB/T 7714 参考文献著录规则',
  },
  {
    icon: PaletteIcon,
    title: '风格参考',
    description: '优秀技术文档范例合集',
  },
  {
    icon: DatabaseIcon,
    title: '事实来源',
    description: '关键数据出处与版本记录',
  },
];

/** 模板卡片：HTML 迷你文档缩略（标题条 + 灰色正文行） */
function TemplateThumb({ title, tag }: { title: string; tag: string }) {
  return (
    <div className="rounded-lg border p-2.5">
      <div className="bg-card space-y-1.5 rounded-md border p-2.5">
        <span className="bg-foreground/70 block h-1.5 w-2/3 rounded-sm" />
        <span className="bg-muted block h-1 w-full rounded-sm" />
        <span className="bg-muted block h-1 w-5/6 rounded-sm" />
        <span className="bg-muted block h-1 w-2/3 rounded-sm" />
      </div>
      <p className="mt-2 text-xs font-medium">{title}</p>
      <p className="text-muted-foreground mt-0.5 text-[10px]">{tag}</p>
    </div>
  );
}

/**
 * 「知识库 & 模板」愿景场景：产品侧该模块尚未实现，此处按侧边栏
 * 既有入口大致设计一个界面预览（模板卡片 + 指南规范列表）。
 */
function KnowledgeLibraryScene({ className }: { className?: string }) {
  return (
    <MockFrame
      label="知识库与模板库界面预览：左侧模板与知识分组，右侧模板卡片与指南规范列表"
      className={className}
    >
      <div className="grid sm:grid-cols-[168px_minmax(0,1fr)]">
        {/* 迷你侧栏：模板 & 指南 / 知识库 分组 */}
        <div
          aria-hidden="true"
          className="bg-muted/30 hidden border-r p-2 sm:block"
        >
          {KNOWLEDGE_NAV.map((group) => (
            <div key={group.group} className="mb-3">
              <p className="text-muted-foreground/70 px-2 pt-1 pb-1 text-[10px] font-medium">
                {group.group}
              </p>
              {group.items.map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                    item.active
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* 内容区：模板卡片 + 指南规范列表 */}
        <div className="min-w-0 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-medium">文档模板</h3>
              <span className="text-muted-foreground text-xs">12 个模板</span>
            </div>
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs"
              tabIndex={-1}
              aria-hidden="true"
            >
              <PlusIcon className="size-3.5" />
              从模板新建
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <TemplateThumb title="技术报告" tag="IEEE 双栏" />
            <TemplateThumb title="会议纪要" tag="结论先行" />
            <TemplateThumb title="项目提案" tag="预算附表" />
            <TemplateThumb title="实验记录" tag="数据表格" />
          </div>

          <div className="mt-5 divide-y rounded-lg border">
            {KNOWLEDGE_ENTRIES.map((entry) => (
              <div
                key={entry.title}
                className="flex items-center gap-2.5 px-3 py-2.5"
              >
                <entry.icon
                  aria-hidden="true"
                  className="text-muted-foreground size-4 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{entry.title}</p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {entry.description}
                  </p>
                </div>
                <div className="grow" />
                <ChevronRightIcon
                  aria-hidden="true"
                  className="text-muted-foreground/60 size-4 shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ───────────────────────── 页面通用小件 ───────────────────────── */

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

/* ─────────────────────────── 页面区块 ─────────────────────────── */

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
          <HeroWorkbenchScene />
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
          <AiCommandScene />
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
            <DocumentPageScene />
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
          <ReviewScene />
        </div>
      </div>
    </section>
  );
}

/** 任务工作流：真实的四个流转阶段（徽章样式与产品 STAGE_META 一致） */
const WORKFLOW_STAGES: {
  step: string;
  icon: LucideIcon;
  badge: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  title: string;
  actor: string;
  actions: string[];
  description: string;
}[] = [
  {
    step: '01',
    icon: PencilIcon,
    badge: '撰写中',
    badgeVariant: 'secondary',
    title: '撰写',
    actor: '创建者 · 可编辑',
    actions: ['提交评审'],
    description:
      '创建者执笔写作，AI 续写、润色、查资料全程相陪；完成后一键「提交评审」并指定评审人。',
  },
  {
    step: '02',
    icon: MessageSquareIcon,
    badge: '评审中',
    badgeVariant: 'default',
    title: '评审',
    actor: '评审者 · 可编辑',
    actions: ['退回', '通过'],
    description:
      '评审者批注评论、直接修改文字；不满意可「退回」，作者修改后「重新提交」，往返皆有记录。',
  },
  {
    step: '03',
    icon: PenLineIcon,
    badge: '修订中',
    badgeVariant: 'outline',
    title: '修订',
    actor: '创建者 · 可编辑',
    actions: ['重新提交'],
    description:
      '按评审意见逐条修改，AI 修订与讨论全程留痕，改到双方满意为止。',
  },
  {
    step: '04',
    icon: StampIcon,
    badge: '已定稿',
    badgeVariant: 'outline',
    title: '定稿',
    actor: '所有人 · 只读',
    actions: [],
    description:
      '评审「通过」后任务定稿，文档转为只读，内容与讨论完整留存、随时回溯。',
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
          title="撰写 → 评审 → 修订 → 定稿，一气呵成"
          description="每份文档都是一个任务：四个阶段界定了谁在执笔、谁在把关——非本阶段的人只可查看与评论，改动永远有迹可循；定稿后文档转为只读、安心归档。"
        />
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 xl:grid-cols-4">
          {WORKFLOW_STAGES.map((stage) => (
            <Card key={stage.step} className="gap-4 px-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-mono text-sm font-medium">
                  {stage.step}
                </span>
                <Badge variant={stage.badgeVariant}>{stage.badge}</Badge>
              </div>
              <stage.icon aria-hidden="true" className="text-primary size-6" />
              <h3 className="text-lg font-semibold">{stage.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {stage.description}
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <span className="text-muted-foreground/80 text-xs">
                  {stage.actor}
                </span>
                <div className="grow" />
                {stage.actions.length > 0 ? (
                  stage.actions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {action}
                    </Button>
                  ))
                ) : (
                  <Badge variant="outline" className="px-1.5 text-[10px]">
                    只读
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10 md:mt-12">
          <DashboardScene />
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
        <div className="mt-10 md:mt-12">
          <KnowledgeLibraryScene />
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
                <a
                  className="hover:text-foreground transition-colors"
                  href="#knowledge"
                >
                  文档模板
                </a>
              </li>
              <li>
                <a
                  className="hover:text-foreground transition-colors"
                  href="#knowledge"
                >
                  写作指南
                </a>
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
