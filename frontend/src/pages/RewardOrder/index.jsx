import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function RewardOrder() {
  const translate = useLanguage();
  const entity = 'rewardorder';
  const searchConfig = {
    displayLabels: ['rewardTitle'],
    searchFields: 'rewardTitle',
  };
  const deleteModalLabels = ['rewardTitle'];

  const Labels = {
    PANEL_TITLE: translate('reward_order'),
    DATATABLE_TITLE: translate('reward_order_list'),
    ADD_NEW_ENTITY: translate('add_new_reward_order'),
    ENTITY_NAME: translate('reward_order'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
      config={config}
    />
  );
}
