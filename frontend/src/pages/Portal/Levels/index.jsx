import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Row, Col, Spin } from 'antd';

import portalRequest from '@/request/portalRequest';

const LEVELS = [
  { key: 'beginner', label: "Boshlang'ich" },
  { key: 'intermediate', label: "O'rta" },
  { key: 'advanced', label: 'Yuqori' },
];

export default function PortalLevelsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await portalRequest.getSubjects();
      if (data.success) {
        setSubject(data.result.find((s) => s._id === subjectId) || null);
      }
      setLoading(false);
    })();
  }, [subjectId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>{subject ? subject.name : 'Fan'} — darajani tanlang</h2>
      <Row gutter={[16, 16]}>
        {LEVELS.map((level) => (
          <Col xs={24} sm={8} key={level.key}>
            <Card
              hoverable
              onClick={() => navigate(`/portal/subjects/${subjectId}/${level.key}`)}
              style={{ textAlign: 'center' }}
            >
              <h3>{level.label}</h3>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
