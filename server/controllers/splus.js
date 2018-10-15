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

cache.set('SPLUS63AE5A-41', [{"title":"Mathematik für die Informatik","day":0,"begin":8.25,"end":9.75,"info":"","room":"Hörsaal 252","lecturer":"Dr. S. Bellmer"},{"title":"Rechnerstrukturen - VL","day":1,"begin":8.25,"end":9.75,"info":"","room":"Hörsaal 026","lecturer":"B.Sc. B. Storre, Dipl.-Ing. G. Kircher"},{"title":"Algorithmen und Datenstrukturen - VL","day":2,"begin":8.25,"end":9.75,"info":"","room":"Hörsaal 252","lecturer":"Prof. Dr. F. Seutter"},{"title":"Programmieren - VL","day":0,"begin":10,"end":11.5,"info":"","room":"Hörsaal 252","lecturer":"Prof. Dr. J. Weimar"},{"title":"IESE-Theoretische Informatik","day":1,"begin":10,"end":11.5,"info":"","room":"Scale-Up-Room 201","lecturer":"Prof. Dr. P. Riegler"},{"title":"Programmieren - VL","day":2,"begin":10,"end":11.5,"info":"","room":"Hörsaal 252","lecturer":"Prof. Dr. J. Weimar"},{"title":"Mathematik für die Informatik","day":4,"begin":10,"end":11.5,"info":"","room":"Hörsaal 252","lecturer":"Dr. S. Bellmer"},{"title":"Mathe Cafe 2. Sem","day":0,"begin":12,"end":13.5,"info":"","room":"Hörsaal 026","lecturer":"Dr. S. Bellmer"},{"title":"Programmieren - Labor","day":1,"begin":12,"end":13.5,"info":"","room":"P1, P4, P2","lecturer":"Prof. Dr. J. Weimar"},{"title":"Algorithmen und Datenstrukturen - VL","day":3,"begin":12,"end":13.5,"info":"","room":"Hörsaal 252","lecturer":"Prof. Dr. F. Seutter"},{"title":"IESE-Theoretische Informatik","day":4,"begin":12,"end":13.5,"info":"","room":"Scale-Up-Room 201","lecturer":"Prof. Dr. P. Riegler"},{"title":"Programmieren - Labor","day":1,"begin":14.25,"end":15.75,"info":"","room":"P1, P4, P2","lecturer":"Prof. Dr. J. Weimar"},{"title":"I-Fremdsprache auf erhöhten Niveau / Business English  2. Sem. Binf -Kurs A","day":2,"begin":14.25,"end":15.75,"info":"Kursaufteilung vor der ersten Vorlesung in Raum 026!","room":"Hörsaal 026","lecturer":"Fr. Friedrichs"},{"title":"Fremdsprache auf erhöhten Niveau / Business English  2. Sem. Binf -Kurs B","day":2,"begin":14.25,"end":15.75,"info":"Kursaufteilung vor der ersten Vorlesung in Raum 026!","room":"Hörsaal 127","lecturer":"Fr. MA. A. Blaschke"},{"title":"Informatik-Lounge 2.Sem","day":3,"begin":14.25,"end":15.75,"info":"Raum nach Vereinbarung","room":"Poolraum 132 (P8)","lecturer":"Dipl.-Inf. D. Dick-Anwander"},{"title":"Rechnerstrukturen - Termin A - LAB","day":1,"begin":16,"end":17.5,"info":"","room":"Labor Automotive Systems, Raum 006","lecturer":"B.Sc. B. Storre, M. Sc. F. Pramme"},{"title":"I-Fremdsprache auf erhöhten Niveau / Business English  2. Sem. Binf -Kurs A","day":2,"begin":16,"end":17.5,"info":"","room":"Hörsaal 026","lecturer":"Fr. Friedrichs"},{"title":"Fremdsprache auf erhöhten Niveau / Business English  2. Sem. Binf -Kurs B","day":2,"begin":16,"end":17.5,"info":"","room":"Hörsaal 127","lecturer":"Fr. MA. A. Blaschke"},{"title":"BBS-Kompakt","day":3,"begin":16,"end":17.5,"info":"Nur duales Studium.","room":"Hörsaal 252","lecturer":"Herr Brodowski"},{"title":"Rechnerstrukturen - Termin A - LAB","day":1,"begin":17.75,"end":19.25,"info":"","room":"Labor Automotive Systems, Raum 006","lecturer":"B.Sc. B. Storre, M. Sc. F. Pramme"},{"title":"BBS-Kompakt","day":3,"begin":17.75,"end":19.25,"info":"","room":"Hörsaal 252","lecturer":"Herr Brodowski"}]);
