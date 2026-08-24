import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Spin, Empty, Input, AutoComplete } from 'antd';
import {
  BookOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { selectCurrentStudent } from '@/redux/portalAuth/selectors';

export default function PortalSubjectsPage() {
  const navigate = useNavigate();
  const student = useSelector(selectCurrentStudent);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mistakesCount, setMistakesCount] = useState(0);

  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    (async () => {
      const [subjectsRes, statsRes, mistakesRes] = await Promise.all([
        portalRequest.getSubjects(),
        portalRequest.getStatsSummary(),
        portalRequest.getMistakes(),
      ]);
      if (subjectsRes.success) setSubjects(subjectsRes.result);
      if (statsRes.success) setStats(statsRes.result);
      if (mistakesRes.success) {
        const count = (mistakesRes.result.bySubject || []).reduce(
          (sum, g) => sum + g.items.length,
          0
        );
        setMistakesCount(count);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSearchResults(null);
      return undefined;
    }
    const timeout = setTimeout(async () => {
      const res = await portalRequest.search(q.trim());
      if (res.success) setSearchResults(res.result);
    }, 300);
    return () => clearTimeout(timeout);
  }, [q]);

  const goTo = (item) => {
    if (item.kind === 'subject') navigate(`/portal/subjects/${item._id}`);
    if (item.kind === 'test') navigate(`/portal/tests/${item._id}`);
    if (item.kind === 'book') navigate(`/portal/books/${item._id}`);
    if (item.kind === 'video') navigate(`/portal/video/${item._id}`);
    setQ('');
    setSearchResults(null);
  };

  const searchOptions = searchResults
    ? [
        {
          label: 'Fanlar',
          options: searchResults.subjects.map((s) => ({
            value: `subject:${s._id}`,
            label: (
              <span>
                <BookOutlined /> {s.name}
              </span>
            ),
          })),
        },
        {
          label: 'Testlar',
          options: searchResults.tests.map((t) => ({
            value: `test:${t._id}`,
            label: (
              <span>
                <FileTextOutlined /> {t.title}
              </span>
            ),
          })),
        },
        {
          label: 'Kitoblar',
          options: searchResults.books.map((b) => ({
            value: `book:${b._id}`,
            label: (
              <span>
                <ReadOutlined /> {b.title}
              </span>
            ),
          })),
        },
        {
          label: 'Video darslar',
          options: searchResults.videos.map((v) => ({
            value: `video:${v._id}`,
            label: (
              <span>
                <PlayCircleOutlined /> {v.title}
              </span>
            ),
          })),
        },
      ].filter((group) => group.options.length > 0)
    : [];

  const onSelectSearchOption = (value) => {
    const [kind, id] = value.split(':');
    goTo({ _id: id, kind });
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>Salom, {student?.name || student?.firstName} 👋</h2>

      <AutoComplete
        style={{ width: '100%', marginBottom: 24 }}
        options={searchOptions}
        onSearch={setQ}
        value={q}
        onChange={setQ}
        onSelect={onSelectSearchOption}
      >
        <Input.Search
          size="large"
          placeholder="Matematika, IELTS, test, kitob yoki istalgan mavzuni qidiring..."
        />
      </AutoComplete>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <FireOutlined style={{ color: '#fa541c', marginRight: 8 }} />
              Bugun: <b>{stats.todayTestsCount}</b> ta test, <b>⭐ {stats.todayStars}</b>
            </Card>
          </Col>
          {stats.weakSubject && (
            <Col xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => navigate(`/portal/subjects/${stats.weakSubject.subjectId}`)}
              >
                💡 <b>{stats.weakSubject.subjectName}</b> fanida ko'proq mashq qiling (
                {stats.weakSubject.percent}%)
              </Card>
            </Col>
          )}
          {mistakesCount > 0 && (
            <Col xs={24} sm={8}>
              <Card hoverable onClick={() => navigate('/portal/mistakes')}>
                <CloseCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                Sizda <b>{mistakesCount}</b> ta xato bor — ko'rib chiqing
              </Card>
            </Col>
          )}
        </Row>
      )}

      <h3>Fanni tanlang</h3>
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
