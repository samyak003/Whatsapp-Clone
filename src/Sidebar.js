import React, { useEffect, useState } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import "./Sidebar.css";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import MenuIcon from "@material-ui/icons/Menu";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import db from "./firebase";
import { useStateValue } from "./StateProvider";

function Sidebar() {
	const [{ user }, dispatch] = useStateValue();

	const [rooms, setRooms] = useState([]);
	useEffect(() => {
		const unsubscribe = db.collection("rooms").onSnapshot((snapshot) =>
			setRooms(
				snapshot.docs.map((doc) => ({
					id: doc.id,
					data: doc.data(),
				})),
			),
		);

		return () => {
			unsubscribe();
		};
	}, []);
	return (
		<div className="sidebar">
			<div className="sidebar__header">
				<div className="sidebar__headerLeft">
					<IconButton
						onClick={() => {
							document.querySelector(".sidebar").classList.toggle("open");
						}}
						className="chat__headerMenuBtn"
					>
						<MenuIcon />
					</IconButton>
					<Avatar src={user?.photoURL} />
				</div>
				<div className="sidebar__headerRight">
					<IconButton>
						<DonutLargeIcon />
					</IconButton>
					<IconButton>
						<ChatIcon />
					</IconButton>
					<IconButton>
						<MoreVertIcon />
					</IconButton>
				</div>
			</div>
			<div className="sidebar__search">
				<div className="sidebar__searchContainer">
					<SearchOutlined />
					<input placeholder="Search or start a new chat" />
				</div>
			</div>
			<div className="sidebar__chats">
				<SidebarChat addNewChat />
				{rooms.map((room) => (
					<SidebarChat
						key={room.id}
						id={room.id}
						name={room.data.name}
					></SidebarChat>
				))}
			</div>
		</div>
	);
}

export default Sidebar;
