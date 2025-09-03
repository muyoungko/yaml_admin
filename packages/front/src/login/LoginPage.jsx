import React, { useEffect, useRef } from 'react';
import {
	useLogin,
	useNotify
} from 'react-admin';

import {
	Box,
	Typography
} from '@mui/material';
import client from '../common/axios.jsx';

const LoginPage = ({ theme }) => {
	const login = useLogin();
	const divRef = useRef(null);

	const [loading, setLoading] = React.useState(false)
	const [email, setEmail] = React.useState('')
	const [password, setPassword] = React.useState('')

	useEffect(() => {

	}, [])

	useEffect(() => {
		if (divRef.current && window.google) {
			window.google.accounts.id.initialize({
				client_id: '886217236574-52ccfmm2nj12dc63lcfb0ksms2akkimm.apps.googleusercontent.com',
				context:'signin',
				itp_support: true,
				ux_mode: "redirect",
				login_uri:`${api_host}/google/login/callback`,
				callback: (res, error) => {
					// This is the function that will be executed once the authentication with google is finished
				},
			});
			window.google.accounts.id.renderButton(divRef.current, {
				// theme: 'filled_blue',
				// size: 'medium',
				// type: 'standard',
				// text: 'continue_with',
			});
		}
	}, [divRef.current, window.google]);

	const handleSubmit = e => {
		e.preventDefault();
	}

	const handleLogin = (e) => {
		setLoading(true)
		client.request_post('/member/login', {
			type: 'force',
			email: email,
			pass: password,
		}).then((res) => {
			setLoading(false)
			if (res && res.r) {
				localStorage.setItem('token', res.token);
				window.location.href = '/'
			} else if (res) {
				alert(res.msg)
			}
		})
	}

	return (
		<Box>
			<form onSubmit={handleSubmit}>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					minHeight="100vh"
				>
					<Box>
						<Box>
							<img
								width='200'
								height='200'
								alt='testA' />
						</Box>
						<Box mt={2}>
							<Typography variant="h4" gutterBottom>
								Devil App Builder
							</Typography>
						</Box>
						<Box>
							<Typography variant="subtitle1" gutterBottom>
								Build your app by yourself
							</Typography>
						</Box>
						{/* <Box mt={2}>
							<TextField
								fullWidth
								variant="filled"
								label="Google Email"
								onChange={(e) => {setEmail(e.target.value)}}
								defaultValue=""
							/>
						</Box>
						<Box>
							<TextField
								fullWidth
								variant="filled"
								label="Password"
								type="password"
								onChange={(e) => {setPassword(e.target.value)}}
								autoComplete="current-password"
							/>
						</Box>
						<Box mt={1} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
							<Box>
								<Button 
									disabled={loading}
									startIcon={loading && <CircularProgress color="success" size={24} />} 
									onClick={handleLogin}
									sx={{ width: '280px' }} variant="contained">Sign In</Button>
							</Box>
							<Box ml={1}>
								<Button 
									onClick={handleJoin}
									variant="outlined">Sign Up</Button>
							</Box>
						</Box> */}
						<Box>
							<div ref={divRef} />
							{/* <div id="g_id_onload"
								
								data-client_id="886217236574-52ccfmm2nj12dc63lcfb0ksms2akkimm.apps.googleusercontent.com"
								data-context="signin"
								data-ux_mode="redirect"
								data-login_uri={`${api_host}/google/login/callback`}
								data-itp_support="true">
							</div>

							<div class="g_id_signin"
								data-type="standard"
								data-shape="pill"
								data-theme="filled_black"
								data-text="signin_with"
								data-size="large"
								data-logo_alignment="left">
							</div> */}
						</Box>
					</Box>

				</Box>
			</form>
		</Box>
	);

};

export default LoginPage;
