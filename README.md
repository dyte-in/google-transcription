# Dyte's Google STT Transcription Package

This package provides plug and play transcriptions.

# Prerequisites

This package uses Google transcriptions and translations which are paid services from Google.

Therefore, You must have an service account in GCP (Google Cloud Platform) account with a project configured that allows Google Media Translations and Google Translations API.

Once done, download the keys for the service account.

It would look like:

```json
{
  "type": "service_account",
  "project_id": "YOUR_GCP_PROJECT_ID",
  "private_key_id": "YOUR_GCP_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE SOMETHING SOMETHING-----END PRIVATE KEY-----\n",
  "client_email": "xxxxxx@yyyyyy.iam.gserviceaccount.com",
  "client_id": "YOUR_GCP_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/xxxxx%40yyyyy.iam.gserviceaccount.com"
}

```

<b>Note:</b> Without having this, it would not be feasible to use with package.


# How to use

1. Go to server folder
```sh
cd server
```
2. Replicate .env.example as .env
```sh
cp .env.example .env
```

Open the .env in your choice of Text File Editor and Edit it and Save it.

<b>Note:</b> PRIVATE_KEY should be in a single line. Try picking value from the service account's key's json file as is.

3. Install packages
```sh
npm install
```
4. Run the server
```sh
npm run dev
```

If sucessful, you would see the confirmation in Terminal that it is running on localhost:3001 or the PORT specified in the .env file.

5. In a new terminal, go to the client folder from root of this repository

```sh
cd client
```

6. Install packages
```sh
npm install
```

7. Replicate .env.example as .env
```sh
cp .env.example .env
```
Modify port, if needed.

8. Run the client
```sh
npm run dev
```

9. Now go to browser and open localhost:3000 (Change this, if you have modified port in .env of client)

You would see the Dyte meeting loading on this page.

Turn the Mic on and Start Speaking and you should ideally start seeing transcriptions right away.

10. Go through the client/demo/index.ts & server folder and take what is needed to integrate it in your product.

<b>Note:</b> Though this package takes the complexity away from you, We recommend that you put your own security practices & robustness around it and not treat these samples as production-grade copy-paste solutions.

