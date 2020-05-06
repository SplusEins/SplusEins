module.exports = {
  title: 'SplusEins',
  description: 'Dokumentation von spluseins.de',
  themeConfig: {
    logo: '/logo.png',
    sidebar: [
      ['/', 'Start'],
      '/grundlagen',
      '/konfiguration',
      '/server',
      '/wartung/',
      '/wartung/semesterbeginn',
	  '/benutzer',
    ],
    repo: 'spluseins/spluseins',
    docsDir: 'docs',
    displayAllHeaders: true,
    editLinks: true,
  },
}
