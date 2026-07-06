export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  monthlyFee: {
    type: 'number',
    label: 'monthly_fee',
  },
  teacher: {
    type: 'async',
    entity: 'staff',
    dataIndex: ['teacher', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
    label: 'teacher',
  },
  description: {
    type: 'textarea',
  },
};
