const STATUS_OPTIONS = [
  { value: 'pending', label: 'Kutilmoqda', color: 'gold' },
  { value: 'approved', label: 'Tasdiqlandi', color: 'blue' },
  { value: 'preparing', label: 'Tayyorlanmoqda', color: 'purple' },
  { value: 'delivered', label: 'Yetkazildi', color: 'green' },
  { value: 'cancelled', label: 'Bekor qilindi', color: 'red' },
];

export const fields = {
  student: {
    type: 'async',
    entity: 'student',
    dataIndex: ['student', 'name'],
    displayLabels: ['name'],
    outputValue: '_id',
    label: 'student',
    disableForUpdate: true,
  },
  rewardTitle: {
    type: 'string',
    label: 'reward',
    disableForUpdate: true,
  },
  starCost: {
    type: 'number',
    label: 'star_cost',
    disableForUpdate: true,
  },
  status: {
    type: 'select',
    label: 'status',
    options: STATUS_OPTIONS,
  },
  adminNote: {
    type: 'textarea',
    label: 'admin_note',
  },
};
