const LEVEL_OPTIONS = [
  { value: 'beginner', label: "Boshlang'ich" },
  { value: 'intermediate', label: "O'rta" },
  { value: 'advanced', label: 'Yuqori' },
];

export const fields = {
  title: {
    type: 'string',
    required: true,
  },
  subject: {
    type: 'async',
    entity: 'subject',
    dataIndex: ['subject', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
    label: 'subject',
    required: true,
  },
  level: {
    type: 'select',
    label: 'level',
    required: true,
    options: LEVEL_OPTIONS,
  },
  // Plain string, not the DynamicForm "url" type — that type visually
  // prefixes "http://" as a decoration without folding it into the actual
  // value, which is confusing for a field meant to hold a full pasted
  // YouTube link.
  videoUrl: {
    type: 'string',
    required: true,
    label: 'video_url',
  },
  description: {
    type: 'textarea',
    label: 'description',
  },
  durationSeconds: {
    type: 'number',
    label: 'duration_seconds',
  },
  order: {
    type: 'number',
    label: 'order',
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
