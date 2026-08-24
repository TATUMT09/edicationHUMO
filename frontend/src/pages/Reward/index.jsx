import CrudModule from '@/modules/CrudModule/CrudModule';
import RewardForm from './RewardForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Reward() {
  const translate = useLanguage();
  const entity = 'reward';
  const searchConfig = {
    displayLabels: ['title'],
    searchFields: 'title',
  };
  const deleteModalLabels = ['title'];

  const Labels = {
    PANEL_TITLE: translate('reward'),
    DATATABLE_TITLE: translate('reward_list'),
    ADD_NEW_ENTITY: translate('add_new_reward'),
    ENTITY_NAME: translate('reward'),
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
  return <CrudModule createForm={<RewardForm />} updateForm={<RewardForm />} config={config} />;
}
