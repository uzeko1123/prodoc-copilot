// @generated-by-ai

'use client';

import type { TElement, TText } from 'platejs';
import { createPlatePlugin, type PlateEditor } from 'platejs/react';

const isReadonlyBlock = (editor: PlateEditor, index: number) =>
  (editor.children[index] as TElement | undefined)?.readonly === true;

const isTemplateBlock = (editor: PlateEditor, index: number) =>
  (editor.children[index] as TElement | undefined)?.template != null;

// 块内无任何文字（含带格式但空串的 text）时视为空，可显示引导
const isEmptyBlock = (element: TElement) =>
  element.children.every((child) => 'text' in child && child.text === '');

// 删除/移动类变换执行期间 >0（由下方 tf 包装维护），isElementReadOnly 仅在
// 此期间返回 true，见 extend 注释
let readonlyDepth = 0;

export const TemplatePlugin = createPlatePlugin({
  key: 'template',
  inject: {
    isBlock: true,
    nodeProps: {
      // placeholder 式引导：template 属性存引导文案（随文档保留在 value 中），
      // 块为空时把文案注入为 placeholder DOM 属性渲染灰字（与 block-placeholder-kit
      // 同一机制，定位与 text-indent 规则天然一致）；块内一旦有内容属性即不再注入，
      // 提示自动隐藏，清空后复现。
      // 多行占位：before:absolute 脱离文档流、不撑高度，长文案会溢出盖住下方块
      // ——补一个 after:invisible 同文案在流内占位撑高。before 用 inset-x-0
      // 拉满块宽、锚定到本元素：走 abspos 静态位置会被块的 text-indent 整体
      // 推移（多行文案行行缩进），锚定后 text-indent/text-align 随块继承，则与
      // 正文一样只缩进首行；::after 行内渲染路径相同，同宽换行一致、高度对齐
      // （index.css 的 text-indent 重置因此不含 ::before，::before 要靠继承）。
      // 空块的 slate DOM 是 ZWSP+<br>（ZeroWidthString isLineBreak），<br> 会把
      // ::after 顶到第二行起排、整块比正文多占一行——把该 <br> 隐藏掉。
      transformProps: ({ element }) => {
        // 返回 undefined 会回落到 Plate 默认注入（slate-template-<文案>
        // class 与 {template} style），非模板块/已填内容时返回 {} 显式跳过
        if (!element || typeof element.template !== 'string') return {};
        if (!isEmptyBlock(element)) return {};

        return {
          className:
            'relative before:absolute before:inset-x-0 before:cursor-text before:text-muted-foreground/80 before:content-[attr(placeholder)] after:invisible after:content-[attr(placeholder)] [&_[data-slate-zero-width="n"]_br]:hidden',
          placeholder: element.template,
        };
      },
    },
  },
})
  .extend({
    // slate 把 isElementReadOnly 为 true 的块当 void 处理，消费点有两类：
    // 删除/光标移动变换跳过锁定块（Backspace/Delete/跨块删除不再生成注定被
    // 吞的 merge op），但 Editor.nodes 查询的 pass 同样不进入 readonly 块——
    // 选区矩形、查找等按 nodes 枚举文本，锁定块内的文本枚举不到，编辑器失焦
    // 后（原生高亮让位于 overlay）背景即消失。故「视为锁定」只保留在变换执行
    // 期间（readonlyDepth 由下方 tf 包装维护），查询层按普通块遍历；写入保护
    // 由下方 apply 拦截兜底。
    extendEditor: ({ editor }) => {
      editor.isElementReadOnly = (element: TElement | TText) =>
        (element as TElement).readonly === true && readonlyDepth > 0;
      return editor;
    },
  })
  .overrideEditor(
    ({
      editor,
      tf: {
        apply,
        reset,
        resetBlock,
        deleteBackward,
        deleteForward,
        deleteFragment,
        move,
      },
    }) => ({
      transforms: {
        // isElementReadOnly 只在变换内生效（见 extend 注释），删除/移动入口
        // 各包一层计数（try/finally 支持嵌套重入）
        deleteBackward(unit: Parameters<typeof deleteBackward>[0]) {
          readonlyDepth++;
          try {
            deleteBackward(unit);
          } finally {
            readonlyDepth--;
          }
        },
        deleteForward(unit: Parameters<typeof deleteForward>[0]) {
          readonlyDepth++;
          try {
            deleteForward(unit);
          } finally {
            readonlyDepth--;
          }
        },
        deleteFragment(options: Parameters<typeof deleteFragment>[0]) {
          readonlyDepth++;
          try {
            deleteFragment(options);
          } finally {
            readonlyDepth--;
          }
        },
        // 方向键移动经 positions 迭代器把锁定块当 void 原子跳过，同样收窄到
        // 变换内，避免查询层放开后光标逐字走进锁定块
        move(options: Parameters<typeof move>[0]) {
          readonlyDepth++;
          try {
            move(options);
          } finally {
            readonlyDepth--;
          }
        },
        // Backspace 于文档起点/空块/合并边界时，Plate 删除规则会把目标块
        // resetBlock 成默认段落（属性剥光、类型改 p）——锁定/模板块跳过
        resetBlock(options: Parameters<typeof resetBlock>[0]) {
          const block = editor.api.block({ at: options?.at })?.[0] as
            TElement | undefined;
          if (block && (block.readonly === true || block.template != null)) {
            return;
          }
          resetBlock(options);
        },
        // 全选删除时 Plate 的 deleteFragment 走 reset：用默认空块顶替全部内容，
        // 会把幸存的首个锁定/模板块顶下去（表现为“首块模板被删”）。有受保护块
        // 时改为只移除可删块（受保护块的 remove_node 由下方 apply 拦截吞掉）。
        // 仅劫持 deleteFragment 的 children === true 形态；children 传数组
        // （全量替换内容）走原生 reset，避免新内容被丢弃
        reset(options: Parameters<typeof reset>[0]) {
          if (
            options?.children === true &&
            editor.children.some(
              (node) =>
                (node as TElement).readonly === true ||
                (node as TElement).template != null,
            )
          ) {
            editor.tf.removeNodes({ at: [], children: true });
            if (options.select && editor.children.length > 0) {
              editor.tf.select(editor.api.start([]));
            }
            return;
          }
          reset(options);
        },
        apply(op) {
          // 规范化期间的 op 一律放行：@platejs/slate 在 normalizeNode 执行期
          // 把 editor.meta.isNormalizing 置 true，吞掉它会导致 normalize 死循环
          if (editor.meta.isNormalizing || op.type === 'set_selection') {
            apply(op);
            return;
          }

          switch (op.type) {
            case 'merge_node': {
              // op.path 节点并入前一个兄弟：两侧任一是锁定块都吞（index 0 无前兄弟）
              if (
                isReadonlyBlock(editor, op.path[0]) ||
                (op.path.length === 1 &&
                  op.path[0] > 0 &&
                  isReadonlyBlock(editor, op.path[0] - 1))
              ) {
                return;
              }
              // 顶层模板块整块不可删（内容可清空，清空后引导复现）：
              // 吞掉「模板块并入前块」的 merge，块本身存活
              if (op.path.length === 1 && isTemplateBlock(editor, op.path[0])) {
                return;
              }
              break;
            }
            case 'move_node': {
              if (isReadonlyBlock(editor, op.path[0])) return; // 锁定块不可移动/移出
              if (op.path.length === 1 && isTemplateBlock(editor, op.path[0])) {
                return; // 模板块不可移动
              }
              if (
                op.newPath.length > 1 &&
                (isReadonlyBlock(editor, op.newPath[0]) ||
                  isTemplateBlock(editor, op.newPath[0]))
              ) {
                return; // 不可移入锁定/模板块内部（模板块为纯文本块，移入即非法嵌套）
              }
              break;
            }
            case 'insert_node': {
              // 顶层块之间插入放行（不修改既有节点）；插入锁定块内部拦截
              if (op.path.length > 1 && isReadonlyBlock(editor, op.path[0])) {
                return;
              }
              // 块选 Duplicate/复制粘贴会顶层插入带保护属性的副本，其后删除
              // 全被拦，成为不可删的死块——剥掉保护属性按普通块落盘（原件不受影响）
              if (
                op.path.length === 1 &&
                ((op.node as TElement).readonly === true ||
                  (op.node as TElement).template != null)
              ) {
                const node = { ...(op.node as TElement) };
                delete node.readonly;
                delete node.template;
                apply({ ...op, node });
                return;
              }
              break;
            }
            case 'split_node': {
              if (isReadonlyBlock(editor, op.path[0])) {
                // 锁定块内放行文本叶子拆分：评论 mark 的 setNodes({split: true})
                // 需按区间拆分文本，拆分不改变渲染内容（若后续 set_node 被吞，
                // normalize 会把相邻同属性叶子合并回去）；元素级拆分仍拦
                const node = editor.api.node(op.path)?.[0];
                if (!node || !('text' in node)) return;
                break;
              }
              // 拆分的新块继承 properties：去掉 template，让新段落恢复正常文字
              // （splitNodes 把全部元素属性放进 op.properties，且只写入尾节点）
              if ((op.properties as { template?: unknown }).template) {
                const properties = { ...(op.properties as object) } as Record<
                  string,
                  unknown
                >;
                delete properties.template;
                apply({
                  ...op,
                  properties: properties as unknown as typeof op.properties,
                });
                return;
              }
              break;
            }
            case 'remove_node': {
              if (isReadonlyBlock(editor, op.path[0])) return; // 锁定块内任何删除拦
              // 顶层模板块不可整块删除（如选中整块/全选后删）
              if (op.path.length === 1 && isTemplateBlock(editor, op.path[0])) {
                return;
              }
              break;
            }
            default: {
              // insert_text / remove_text / set_node：锁定块内仅放行纯评论 mark
              // 的 set_node（键名均为 comment 前缀：comment、comment_draft、
              // comment_<id>、commentTransient，皆非内容属性），文本增删仍拦
              if (
                isReadonlyBlock(editor, op.path[0]) &&
                !(
                  op.type === 'set_node' &&
                  Object.keys(op.newProperties).every((key) =>
                    key.startsWith('comment'),
                  )
                )
              ) {
                return;
              }
            }
          }

          apply(op);
        },
      },
    }),
  );

export const TemplateKit = [TemplatePlugin];
