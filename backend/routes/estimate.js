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


