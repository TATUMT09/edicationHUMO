import { useEffect, useRef, useState } from 'react';
import { Card, Input, Button, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';

import { request } from '@/request';
import useResponsive from '@/hooks/useResponsive';

export default function Assistant() {
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);

    const res = await request.post({
      entity: 'assistant/ask',
      jsonData: { question, history },
    });

    setIsLoading(false);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: res.success ? res.result.answer : res.message || 'Xatolik yuz berdi' },
    ]);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Card title="AI Yordamchi" styles={{ body: { padding: isMobile ? '12px' : '24px' } }}>
      <div
        style={{
          height: isMobile ? '60vh' : '55vh',
          overflowY: 'auto',
          marginBottom: '16px',
          padding: '4px',
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
            Masalan: "Bugun kimlar kelmagan?", "Kim to'lamagan?", "Guruhda nechta o'quvchi bor?"
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: '10px',
                background: m.role === 'user' ? '#1640D6' : '#f0f0f0',
                color: m.role === 'user' ? '#fff' : '#000',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Spin size="small" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Savolingizni yozing..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={send} loading={isLoading} />
      </div>
    </Card>
  );
}
