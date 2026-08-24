import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, List, Spin, Empty, Button, Modal, Progress, Tag, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';

import portalRequest from '@/request/portalRequest';
import { BASE_URL } from '@/config/serverApiConfig';

function isUploadedFile(url) {
  return !!url && !/^https?:\/\//i.test(url);
}

export default function PortalRewardStorePage() {
  const [rewards, setRewards] = useState([]);
  const [myStars, setMyStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [confirmReward, setConfirmReward] = useState(null);

  const load = async () => {
    setLoading(true);
    const [rewardsRes, statsRes] = await Promise.all([
      portalRequest.getRewards(),
      portalRequest.getStatsSummary(),
    ]);
    if (rewardsRes.success) setRewards(rewardsRes.result);
    if (statsRes.success) setMyStars(statsRes.result.totalStars);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onConfirmPurchase = async () => {
    if (!confirmReward) return;
    setPurchasing(confirmReward._id);
    const data = await portalRequest.purchaseReward(confirmReward._id);
    setPurchasing(null);
    setConfirmReward(null);
    if (data.success) {
      message.success("🎉 Sovg'a muvaffaqiyatli olindi!");
      load();
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <h2>🎁 Sovg'alar do'koni</h2>
      <Card style={{ marginBottom: 16, background: '#f0f5ff' }}>
        <b>Sizning balansingiz:</b> ⭐ {myStars}{' '}
        <Link to="/portal/reward-orders" style={{ float: 'right' }}>
          Mening buyurtmalarim →
        </Link>
      </Card>

      {rewards.length === 0 ? (
        <Empty description="Hozircha sovg'alar yo'q" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={rewards}
          renderItem={(reward) => {
            const canAfford = myStars >= reward.starCost;
            const outOfStock = reward.stock != null && reward.stock <= 0;
            const imgSrc = reward.imageUrl
              ? isUploadedFile(reward.imageUrl)
                ? BASE_URL + reward.imageUrl
                : reward.imageUrl
              : null;

            return (
              <List.Item>
                <Card
                  cover={
                    imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={reward.title}
                        style={{ height: 160, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fafafa',
                        }}
                      >
                        <GiftOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={reward.title}
                    description={
                      <>
                        {reward.description && <p>{reward.description}</p>}
                        <p style={{ fontWeight: 'bold' }}>⭐ {reward.starCost}</p>
                        {!canAfford && (
                          <Progress
                            percent={Math.min(Math.round((myStars / reward.starCost) * 100), 100)}
                            size="small"
                            format={() => `${reward.starCost - myStars} ⭐ kerak`}
                          />
                        )}
                        {outOfStock && <Tag color="red">Tugagan</Tag>}
                      </>
                    }
                  />
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: 12 }}
                    disabled={!canAfford || outOfStock}
                    loading={purchasing === reward._id}
                    onClick={() => setConfirmReward(reward)}
                  >
                    {outOfStock ? 'Tugagan' : canAfford ? 'Olish' : 'Yulduz yetarli emas'}
                  </Button>
                </Card>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="Sovg'ani tasdiqlash"
        open={!!confirmReward}
        onOk={onConfirmPurchase}
        onCancel={() => setConfirmReward(null)}
        confirmLoading={!!purchasing}
        okText="Ha, olaman"
        cancelText="Bekor qilish"
      >
        {confirmReward && (
          <p>
            <b>{confirmReward.title}</b> sovg'asini <b>{confirmReward.starCost} ⭐</b> evaziga
            olishni tasdiqlaysizmi?
          </p>
        )}
      </Modal>
    </div>
  );
}
