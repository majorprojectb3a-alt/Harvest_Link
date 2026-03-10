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

router.post("/predict-price", async (req, res) => {

  try {

    const response = await axios.post(
      "http://localhost:8000/predict-fresh-price",
      req.body
    );

    res.json(response.data);

  } catch (error) {

    console.error("Prediction error:", error.message);

    res.status(500).json({
      message: "Prediction service failed"
    });
  }

});

export default router;


