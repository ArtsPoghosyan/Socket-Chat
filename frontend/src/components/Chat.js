import React, {useEffect, useState} from "react";
const myId = localStorage.getItem("id");

function Chat({socket, room}){
    const [message, setMessage] = useState("");
    const [arrayMessages, setArrayMessages] = useState(false);
    const [writed, setWrited] = useState([]);
    let id;

    useEffect(()=>{
        setTimeout(()=>{
            setArrayMessages(room.data);
            let x = document.getElementsByClassName("chat-history")[0]
            x.scrollTo({top: x.scrollHeight, left: "0"});
        }, 500);
    }, []);

    useEffect(()=>{
        socket.on("receive_message", (data)=>{
            setArrayMessages(data.data);
        });
        socket.on("writed_loader_active", (data)=>{
            setWrited((l)=>{
                if(!l.some((evt)=>evt === data)){
                    let x = [...l, data]
                    return x;
                }else{
                    return [...l];
                }
            });
        });
        socket.on("writed_loader_deactive", (data)=>{
            setWrited((l)=>l.filter((evt)=>evt !== data));
        });
        socket.emit("receive_messages", {roomInfo: room});
    }, [])

    function addMessage(message){
        if(message){
            const messageData = {
                idRoom: room.idRoom,
                author: {}, 
                message,
                date: new Date(Date.now()).getHours() + ":" +new Date(Date.now()).getMinutes()
            }
            socket.emit("send_message", messageData);
            setMessage("");
        }else{
            alert("Write Your Message");
        }
    }

    return (
        arrayMessages ? <div class="container clearfix">  
        <div class="chat">
            <div class="chat-header clearfix">
                <div class="chat-about">
                    <div class="chat-with">Chat - {room.name}</div>
                    <div class="chat-num-messages">already {arrayMessages.length} messages</div>
                </div>
            </div> 
            
            <div class="chat-history">
                <ul style={{listStyle: "none", paddingInlineStart: "0px"}}>   
                {arrayMessages.map((evt)=>{
                    return (
                        <li style={{marginBottom: "25px"}} className={myId === evt.author.id ? "clearfix" : ""}>
                            <div className={myId === evt.author.id ? "message-data align-right" : "message-data"} >
                                <span class="message-data-name">{evt.author.name}</span>
                                <span class="message-data-time">{evt.date}</span>
                            </div>
                            <div className={myId === evt.author.id ? "message other-message float-right" : "message my-message"}>{evt.message}</div>
                        </li>
                    )
                })}
                {writed.length !== 0 ? (
                    <div style={{marginBottom: "25px"}} className="loaderDiv">
                        {writed.map((evt, i)=> (writed.length - 1) === i ? evt + " " : evt + ", ")} <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                    </div>
                ) : (
                    ""
                )} 
                </ul>
            </div> 
            <div class="chat-message clearfix">
                <form onSubmit={(evt)=>{
                    evt.preventDefault();
                    setTimeout(()=>{
                        let x = document.getElementsByClassName("chat-history")[0]
                        x.scrollTo({top: x.scrollHeight, left: "0"});
                    }, 100);
                    addMessage(message); 
                }}>
                    <textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="3" onChange={(evt)=>{
                        if(id){
                            clearTimeout(id);
                        }
                        setTimeout(()=>{
                            socket.emit("unwrited_message", {roomInfo: room})
                        }, 3000);
                        socket.emit("writed_message", {roomInfo: room})
                        setMessage(evt.target.value);
                        }} value={message} />   
                    <button>Send Message</button>
                </form>
            </div>          
        </div> 
    </div> : <div className="mainDiv"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div> 
    )
}

export default Chat;