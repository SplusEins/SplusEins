const express = require('express'),
  { createHash } = require('crypto'),
  router = express.Router(),
  { SplusApi } = require('../lib/SplusApi');

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');

const cache = new Map();

router.get('/:course/:week', async (req, res) => {
  const course = req.params.course;
  const week = parseInt(req.params.week);
  const key = `${course}-${week}`;

  if (!cache.has(key)) {
    const data = await SplusApi.getData('#' + course, week);
    const id = (lecture) => sha256(JSON.stringify({ lecture, course, week }));
    cache.set(key, data.map((lecture) => ({ ...lecture, course, week, id: id(lecture) })));
  }

  res.json(cache.get(key));
});

module.exports = router;
