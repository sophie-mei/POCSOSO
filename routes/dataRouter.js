import { Router } from "express";
import { createPublicKey, publicDecrypt, constants } from "crypto";
import request from "request";
const post = request.post;
import { readFileSync } from "fs";
import { getJwtToken } from "../utils/auth.js";
import { getDataFromDatatypes } from "../utils/dataFromDataTypes.js";
import { setVisionsUrl } from "../config/setup.js";
const router = Router();

const VISIONS_URL = setVisionsUrl();

// SERVICE SOURCE A L'EXPORT DE DONNEES
router.post("/export", async function (req, res) {
	console.log("\n----------- DATA EXPORT -----------\n");

	const publicKeyFromFile = readFileSync("./config/rsa-encrypt-public.pem")
		.toString();

	const publicKey = createPublicKey(publicKeyFromFile);

	let decryptedData = publicDecrypt(
		{
			key: publicKey,
			// In order to decrypt the data, we need to specify the
			// same hashing function and padding scheme that we used to
			// encrypt the data in the previous step
			padding: constants.RSA_PKCS1_PADDING,
			// oaepHash: "sha256",
		},
		Buffer.from(req.body.signedConsent, "base64")
	);

	decryptedData = JSON.parse(decryptedData.toString());

	if (decryptedData) {
		console.log("Data Export : Decrypted Signed Consent");

		// Decode consent

		const consentId = decryptedData.consentId;
		const token = decryptedData.token;
		const serviceName = decryptedData.serviceExportName;

		const userId = decryptedData.userExportId;

		post(
			{
				url: VISIONS_URL + "/consents/verify/",
				headers: {
					"x-auth-token": getJwtToken(
						process.env.SERVICE_KEY,
						process.env.SECRET_KEY
					),
				},
				form: {
					consentId: consentId,
					token,
				},
			},
			function (err, response, body) {
				if (!err) {
					body = JSON.parse(body);
					if (body.success === true) {
						if (body.datatypes.length === 0) {
							return res.json({
								error: body,
								success: false,
							});
						}
						// Obtenir datatypes de service
						getDataFromDatatypes(body.datatypes, userId).then((data) => {
							// return res.json(data);
							post(
								{
									url: req.body.dataImportUrl,
									form: {
										success: true,
										data: data,
										user: body.userImport.userServiceId,
										service: serviceName,
									},
								},
								function (error, response1, body1) {
									if (!error) {
										body1 = JSON.parse(body1);
										res.json({
											success: true,
											message: "Data has been imported",
											// id: body1.id,
										});
									}
								}
							);
						});

						//envoye les données au service d'importation
					} else {
						res.json({
							error: body.message,
							success: false,
						});
					}
				} else {
					console.log("Error");
					res.json(err);
				}
			}
		);
	} else {
		res.statusMessage("Consent verification failed");
	}
});

// SERVICE CONSOMMATEUR A LA RECEPTION DES DONNEES
router.post("/import", async (req, res) => {
	console.log("\n---------------- DATA IMPORT ------------\n");

	let data = req.body.data;

	res.json({ data: req.body});
});

export default router;