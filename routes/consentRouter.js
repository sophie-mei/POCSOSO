import { Router } from "express";
import { createPublicKey, publicDecrypt, constants } from "crypto";
import request from "request";
const post = request.post;
import { readFileSync } from "fs";
import { getJwtToken } from "../utils/auth.js";
import { setVisionsUrl } from "../config/setup.js";
import { resolve } from "path";
const router = Router();

const VISIONS_URL = setVisionsUrl();

// SERVICE SOURCE A LA RECEPTION DU CONSENTEMENT DEPUIS VISIONS
// DOIT GENERER UN TOKEN D'ACCES
router.post("/export", async function (req, res) {
	console.log("\n----------- CONSENT EXPORT -----------\n");
	if (req.body.signedConsent) {
		const publicKeyFromFile = readFileSync(resolve(__dirname + "./../config/rsa-encrypt-public.pem"))
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
			console.log("Consent Export : Generating Access Token ...");
			const originalConsent = decryptedData;

			// Generate token
			let token = "";
			const possible =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < 50; i++) {
				token += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			const consentId = originalConsent.consentId;
			const serviceExportName = originalConsent.serviceExportName;

			// Send the token to visions
			post(
				{
					url: VISIONS_URL + "/consents/token",
					headers: {
						"x-auth-token": getJwtToken(
							process.env.SERVICE_KEY,
							process.env.SECRET_KEY
						),
					},
					form: {
						token: token,
						consentId: consentId,
						serviceExport: serviceExportName,
						// userId: req.body.userId,
					},
				},
				function (err, response, body) {
					if (!err) {
						body = JSON.parse(body);
						console.log(
							"Consent Export : LOGGING VISIONS RESPONSE TO /CONSENTS/TOKEN \n"
						);
						console.log(body);
						res.json(body);
					}
				}
			);
		} else {
			console.log("\n\nConsent Export : ERROR : Could not decrypt consent");
			res.json({ error: "Error when decrypting data" });
		}
	}
});

// SERVICE CONSOMMATEUR A LA RECEPTION DU CONSENTEMENT DEPUIS VISIONS
// DOIT FAIRE LA REQUETE DE DONNEES AU SERVICE SOURCE
router.post("/import", async function (req, res) {
	console.log("\n---------------- CONSENT IMPORT ------------\n");

	// Request body validation
	if (
		req.body.serviceExportUrl != undefined &&
		req.body.signedConsent != undefined
	) {
		const serviceExportUrl = req.body.serviceExportUrl;

		// Send request to the EXPORT SERVICE's data export endpoint
		post(
			{
				url: serviceExportUrl,
				form: {
					signedConsent: req.body.signedConsent,
					dataImportUrl: req.body.dataImportUrl,
				},
			},
			function (err, response, body) {
				// Do stuff in the request callback if you wish
			}
		);

		console.log(
			"Consent Import : Sent Data Export Request To : " + serviceExportUrl
		);

		return res.status(200).json({
			success: true,
			message: "Data export request successfully sent to the export service.",
		});
	} else {
		res
			.status(400)
			.json({
				error: "missing-body-param-error",
				message: "Missing parameters from the request body.",
			});
	}
});

export default router;
