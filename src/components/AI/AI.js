import React, { useState, useEffect, useRef } from "react";
import { DOMAIN } from "../../constants";
import "./AI.css";
import MessageItem from "./MessageItem/MessageItem";

const AI = () => {
  const [messages, setMessages] = useState([
    {
      text: "זאת הודעה מהבינה מלאכותית",
      sender: "assistant",
      type: "regular",
      data: null,
    },
    { text: "זה הודעה מהמשתמש", sender: "user", type: "regular", data: null },
    //loading
    {
      text: "כאן אמור להיות טעינה",
      sender: "loading",
      type: "loading",
      data: null,
    },
    // operation
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "assistant",
      type: "operation",
      data: null,
    },
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "operation",
      type: "cartOperation",
      data: null,
      action: {
        barcode: "7290108350616",
        operationType: "delete",
        newQuantity: 0,
      },
    },
    {
      text: "הנה לך ההוצאות שלך לפי חודש",
      sender: "operation",
      type: "monthlyExpenses",
      data: {
        "2025-01": 89.3,
        "2025-02": 200.2,
        "2025-05": 1968.4,
        "2025-06": 1579.5,
      },
    },
  ]);
  const [textInput, setTextInput] = useState("");
  const messageEndRef = useRef(null); // Invisible element for auto-scrolling

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (
    text,
    sender,
    type = "regular",
    data = null,
    action = []
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text, sender, type, data, action },
    ]);
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
        `${DOMAIN}/api/v1/ai/ai-response-v4`,

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

      const aiResponse = jsonResponse.aiResponse || {};
      const messageToUser = aiResponse.messageToUser || "";
      const messageType = aiResponse.messageType || "regular";
      const action = aiResponse.actions || {};
      const data = aiResponse.data || {};

      // const text =
      //   jsonResponse.aiResponse?.messageToUser || "אין תשובה מהבינה המלאכותית";
      // const cartOperation =
      //   jsonResponse.aiUnderstanding?.aiResponse?.cartOperation || null;

      console.log("cartOperation", action);
      console.log("data", data);
      console.log("messageToUser", messageToUser);
      console.log("messageType", messageType);

      // sender - assistant if the type is regular
      // else - operation
      const sender = messageType === "regular" ? "assistant" : "operation";

      // 3. מוסיפים את הודעת העוזר (הבוט) שהתקבלה
      addMessage(messageToUser, sender, messageType, data, action);

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
            type={message.type}
            data={message.data} // Uncomment if you want to pass data to MessageItem
            action={message.action} // Uncomment if you want to pass action to MessageItem
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
