import { Button } from "@material-ui/core";
import React from "react";
import { auth, provider } from "./firebase";
import "./Login.css";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
function Login() {
	const [{ user }, dispatch] = useStateValue();
	const signIn = () => {
		auth
			.signInWithPopup(provider)
			.then((result) => {
				dispatch({
					type: actionTypes.SET_USER,
					user: result.user,
				});
			})
			.catch((error) => {
				alert(error.message);
			});
	};
	return (
		<div className="login">
			<div className="login__container">
				<img
					src="https://i.pinimg.com/originals/fb/1c/c9/fb1cc9560c5aa9c043f003cbdda4430e.png"
					alt=""
				/>
				<div className="login__text">
					<h1>Sign In to Whatsapp</h1>
				</div>
				<Button onClick={signIn}>Sign In with Google</Button>
			</div>
		</div>
	);
}

export default Login;
