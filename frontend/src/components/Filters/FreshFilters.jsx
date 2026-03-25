import "./FreshFilters.css";
import { CROP_FRESH_TYPES } from "../../constants/cropFreshTypes";
export default function Filters({
  selectedType,
  setSelectedType,
  selectedDistance,
  setSelectedDistance
}) {

  return (

    <div className="filters-container">

      <div className="filter-item">

        <label>Crop Type</label>

        <select  value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">Select Crop Fresh Type</option>
            <option value="All"> all </option>
            {[...new Set(CROP_FRESH_TYPES)]
            .sort((a,b)=>a.localeCompare(b))
            .map(type => (
                <option key={type} value={type}>
                {type}
                </option>
            ))}
              
        </select>

      </div>


      <div className="filter-item">

        <label>Distance</label>

        <select
          value={selectedDistance}
          onChange={(e) => setSelectedDistance(e.target.value)}
        >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
            <option value="all"> all </option>
        </select>

      </div>

    </div>

  );

}