'use client';

/* DEMO ONLY, DO NOT USE IN PRODUCTION */
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkbenchStore } from '@/stores/workbench';
import * as React from 'react';
import { useChatStore } from '../../stores';

export function SettingsDialog() {
  const isSettingsDialogOpen = useWorkbenchStore(
    (state) => state.isSettingsDialogOpen,
  );
  const setSettingsDialogOpen = useWorkbenchStore(
    (state) => state.setSettingsDialogOpen,
  );

  return (
    <Dialog open={isSettingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">设置</DialogTitle>
          <DialogDescription>
            配置模型 API（OpenAI 兼容格式）。
          </DialogDescription>
        </DialogHeader>
        <SettingsForm onClose={() => setSettingsDialogOpen(false)} />
        <p className="text-muted-foreground text-sm">
          所有设置均保存在本地，并且仅用于当前会话。
        </p>
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const openAICompatibleModel = useChatStore(
    (state) => state.openAICompatibleModel,
  );
  const setOpenAICompatibleModel = useChatStore(
    (state) => state.setOpenAICompatibleModel,
  );

  const [baseUrl, setBaseUrl] = React.useState(openAICompatibleModel.baseUrl);
  const [apiKey, setApiKey] = React.useState(openAICompatibleModel.apiKey);
  const [modelId, setModelId] = React.useState(openAICompatibleModel.modelId);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setOpenAICompatibleModel({ baseUrl, apiKey, modelId });
    onClose();
  };

  return (
    <form id="settings-form" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">API 地址</FieldLabel>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            id="baseUrl"
            type="text"
            placeholder="https://api.openai.com/v1"
            autoComplete="off"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">API 密钥</FieldLabel>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            id="apiKey"
            type="text"
            placeholder="sk- . . ."
            autoComplete="off"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">模型 ID</FieldLabel>
          <Input
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            id="modelId"
            type="text"
            placeholder="gpt-5"
            autoComplete="off"
            required
          />
        </Field>
        <Field>
          <Button type="submit" form="settings-form">
            保存更改
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
