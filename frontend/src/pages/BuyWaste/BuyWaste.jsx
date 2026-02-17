import WasteOptions from "../../components/OptionCards/WasteOptions";
import Filters from "../../components/Filters/Filters";
import Navbar from "../../components/Navbar/Navbar";
import "./BuyWaste.css";

export default function BuyWaste() {
  return (
    <div className="buy-container">
      <Navbar />
      <div className="waste">
        <WasteOptions />
      </div>
    </div>
  );
}
