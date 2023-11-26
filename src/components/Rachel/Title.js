import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./Title.css";
import { ReactComponent as RefreshIcon } from "./refresh.svg";

const Title = ({ setMessages }) => {
  const [isResetting, setIsResetting] = useState(false);

  // Reset the conversation
  const resetConversation = async () => {
    setIsResetting(true);

    await axios
      .get("http://localhost:8000/reset-messages")
      .then((response) => {
        if (response.status === 200) {
          setMessages([]);
        } else {
          console.log("Error resetting conversation");
        }
      })
      .catch((error) => {
        console.log(error);
      });

    setIsResetting(false);
  };

  return (
    <div className="flex justify-between items-center w-full p-4 bg-gray-900 text-white font-bold shadow">
      <div className="italic">Rachel</div>
      <button
        onClick={resetConversation}
        className={
          "transition-all duration-300 text-blue-300 hover:text-pink-500 " +
          (isResetting ? "animate-pulse" : "")
        }
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
