import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/crop-to-biofuel', async (req, res) => {
  try {
    const pyRes = await axios.post('http://127.0.0.1:8000/crop-to-biofuel', req.body, { timeout: 20000 });
    res.json(pyRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Estimation failed' });
  }
});

export default router;
