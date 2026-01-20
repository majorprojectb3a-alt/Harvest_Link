import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/estimate', async (req, res) => {
  try {
    // forward body to python service
    const pyRes = await axios.post('http://localhost:8000/predict-price', req.body, { timeout: 20000 });
    res.json(pyRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Estimation failed' });
  }
});

export default router;
