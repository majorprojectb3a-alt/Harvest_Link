import "./Card.css";

function Card({ image,  title , onClick}) {
  return (
    <div className="card" onClick={onClick}>
        <img className="card-img" src={image} alt={title} />
        <button>{title}</button>
    </div>
  );
}

export default Card;
