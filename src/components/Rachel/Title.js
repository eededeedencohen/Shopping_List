import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./Title.css";
import { ReactComponent as RefreshIcon } from "./refresh.svg";

const Title = ({ setMessages }) => {
  const [isResetting, setIsResetting] = useState(false);

  const resetConversation = async () => {
    setIsResetting(true);

    try {
      const response = await axios.get("http://localhost:8000/reset-messages");
      if (response.status === 200) {
        setMessages([]);
      } else {
        console.log("Error resetting conversation");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex justify-between items-center w-full p-4 bg-gray-900 text-white font-bold shadow">
      <div className="italic">Rachel</div>
      <button
        onClick={resetConversation}
        className={`transition-all duration-300 text-blue-300 hover:text-pink-500 ${
          isResetting ? "animate-pulse" : ""
        }`}
        disabled={isResetting}
      >
        <RefreshIcon style={{ width: "24px", height: "24px" }} />
      </button>
    </div>
  );
};

Title.propTypes = {
  setMessages: PropTypes.func.isRequired,
};

export default Title;
