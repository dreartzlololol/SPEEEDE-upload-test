const app = require('../api/index.cjs');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeedE backend server running on http://0.0.0.0:${PORT}`);
});
