import React, { useState } from "react";
import PropTypes from "prop-types";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import "./Controller.css";
import axios from "axios";

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const createBlobUrl = (data) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl) => {
    setIsLoading(true);

    // append recorded message to messages.
    const myMessage = { sender: "me", blobUrl: blobUrl };
    const messageArray = [...messages, myMessage];

    // convert blobUrl to blob object.
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // construct audio to send file
        // construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");

        // send form data to API endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: { "Content-Type": "audio/mpeg" },
            responseType: "arraybuffer",
          })
          .then((res) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            // Append to audio
            const rachelMessage = { sender: "rachel", blobUrl: audio.src };
            messageArray.push(rachelMessage);
            setMessages(messageArray);

            // Play audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err) => {
            console.log(err.message);
            setIsLoading(false);
          });
      });
  };

  return (
    <div className="h-screen overflow-hidden controller">
      <Title setMessages={setMessages} />
      <div className="flex flex-col ustify-between h-full overflow-y-scroll pb-96">
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r element ">
          <div className="recorder">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
};

Title.propTypes = {
  setMessages: PropTypes.func,
};

RecordMessage.propTypes = {
  handleStop: PropTypes.func,
};

export default Controller;
