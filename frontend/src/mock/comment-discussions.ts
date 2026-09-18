import type { TDiscussion } from '@/features/comment/components/editor/plugins/discussion-kit';

export const discussionsData: TDiscussion[] = [
  {
    id: 'discussion1',
    comments: [
      {
        id: 'comment1',
        contentRich: [
          {
            children: [
              {
                text: 'Comments are a great way to provide feedback and discuss changes.',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 600_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'charlie',
      },
      {
        id: 'comment2',
        contentRich: [
          {
            children: [
              {
                text: 'Agreed! The link to the docs makes it easy to learn more.',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 500_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'bob',
      },
    ],
    createdAt: new Date(),
    documentContent: 'comments',
    isResolved: false,
    userId: 'charlie',
  },
  {
    id: 'discussion2',
    comments: [
      {
        id: 'comment1',
        contentRich: [
          {
            children: [
              {
                text: 'Nice demonstration of overlapping annotations with both comments and suggestions!',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 300_000),
        discussionId: 'discussion2',
        isEdited: false,
        userId: 'bob',
      },
      {
        id: 'comment2',
        contentRich: [
          {
            children: [
              {
                text: 'This helps users understand how powerful the editor can be.',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 200_000),
        discussionId: 'discussion2',
        isEdited: false,
        userId: 'charlie',
      },
    ],
    createdAt: new Date(),
    documentContent: 'overlapping',
    isResolved: false,
    userId: 'bob',
  },
];
