const routes = (calId) => ({
  home: "/",
  calendar: `/grids/${calId}/calendar`,
  schedule: `/grids/${calId}/schedule`,
  template: `/grids/${calId}/template`,
});

module.exports = routes;
