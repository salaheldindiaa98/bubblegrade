# Google Drive setup for BubbleGrade v10

Generate exam links from a website your colleagues can access, such as your public GitHub Pages installation. A publicly shared Drive file does not grant access to a private website.

The website works without Google Drive. Drive is optional and stores only an exam setup snapshot: answer sheet/calibration, answer key, points and an optional roster. Scanned photos, grades, attendance decisions and Google access tokens are excluded. Every instructor grades an independent browser-local copy. There is no shared grade database or automatic upload after a scan.

## Configure the website once

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project. Enable **Google Drive API** and **Google Picker API**.
2. Configure the Google Auth Platform consent screen (branding, audience and data access). Request only `https://www.googleapis.com/auth/drive.file`. This lets the app access files it creates or that an instructor explicitly chooses. It does not request access to the entire Drive. While the OAuth app is in Testing, add every instructor who will sign in as a test user. For wider use, follow Google's production publishing and consent requirements.
3. Create an OAuth client of type **Web application**. Add the exact website origin to **Authorized JavaScript origins**, for example:
   - `https://salaheldindiaa98.github.io`
   - If also using the private preview: `https://bubblegrade-lab.sara-diaa182.chatgpt.site`
   Do not include `/bubblegrade/`, a path, or a trailing slash. This uses the Google Identity Services token popup, so a redirect endpoint is not required.
4. Create a browser API key. Restrict it to the Google Drive API and Google Picker API, and restrict HTTP referrers to the website (for example `https://salaheldindiaa98.github.io/*`). Follow the current Google Picker instructions for the additional `https://docs.google.com/*` referrer if required by its iframe. Do not leave the key unrestricted.
5. Find the numeric **project number** in the project's information page. This is different from the project ID.
6. Put the three **public browser identifiers** in `drive-config.js`:

   ```js
   window.BUBBLEGRADE_DRIVE_CONFIG = {
     clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     apiKey: 'YOUR_BROWSER_API_KEY',
     appId: 'YOUR_NUMERIC_PROJECT_NUMBER'
   };
   ```

   Upload that file with the website. Never put a client secret, Google password, access token or service-account key here. The app needs none of these. Workspace options → Google Drive connection can override these values on a particular browser for testing, but a local override does not configure colleagues' browsers.
7. Open the deployed **HTTPS** website. Local HTML files cannot use the Google connection, and password encryption requires a secure browser context. Allow Google popups for this website if needed.

The release intentionally contains empty configuration values. Creating a Google Cloud project and supplying its identifiers is required before live Drive sign-in/sharing works. The app has no independent email/password account system; each instructor authorizes their own Google account when using Drive.

## Owner: share an exam

1. Open a quiz → **Quiz options → Share exam setup / Google Drive**.
2. Choose whether to include the roster. Use **Only invited Google accounts** or **Anyone with the link**. Invited accounts receive read-only access; the app does not send invitation emails. Workspace policies may prohibit external sharing.
3. Optionally encrypt the setup using a password of at least 8 characters. Send the password separately. It is not stored in the URL or remembered by the app. Without the password, an encrypted file cannot be recovered by BubbleGrade.
4. Choose **Save setup to Drive**, authorize your own account, and copy the resulting **exam link**. The file is saved in your normal Google Drive as `… .bubblegrade.json` (not the unshareable app-data folder).
5. To change a previously shared setup, open the same quiz and choose **Sync setup & get link**. Re-enter its password if encryption is enabled. This replaces that setup snapshot, not any colleague's local grades. Restricted sharing removes earlier public/group/domain access and invitations not listed in the form. Existing downloaded/imported copies cannot be revoked.

The file contains the answer key and, if included, names and IDs. An unencrypted Anyone-with-link file is readable by anyone holding its link. The password option encrypts the contents before upload. Drive sharing and encryption are separate controls.

## Colleague: grade independently

1. Open the owner's **BubbleGrade exam link** or use **Open shared exam**.
2. A public setup can load without Google sign-in. A restricted setup asks you to connect the invited account and select the exact shared `.bubblegrade.json` file in Google Picker. Selecting it once is needed for the limited `drive.file` permission. It may appear in Shared with me/search; a wrong file is rejected when opening a specific link.
3. Enter the exam password if protected. Review the setup and choose **Add to my quizzes**. Choose a lab/lecture and scan normally.
4. Your results, photos and attendance stay on your device. Export Excel or back up your workspace yourself. Signing into the same Google account does not synchronize grades across devices.
5. Reopening the same setup offers to keep an existing matching copy and its grades. A changed key/layout is imported as a separate copy. Opening a shared quiz does not give BubbleGrade permission to write grades into the owner's setup file.

You can also download a setup file and send it independently of Drive. The separate **Manual results exchange** option is an explicit file export/import action; it is never part of Drive setup sharing.

## Data and troubleshooting

- Tokens are held in page memory and discarded on disconnect/page close. A refresh may ask for authorization again. Disconnect does not delete a Drive file or revoke Google's previously granted consent; manage consent in your Google account if desired.
- Changing websites/origins does not move browser-local grades. Back up first and restore on the new origin.
- `origin_mismatch`: add the exact HTTPS origin to the OAuth web client. `access_denied`: check the selected account, OAuth test users, Drive file invitations and your institution's policies. API key errors: check both APIs and the key/referrer restrictions.
- If a Google popup was blocked while the Google script first loaded, allow popups and retry the explicit Save/Connect action. If an access token expires, reconnect; scores remain local.
- Test a share with a second instructor account before distributing it widely. Live Google OAuth/Picker requires your actual project configuration; automated checks use simulated API responses.

Primary reference: [Google Identity Services token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model), [Google Picker sample](https://developers.google.com/workspace/drive/picker/guides/web-picker-sample), [Drive uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [Drive resource keys](https://developers.google.com/workspace/drive/api/guides/resource-keys).
