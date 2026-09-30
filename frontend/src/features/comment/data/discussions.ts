// @generated-by-ai

import type { TDiscussion } from '../components/editor/plugins/discussion-kit';

const HOUR = 3_600_000;
const MIN = 60_000;
const T_REVIEW = Date.now() - 90 * MIN;
const T_TERM = Date.now() - 26 * HOUR;

export const discussionsData: TDiscussion[] = [
  // AI 评阅批注：演示「智能评阅」在关键句旁留下的修改建议
  {
    id: 'd_ai_review',
    comments: [
      {
        id: 'c1',
        contentRich: [
          {
            children: [
              {
                text: '「减少了一半」缺少样本量与统计周期的支撑，直接发布容易受到质疑。建议补充数据来源，或改用「显著减少」这类更稳妥的表述。',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(T_REVIEW),
        discussionId: 'd_ai_review',
        isEdited: false,
        userId: 'alice',
        createdByAI: true,
      },
    ],
    createdAt: new Date(T_REVIEW),
    documentContent:
      '据团队观察，启用智能评阅后，文档的平均返工次数减少了一半。',
    isResolved: false,
    userId: 'alice',
  },
  // 多人讨论：演示评论的回复与协作
  {
    id: 'd_term',
    comments: [
      {
        id: 'c2',
        contentRich: [
          {
            children: [
              {
                text: '文中「评论」和「讨论」两种说法时有混用（如「发起讨论」「留下评论」），要不要统一术语？',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(T_TERM),
        discussionId: 'd_term',
        isEdited: false,
        userId: 'bob',
      },
      {
        id: 'c3',
        contentRich: [
          {
            children: [
              {
                text: '建议统一为「评论」，与右侧面板的标签保持一致；正文里的「发起讨论」可以顺手改成「发起评论」。',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(T_TERM + 40 * MIN),
        discussionId: 'd_term',
        isEdited: false,
        userId: 'charlie',
      },
      {
        id: 'c4',
        contentRich: [
          {
            children: [
              {
                text: '收到，下一版会统一为「评论」，并同步更新面板文案，谢谢两位！',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(T_TERM + 2 * HOUR),
        discussionId: 'd_term',
        isEdited: false,
        userId: 'alice',
      },
    ],
    createdAt: new Date(T_TERM),
    documentContent: '评论与回复会汇聚成一条讨论，任何成员都可以随时加入。',
    isResolved: false,
    userId: 'bob',
  },
];
