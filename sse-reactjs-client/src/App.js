import { useEffect, useRef, useState } from "react";
import "./App.css";

import ChatBox from "./components/ChatBox";

function App() {
  const [user, setUser] = useState("");
  const [nameInputValue, setNameInputValue] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState();
  const [users, setUsers] = useState();

  const divRef = useRef(null);

  useEffect(() => {
    const sseForLastMessage = new EventSource(
      `http://192.168.1.68:8080/sse-server/user/messages?name=${user}`,
      {
        withCredentials: true,
      }
    );

    const sseForAllMessages = new EventSource(
      `http://192.168.1.68:8080/sse-server/user/messages/all?name=${user}`,
      {
        withCredentials: true,
      }
    );

    const sseForUsers = new EventSource(
      `http://192.168.1.68:8080/sse-server/users?name=${user}`,
      {
        withCredentials: true,
      }
    );

    sseForLastMessage.onopen = (e) => {
      console.log("SSE For LastMessage Connected !");
    };

    sseForAllMessages.onopen = (e) => {
      console.log("SSE For AllMessages Connected !");
    };

    sseForUsers.onopen = (e) => {
      console.log("SSE 3 Connected !");
    };

    sseForLastMessage.addEventListener("last-message-event", (event) => {
      let jsonData = JSON.parse(event.data);

      if (JSON.stringify(jsonData) !== JSON.stringify(newMessage)) {
        setNewMessage(jsonData);
        setTimeout(scrollToBottom, 1000);
      }
    });

    sseForAllMessages.addEventListener("all-message-event", (event) => {
      let jsonData = JSON.parse(event.data);
      setMessages(jsonData);
    });

    sseForUsers.addEventListener("user-list-event", (event) => {
      let jsonData = JSON.parse(event.data);
      setUsers(jsonData);
    });

    sseForLastMessage.onerror = (error) => {
      console.log("SSE For LastMessage Error", error);
      sseForLastMessage.close();
    };

    sseForAllMessages.onerror = (error) => {
      console.log("SSE For AllMessages Error", error);
      sseForAllMessages.close();
    };

    sseForUsers.onerror = (error) => {
      console.log("SSE For Users error", error);
      sseForUsers.close();
    };

    return () => {
      sseForLastMessage.close();
      sseForAllMessages.close();
      sseForUsers.close();
    };
  }, [user, newMessage]);

  const scrollToBottom = () => {
    const scroll = divRef.current.scrollHeight - divRef.current.clientHeight;
    divRef.current.scrollTo(0, scroll);
  };

  const handleChange = (event) => {
    setNameInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (nameInputValue && nameInputValue.trim() !== "") {
      const requestOptions = {
        method: "POST",
      };

      const response = await fetch(
        `http://192.168.1.68:8080/sse-server/user?name=${nameInputValue}`,
        requestOptions
      );

      if (response.status === 200) {
        setUser(nameInputValue.trim());
        setNewMessage("");
      }
    }
  };

  return (
    <div className="App">
      {user ? (
        <div className="entered-name-div">
          Your name: <b>{user}</b>
        </div>
      ) : (
        <div className="name-form-div">
          <form className="form" onSubmit={handleSubmit}>
            <div className="segment">
              <h1>Let's get started !</h1>
            </div>
            <label>
              <input
                type="text"
                placeholder="Name"
                value={nameInputValue}
                onChange={handleChange}
              />
            </label>
            <button className="submit-name" type="submit">
              OK
            </button>
          </form>
        </div>
      )}

      {user && users && users.length > 0 ? (
        <div className="chat-boxes">
          {users.map((chatUser, index) => (
            <ChatBox
              key={index}
              divRef={divRef}
              messages={messages}
              user={user}
              chatUser={chatUser}
            />
          ))}
        </div>
      ) : user ? (
        <div className="empty-div">
          <div className="segment">
            <h1>No one to chat with right now !</h1>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
