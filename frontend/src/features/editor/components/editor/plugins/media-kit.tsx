'use client';

import { CaptionPlugin } from '@platejs/caption/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@platejs/media/react';
import { KEYS } from 'platejs';
import { AudioElement } from '../../ui/media-audio-node';
import { FileElement } from '../../ui/media-file-node';
import { ImageElement } from '../../ui/media-image-node';
import { PlaceholderElement } from '../../ui/media-placeholder-node';
import { MediaPreviewDialog } from '../../ui/media-preview-dialog';
import { MediaUploadToast } from '../../ui/media-upload-toast';
import { VideoElement } from '../../ui/media-video-node';

export const MediaKit = [
  ImagePlugin.configure({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog, node: ImageElement },
  }),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast, node: PlaceholderElement },
  }),
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file],
      },
    },
  }),
];
