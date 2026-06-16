const { sql, ensureTable, getData } = require('./_db');

module.exports = async (req, res) => {
  try {
    await ensureTable();

    if (req.method === 'GET') {
      const current = await getData();
      return res.status(200).json({ db: current.data, version: current.version });
    }

    if (req.method === 'PUT') {
      const { db, version: clientVersion } = req.body || {};
      if (!db || typeof db !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid db payload' });
      }

      const current = await getData();
      if (typeof clientVersion === 'number' && clientVersion !== current.version) {
        // Someone else saved in between this client's load and save —
        // reject and hand back the latest data instead of overwriting it.
        return res.status(409).json({ db: current.data, version: current.version, conflict: true });
      }

      const newVersion = current.version + 1;
      await sql`
        UPDATE boutique_data
        SET data = ${JSON.stringify(db)}::jsonb, version = ${newVersion}
        WHERE id = 1
      `;
      return res.status(200).json({ version: newVersion });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
