import React, { useState, useEffect, useRef } from "react";
import { DOMAIN } from "../../constants";
import "./AI.css";
import MessageItem from "./MessageItem/MessageItem";

const AI = () => {
  const [messages, setMessages] = useState([
    { text: "זאת הודעה מהבינה מלאכותית", sender: "assistant" },
    { text: "זה הודעה מהמשתמש", sender: "user" },
    //loading
    { text: "כאן אמור להיות טעינה", sender: "loading" },
    // operation
    { text: "הנה לך ההוצאות שלך לפי חודש", sender: "assistant" },
    { text: "הנה לך ההוצאות שלך לפי חודש", sender: "operation" },
  ]);
  const [textInput, setTextInput] = useState("");
  const messageEndRef = useRef(null); // Invisible element for auto-scrolling

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (text, sender) => {
    setMessages((prevMessages) => [...prevMessages, { text, sender }]);
  };

  // const playResponse = (route) => {
  //   const url = `${DOMAIN}/${route}`;
  //   const audio = new Audio(url);
  //   audio.play();
  // };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    // אם השדה ריק/רק רווחים - לא עושים כלום
    if (!textInput.trim()) return;

    // 1. מוסיפים מייד את הודעת המשתמש ל־messages
    const userText = textInput;
    addMessage(userText, "user");
    setTextInput("");

    // 2. שולחים בקשה לשרת כדי לקבל תשובה
    try {
      const response = await fetch(
        // `${DOMAIN}/api/v1/voice-assistant/user-text`,
        `${DOMAIN}/api/v1/ai/ai-response-v3`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: userText }),
        }
      );

      // const { text, route } = await response.json();
      const jsonResponse = await response.json();

      const text =
        jsonResponse.aiUnderstanding?.aiResponse?.messageToUser ||
        "אין תשובה מהבינה המלאכותית";
      const cartOperation =
        jsonResponse.aiUnderstanding?.aiResponse?.cartOperation || null;

      console.log("cartOperation", cartOperation);

      // 3. מוסיפים את הודעת העוזר (הבוט) שהתקבלה
      addMessage(text, "assistant");

      // 4. מפעילים אודיו אם קיים
      // if (route) {
      //   playResponse(route);
      // }
    } catch (error) {
      console.error("Error:", error);
      // אפשר להוסיף הודעת שגיאה ל־messages וכו'
    }
  };

  const handleReset = async () => {
    // post to `${DOMAIN}/api/v1/ai/reset`,
    // and clean all the messages aftet the 4th message
    setMessages((prevMessages) => prevMessages.slice(0, 4));
    setTextInput("");

    const url = `${DOMAIN}/api/v1/ai/reset`;

    // fetching:
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <div className="ai-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message.text}
            sender={message.sender}
            // type={message.type}
          />
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="user-text-box">
        <form onSubmit={handleOnSubmit}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="...הקלד הודעה"
            dir="auto" // הדפדפן יקבע את כיוון הטקסט בהתאם לתווים הראשונים
          />
          <button type="submit">שלח</button>
          <button type="button" onClick={handleReset}>
            אפס
          </button>
        </form>
      </div>
    </div>
  );
};

export default AI;
