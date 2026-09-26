import { getAuthAltchaRetrieveQueryKey } from '@/api/gen/endpoints/auth/auth';
// Importing altcha package will introduce a new element <altcha-widget>
import 'altcha/i18n';
import type { WidgetAttributes, WidgetMethods } from 'altcha/types';
import type {} from 'altcha/types/react';
import { useEffect, useRef } from 'react';

export function Altcha({
  value,
  onChange,
}: {
  value: string;
  onChange?: (payload: string) => void;
}) {
  const widgetRef = useRef<WidgetAttributes & WidgetMethods & HTMLElement>(
    null,
  );
  const valueRef = useRef(value);

  useEffect(() => {
    const handleStateChange = (ev: Event | CustomEvent) => {
      if ('detail' in ev) {
        onChange?.(ev.detail.payload || '');
      }
    };

    const { current } = widgetRef;

    if (current) {
      current.addEventListener('statechange', handleStateChange);
      return () =>
        current.removeEventListener('statechange', handleStateChange);
    }
  }, [onChange]);

  useEffect(() => {
    if (valueRef.current && !value) {
      widgetRef.current?.reset();
    }
    valueRef.current = value;
  }, [value]);

  /* Configure your `challenge` and remove the `test` attribute, see docs: https://altcha.org/docs/v2/widget-integration/  */
  const challenge =
    import.meta.env.VITE_BACKEND_URL + getAuthAltchaRetrieveQueryKey()[0];
  return (
    <altcha-widget
      ref={widgetRef}
      challenge={challenge}
      display="bar"
    ></altcha-widget>
  );
}
