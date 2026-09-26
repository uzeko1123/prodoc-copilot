'use client';

/* DEMO ONLY, DO NOT USE IN PRODUCTION */
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { useWorkbenchStore } from '@/stores/workbench';
import * as React from 'react';
import { useChatStore } from '../../stores';

export function SettingsDialog() {
  const openAICompatibleModel = useChatStore(
    (state) => state.openAICompatibleModel,
  );
  const setOpenAICompatibleModel = useChatStore(
    (state) => state.setOpenAICompatibleModel,
  );

  const isSettingsDialogOpen = useWorkbenchStore(
    (state) => state.isSettingsDialogOpen,
  );
  const setSettingsDialogOpen = useWorkbenchStore(
    (state) => state.setSettingsDialogOpen,
  );

  const [baseUrl, setBaseUrl] = React.useState(openAICompatibleModel.baseUrl);
  const [apiKey, setApiKey] = React.useState(openAICompatibleModel.apiKey);
  const [modelId, setModelId] = React.useState(openAICompatibleModel.modelId);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setOpenAICompatibleModel({ baseUrl, apiKey, modelId });
    setSettingsDialogOpen(false);
  };

  return (
    <Dialog open={isSettingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences.
          </DialogDescription>
        </DialogHeader>
        <form id="login-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Base URL</FieldLabel>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                id="baseUrl"
                type="text"
                placeholder="https://api.openai.com/v1"
                autoComplete="baseUrl"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">API Key</FieldLabel>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                id="apiKey"
                type="password"
                placeholder="sk-..."
                autoComplete="apiKey"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Model ID</FieldLabel>
              <Input
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                id="modelId"
                type="text"
                placeholder="gpt-5"
                autoComplete="modelId"
                required
              />
            </Field>
            <Field>
              <Button type="submit" form="login-form">
                Save changes
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <p className="text-muted-foreground text-sm">
          Not stored anywhere. Used only for current session requests.
        </p>
      </DialogContent>
    </Dialog>
  );
}
