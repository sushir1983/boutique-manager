const { ensureTable, getData } = require('./_db');

module.exports = async (req, res) => {
  try {
    await ensureTable();
    const current = await getData();
    res.setHeader('Content-Disposition', `attachment; filename="boutique-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.status(200).json(current.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
