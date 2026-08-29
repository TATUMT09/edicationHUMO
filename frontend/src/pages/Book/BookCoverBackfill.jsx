import { useState } from 'react';
import { Button, Progress, message } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

import { request } from '@/request';
import { BASE_URL } from '@/config/serverApiConfig';
import { renderPdfFirstPageFromUrl } from '@/utils/pdfCover';

// One-time (repeatable) backfill for books uploaded before the auto-cover
// feature existed — new uploads already get a cover from BookForm, this
// just catches up on the ones that don't have one yet.
export default function BookCoverBackfill() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }

  const run = async () => {
    setRunning(true);
    const listData = await request.listAll({ entity: 'book' });
    if (!listData.success) {
      message.error("Kitoblar ro'yxatini olib bo'lmadi");
      setRunning(false);
      return;
    }

    const missing = listData.result.filter((b) => b.fileUrl && !b.coverImage);
    setProgress({ done: 0, total: missing.length });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < missing.length; i++) {
      const book = missing[i];
      try {
        const blob = await renderPdfFirstPageFromUrl(BASE_URL + book.fileUrl);
        const coverFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
        const uploadData = await request.uploadFile({
          entity: 'book',
          file: coverFile,
          path: 'book/upload-cover',
        });
        if (!uploadData.success) throw new Error('upload failed');

        const updateData = await request.update({
          entity: 'book',
          id: book._id,
          jsonData: { coverImage: uploadData.result.coverImage },
        });
        if (!updateData.success) throw new Error('update failed');
        succeeded++;
      } catch (err) {
        failed++;
      }
      setProgress({ done: i + 1, total: missing.length });
    }

    setRunning(false);
    if (missing.length === 0) {
      message.info("Muqovasiz kitob topilmadi — hammasida muqova bor.");
    } else {
      message.success(`Tayyor: ${succeeded} ta muqova qo'shildi${failed ? `, ${failed} tasi muvaffaqiyatsiz` : ''}. Sahifani yangilang.`);
    }
  };

  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button icon={<PictureOutlined />} onClick={run} loading={running}>
        {running ? 'Muqovalar tayyorlanmoqda...' : 'Eski kitoblarga muqova qo\'shish'}
      </Button>
      {progress && (
        <Progress
          style={{ maxWidth: 200 }}
          percent={Math.round((progress.done / Math.max(progress.total, 1)) * 100)}
          format={() => `${progress.done}/${progress.total}`}
        />
      )}
    </div>
  );
}
