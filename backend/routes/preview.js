const express = require('express');
const router = express.Router();
const { fetchLinkPreview } = require('../utils/linkPreview');

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const preview = await fetchLinkPreview(url);
    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
});

module.exports = router;