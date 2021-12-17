export const generateToken = (length = 50) => {
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let token = "";
	for (var i = 0; i < length; i++)
		token += possible.charAt(Math.floor(Math.random() * possible.length));
	return token;
};
