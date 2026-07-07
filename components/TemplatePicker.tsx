'use client';

import type { TemplateId } from '@/lib/types';
import { TEMPLATE_LABELS, TEMPLATE_ORDER } from '@/lib/strategies/templates';

interface Props {
  selected?: TemplateId;
  onSelect: (templateId: TemplateId) => void;
}

export function TemplatePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {TEMPLATE_ORDER.map((templateId) => (
        <button
          key={templateId}
          data-testid={`template-${templateId}`}
          className={`rounded border px-3 py-2 text-left text-xs font-semibold ${
            selected === templateId ? 'border-sky-400 bg-sky-950/40 text-zinc-50' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
          }`}
          onClick={() => onSelect(templateId)}
          type="button"
        >
          {TEMPLATE_LABELS[templateId]}
        </button>
      ))}
    </div>
  );
}
