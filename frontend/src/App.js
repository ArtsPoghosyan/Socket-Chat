import {useEffect, useState} from "react"
import io from "socket.io-client";
import Chat from './components/Chat';
const socket = io.connect("http://localhost:4000", {
  auth: getAuth()
});
function getAuth(){
  const name = localStorage.getItem("name");
  const id = localStorage.getItem("id");
  if(name && id){
    return {name, id};
  }else{
    return {};
  }
}

function App() {
  const [name, setName] = useState("");
  const [rooms, setRooms] = useState(false);
  const [oneChat, setOneChat] = useState(null);
  const [routing, setRouting] = useState("main");

  useEffect(()=>{
    socket.on("receive_chats", (data)=>{
      setRooms(data);
    });

    const userName = localStorage.getItem("name");
    if(userName){
      socket.emit("register");
      setRouting("chats");
    }
  }, []);

  return (
    <div className="App">
      {routing === "main" ? (
        <div className="mainDiv">
          <form onSubmit={(evt)=>{
            evt.preventDefault();
            register(name);
          }}>
            <input type="text" onChange={(evt)=>{setName(evt.target.value)}} placeholder="Name..."/>
            <button>Register</button>
          </form>
        </div>
        ) : routing === "chats" ? (
          <div className="chatsMainDiv">
            <div className="divCreateAndChatLists">
              <div className="divCreate">
                <h1>Create Chat</h1>
                <form onSubmit={(evt)=>{
                  evt.preventDefault();
                  socket.emit("create_chat", {name: evt.target[0].value, author: {name: localStorage.getItem("name"), id: localStorage.getItem("id")}});
                }}>
                  <input type="text" placeholder="Type Chat Name..."/>
                  <button>Create Chat</button>
                </form>
              </div>
              <div className="divChats">
                <h1>Chats</h1>
                <div className="divChatItems">
                  {rooms ? rooms.map((evt)=>{
                    return (
                      <div className="chatItem">
                        <div className="chatItemHeader">
                          <h1 onClick={()=>{
                            joinChat(evt);
                            setTimeout(()=>{
                              setRouting("one_chat");
                            }, 100);
                            setOneChat(evt);                   
                          }}>{evt.name}</h1>
                          <h5>Online - {evt.online}</h5>
                        </div>
                        <h4>already {evt.data.length} messages</h4>
                      </div>
                    )
                  }) : <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Chat socket={socket} room={oneChat}/>
        )}
    </div>
  );

  
  function register(name){
    const userId = Date.now();
    localStorage.setItem("name", name);
    localStorage.setItem("id", userId);
    setTimeout(()=>{
      setRouting("chats")
    }, 100);
    socket.emit("register");
    window.location.reload();
  }

  function joinChat(data){
    socket.emit("join_chat", {roomInfo: data});
    setRouting("one_chat");
  }
}

export default App;
