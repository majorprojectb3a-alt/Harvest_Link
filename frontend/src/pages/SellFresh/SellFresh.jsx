import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import axios from "axios";

function SellFresh() {
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    crop: "",
    quantity: "",
    state: "",
    district: "",
    mandi: "",
    price: "",
    total: 0,
  });

  // ✅ Fetch products from backend on page load
  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      total:
        name === "quantity" || name === "price"
          ? (name === "quantity" ? value : prev.quantity) *
            (name === "price" ? value : prev.price)
          : prev.total,
    }));
  };

  const handleSubmit = () => {
    axios.post("http://localhost:5000/api/products", formData)
      .then(res => {
        setProducts([...products, res.data]);
        setFormData({
          crop: "",
          quantity: "",
          state: "",
          district: "",
          mandi: "",
          price: "",
          total: 0,
        });
        handleClose();
        setShowToast(true);
      })
      .catch(err => console.error(err));
  };

  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: "100px" }}>
        <div className="row">
          {products.map((p, i) => (
            <div className="col-md-6 col-lg-4 mb-4" key={i}>
              <div className="card shadow-lg border-success h-100">
                <div className="card-body">
                  <h4 className="card-title text-success">{p.crop}</h4>
                  <p className="card-text fs-5">
                    <strong>Quantity:</strong> {p.quantity} kg <br />
                    <strong>Price per unit:</strong> ₹{p.price} <br />
                    <strong>Total:</strong> ₹{p.total} <br />
                    <strong>Location:</strong> {p.state}, {p.district}, {p.mandi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating + button */}
        <Button
          variant="success"
          className="rounded-circle shadow-lg"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            fontSize: "24px",
          }}
          onClick={handleShow}
        >
          +
        </Button>

        {/* Modal */}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>Add Crop Item</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-light">
            <Form>
              <Form.Group>
                <Form.Label>Crop Name</Form.Label>
                <Form.Control
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Quantity (kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Price per unit</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Control
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>District</Form.Label>
                <Form.Control
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Nearby Mandi</Form.Label>
                <Form.Control
                  name="mandi"
                  value={formData.mandi}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Total Price</Form.Label>
                <Form.Control readOnly value={formData.total} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Add Item
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Success Toast */}
        <ToastContainer position="top-center" className="mt-3">
          <Toast
            bg="success"
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={2000}
            autohide
          >
            <Toast.Body className="text-white">
              ✅ Item added successfully
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </>
  );
}

export default SellFresh;
