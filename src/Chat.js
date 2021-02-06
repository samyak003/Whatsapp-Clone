import React, { useState, useEffect } from "react";
import { Avatar, Icon, IconButton } from "@material-ui/core";
import "./Chat.css";
import { AttachFile, InsertEmoticon, SearchOutlined } from "@material-ui/icons";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MicIcon from "@material-ui/icons/Mic";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import DeleteIcon from "@material-ui/icons/Delete";
import { useParams, useHistory } from "react-router-dom";
import db from "./firebase";
import { actionTypes } from "./reducer";
import MenuIcon from "@material-ui/icons/Menu";
import { useStateValue } from "./StateProvider";
import firebase from "firebase";
function Chat() {
	const history = useHistory();
	const [{ user }, dispatch] = useStateValue();
	const [input, setInput] = useState("");
	const [seed, setSeed] = useState("");
	const { roomId } = useParams();
	const [roomName, setRoomName] = useState("");
	const [roomUid, setRoomUid] = useState("");
	const [messages, setMessages] = useState([]);
	const [anchorElChat, setAnchorElChat] = useState(null);

	useEffect(() => {
		setSeed(Math.floor(Math.random() * 5000));
	}, []);
	useEffect(
		() =>
			document
				.querySelector(".chat__body")
				.scrollBy(0, document.querySelector(".chat__body").scrollHeight),
		[messages],
	);
	useEffect(() => {
		if (roomId) {
			db.collection("rooms")
				.doc(roomId)
				.onSnapshot((snapshot) => {
					setRoomName(snapshot.data()?.name);
					setRoomUid(snapshot.data()?.uid);
				});
			db.collection("rooms")
				.doc(roomId)
				.collection("messages")
				.orderBy("timestamp", "asc")
				.onSnapshot((snapshot) =>
					setMessages(
						snapshot.docs.map((doc) => ({ id: doc.id, message: doc.data() })),
					),
				);
		}
	}, [roomId]);

	const sendMessage = (e) => {
		e.preventDefault();
		db.collection("rooms").doc(roomId).collection("messages").add({
			message: input,
			name: user.displayName,
			uid: user.uid,
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
		});
		setInput("");
	};
	return (
		<div className="chat">
			<div className="chat__header">
				<IconButton
					onClick={() => {
						document.querySelector(".sidebar").classList.toggle("open");
					}}
					className="chat__headerMenuBtn"
				>
					<MenuIcon />
				</IconButton>
				<Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
				<div className="chat__headerInfo">
					<h3>{roomName ? roomName : user?.displayName}</h3>
					{messages.length > 0 && (
						<p>
							last seen{" "}
							{new Date(
								messages[messages.length - 1]?.message.timestamp?.toDate(),
							).toUTCString()}
						</p>
					)}
				</div>
				<div className="chat__headerRight">
					<IconButton>
						<SearchOutlined />
					</IconButton>
					<IconButton
						disabled={!roomId}
						onClick={(event) => setAnchorElChat(event.currentTarget)}
					>
						<MoreVertIcon aria-controls="chat-menu" aria-haspopup="true" />
					</IconButton>
				</div>
			</div>
			<Menu
				id="chat-menu"
				anchorEl={anchorElChat}
				keepMounted
				open={Boolean(anchorElChat)}
				onClose={() => setAnchorElChat(null)}
			>
				<MenuItem
					onClick={() => {
						dispatch({
							type: actionTypes.SET_USER,
							user: null,
						});
					}}
				>
					Logout
				</MenuItem>
				{roomUid === user?.uid && (
					<MenuItem
						onClick={() => {
							db.collection("rooms")
								.doc(roomId)
								.delete()
								.then(() => {
									history.replace("/");
									setAnchorElChat(null);
								});
						}}
					>
						Delete room
					</MenuItem>
				)}
				<MenuItem
					onClick={() => {
						db.collection("rooms")
							.doc(roomId)
							.collection("messages")
							.get()
							.then((collection) =>
								collection.docs.map((doc) =>
									db
										.collection("rooms")
										.doc(roomId)
										.collection("messages")
										.doc(doc.id)
										.delete(),
								),
							);
						setAnchorElChat(null);
					}}
				>
					Clear Chat
				</MenuItem>
			</Menu>
			<div className="chat__body">
				{!roomName && (
					<div className="chat__error">
						<h1>Select or add a chat</h1>
					</div>
				)}
				{messages.length <= 0 && roomName && (
					<div className="chat__error">
						<h1>No messages yet</h1>
					</div>
				)}
				{messages.map(({ message, id }) => (
					<span className="" key={id}>
						<p
							className={`chat__message ${
								message.uid === user.uid && "chat__reciever"
							}`}
						>
							<span className="chat__name">{message.name}</span>
							{message.message}

							<span className="chat__timestamp">
								{new Date(message.timestamp?.toDate()).toUTCString()}
							</span>
							{message.uid === user.uid && (
								<IconButton className="chat__messageOptionBtn">
									<DeleteIcon
										onClick={() => {
											db.collection("rooms")
												.doc(roomId)
												.collection("messages")
												.doc(id)
												.delete();
										}}
									/>
								</IconButton>
							)}
						</p>
					</span>
				))}
			</div>
			<div className="chat__footer">
				<IconButton>
					<InsertEmoticon />
				</IconButton>
				<form>
					<input
						type="text"
						placeholder="Type a message"
						value={input}
						maxLength="70"
						onChange={(e) => {
							setInput(e.target.value);
						}}
						disabled={!user || !roomName}
					/>
					<button
						disabled={!user || !roomName}
						type="Submit"
						onClick={sendMessage}
					>
						Send a message
					</button>
				</form>
				<IconButton>
					<AttachFile />
				</IconButton>
				<IconButton>
					<MicIcon />
				</IconButton>
			</div>
		</div>
	);
}

export default Chat;
