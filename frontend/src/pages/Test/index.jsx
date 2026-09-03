import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Test() {
  const translate = useLanguage();
  const entity = 'test';
  const searchConfig = {
    displayLabels: ['title'],
    searchFields: 'title',
  };
  const deleteModalLabels = ['title'];

  const Labels = {
    PANEL_TITLE: translate('test'),
    DATATABLE_TITLE: translate('test_list'),
    ADD_NEW_ENTITY: translate('add_new_test'),
    ENTITY_NAME: translate('test'),
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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Link to="/test/ai-import">
          <Button icon={<CloudUploadOutlined />}>Fayldan yuklash (AI)</Button>
        </Link>
      </div>
      <CrudModule
        createForm={<DynamicForm fields={fields} />}
        updateForm={<DynamicForm fields={fields} />}
        config={config}
      />
    </>
  );
}
