import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Empty } from 'antd';
import { BookOutlined } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';

export default function PortalSubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getSubjects();
      if (data.success) setSubjects(data.result);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>Fanni tanlang</h2>
      {subjects.length === 0 ? (
        <Empty description="Hozircha fanlar qo'shilmagan" />
      ) : (
        <Row gutter={[16, 16]}>
          {subjects.map((subject) => (
            <Col xs={24} sm={12} md={8} key={subject._id}>
              <Card hoverable onClick={() => navigate(`/portal/subjects/${subject._id}`)}>
                <Card.Meta
                  avatar={<BookOutlined style={{ fontSize: 28, color: '#1640D6' }} />}
                  title={subject.name}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
