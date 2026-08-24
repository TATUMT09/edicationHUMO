import CrudModule from '@/modules/CrudModule/CrudModule';
import VideoLessonForm from './VideoLessonForm';
import { fields } from './config';

import useLanguage from '@/locale/useLanguage';

export default function VideoLesson() {
  const translate = useLanguage();
  const entity = 'videolesson';
  const searchConfig = {
    displayLabels: ['title'],
    searchFields: 'title',
  };
  const deleteModalLabels = ['title'];

  const Labels = {
    PANEL_TITLE: translate('video_lesson'),
    DATATABLE_TITLE: translate('video_lesson_list'),
    ADD_NEW_ENTITY: translate('add_new_video_lesson'),
    ENTITY_NAME: translate('video_lesson'),
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
      createForm={<VideoLessonForm />}
      updateForm={<VideoLessonForm />}
      config={config}
    />
  );
}
