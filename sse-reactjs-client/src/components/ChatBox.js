import React, { useState } from "react";

import SendIcon from "../paper-plane.svg";

const ChatBox = (props) => {
  const { divRef, messages, user, chatUser } = props;
  const [messageInputValue, setMessageInputValue] = useState("");

  const handleChange = (event) => {
    setMessageInputValue(event.target.value);
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (messageInputValue && messageInputValue.trim() !== "") {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: chatUser,
          to: user,
          message: messageInputValue.trim(),
        }),
      };

      const response = await fetch(
        `http://192.168.1.68:8080/sse-server/user/message`,
        requestOptions
      );

      if (response.status === 200) {
        setMessageInputValue("");
      }
    }
  };

  return (
    <div className="card">
      <div>Chat with {chatUser}</div>
      <div className="message-area-maindiv">
        <div className="message-area" ref={divRef} id="style-3">
          <div className="message-sender">
            {messages
              ? messages.map((message, index) =>
                  message.to &&
                  message.from === user &&
                  message.to === chatUser ? (
                    <div key={index} className="message-item-owner">
                      <span>{message.message}</span>
                      <br />
                    </div>
                  ) : message.from === chatUser ? (
                    <div key={index} className="message-item-sender">
                      <span>{message.message}</span>
                      <br />
                    </div>
                  ) : (
                    ""
                  )
                )
              : ""}
          </div>
        </div>
      </div>
      <form onSubmit={sendMessage}>
        <div class="input-group">
          <label>
            <input
              type="text"
              className="message-input"
              placeholder="Message"
              value={messageInputValue}
              onChange={handleChange}
            />
          </label>
          <button class="unit" type="submit">
            <img className="icon" src={SendIcon} alt="Send Message Icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
