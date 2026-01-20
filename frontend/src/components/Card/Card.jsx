import "./Card.css";

function Card({ image,  title }) {
  return (
    <div className="card">
        <img className="card-img" src={image} alt={title} />
        <button>{title}</button>
    </div>
  );
}

export default Card;
