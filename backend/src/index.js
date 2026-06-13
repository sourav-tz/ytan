require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');
const downloadRouter = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 8050;

app.use(cors());
app.use(express.json());

app.use('/api/v1', analyzeRouter);
app.use('/api/v1', downloadRouter);

app.listen(PORT, () => {
  console.log(`YtAna backend running on port ${PORT}`);
});
