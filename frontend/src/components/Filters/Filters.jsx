import { CROP_WASTE_TYPES } from "../../constants/cropWasteTypes";
import "./Filters.css";

export default function Filters({ selectedType, setSelectedType }) {
  return (
    <div className="filters">

      {/* CROP WASTE TYPE FILTER */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="All">All Types</option>
        {CROP_WASTE_TYPES.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

    </div>
  );
}
