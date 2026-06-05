const pool = require('./src/config/db');

async function run() {
  const items = [
    
    [1, null, 'Acc FF Newbie', 60000, 'available'],
    [1, null, 'Acc Genshin AR30', 100000, 'available'],
    [1, null, 'Acc rác LQ', 50000, 'available'],
    [1, null, 'Acc rác FF', 50000, 'available'],
    [1, null, 'Acc rác PUBG', 50000, 'available'],
    [1, null, 'Cày thuê LQ x1', 50000, 'available'],
    [1, null, 'Thẻ Garena 50K', 50000, 'available'],
    
    
    [6, null, 'Acc LQ Random', 300000, 'available'],
    [6, null, 'Acc PUBG Bạch Kim', 300000, 'available'],
    [6, null, 'Acc Genshin AR40', 300000, 'available'],
    [6, null, 'Thẻ Garena 200K', 200000, 'available'],
    [6, null, 'Thẻ Zing 200K', 200000, 'available'],
    [6, null, 'Mã giảm giá shop 50%', 250000, 'available'],
    [6, null, 'Gói cày thuê', 250000, 'available'],
    [6, null, 'Acc Valorant Bạc', 300000, 'available'],
    [6, null, '1000 Quân Huy', 500000, 'available'],
    
    
    [11, null, 'Thẻ Garena 500K', 500000, 'available'],
    [11, null, 'Thẻ Zing 500K', 500000, 'available'],
    [11, null, 'Acc FF Kim Cương', 700000, 'available'],
    [11, null, 'Acc Genshin AR50', 800000, 'available'],
    [11, null, 'Acc PUBG Quán Quân', 800000, 'available'],
    [11, null, 'Acc Valorant Vàng', 800000, 'available'],
    [11, null, 'Gói buff bẩn', 750000, 'available'],
    [11, null, 'Mã giảm giá shop', 800000, 'available'],
    [11, null, 'Acc rác LQ VIP', 700000, 'available'],
    [11, null, '2000 Quân Huy', 1000000, 'available']
  ];

  try {
    for (const item of items) {
      await pool.query('INSERT INTO blind_bag_items (group_id, account_id, custom_title, custom_value, status) VALUES (?, ?, ?, ?, ?)', item);
    }
    console.log("Inserted new items successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
