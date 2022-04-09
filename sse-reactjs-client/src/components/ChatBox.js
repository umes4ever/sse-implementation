import React, { useState } from "react";

import SendIcon from "../paper-plane.svg";

const serverURL = process.env.REACT_APP_SERVER_URL;

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
        `${serverURL}/sse-server/user/message`,
        requestOptions
      );

      if (response.status === 200) {
        setMessageInputValue("");
      }
    }
  };

  return (
    <div className="card">
      <div className="card-title">Chat with <b>{chatUser}</b></div>
      <div className="message-area-maindiv">
        <div className="message-area" ref={divRef} id="scroll-style">
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
      <form className="send-message-form" onSubmit={sendMessage}>
        <div className="input-group">
          <label>
            <input
              type="text"
              className="message-input"
              placeholder="Message"
              value={messageInputValue}
              onChange={handleChange}
            />
          </label>
          <button className="unit" type="submit">
            <img className="icon" src={SendIcon} alt="Send Message Icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
