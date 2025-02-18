import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchOrder() {
  const [qeury, setQeury] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/order/${qeury}`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search order #"
        value={qeury}
        onChange={(e) => setQeury(e.target.value)}
      />
    </form>
  );
}

export default SearchOrder;
