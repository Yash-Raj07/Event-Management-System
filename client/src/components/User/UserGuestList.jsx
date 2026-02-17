import { useState, useEffect } from "react";
import { API_BASE } from "../../constants";

function UserGuestList({ onBack }) {
  return (
    <div className="screen">
      <div className="title-bar">Guest List</div>
      <p>Guest list placeholder.</p>
      <div className="button-row">
        <button className="button secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export default UserGuestList;
