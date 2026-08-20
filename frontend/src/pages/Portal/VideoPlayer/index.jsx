import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty } from 'antd';

import portalRequest from '@/request/portalRequest';

function toEmbedUrl(url) {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

export default function PortalVideoPlayerPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getVideo(videoId);
      if (data.success) setVideo(data.result);
      setLoading(false);
    })();
  }, [videoId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!video) return <Empty description="Video topilmadi" />;

  return (
    <div>
      <h2>{video.title}</h2>
      <div style={{ position: 'relative', paddingTop: '56.25%', marginBottom: 16 }}>
        <iframe
          src={toEmbedUrl(video.videoUrl)}
          title={video.title}
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
            borderRadius: 8,
          }}
        />
      </div>
      {video.description && <p>{video.description}</p>}
    </div>
  );
}
