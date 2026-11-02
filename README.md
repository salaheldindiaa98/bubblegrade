# BubbleGrade v10

Free, browser-local optical mark grading. The production website is buildless HTML/CSS/JavaScript at the repository root. It runs on HTTPS static hosting, including GitHub Pages. Camera grading and Excel export need no paid API or shared database. Google Drive setup sharing is optional.

## Current workflow

The three main sections are **Quizzes, Students and Results**. Open a quiz to edit its key, customize its sheet, or start a scan. Students and results always show the quiz selected in the breadcrumb picker.

1. **Set up a sheet.** Generate 1–100 questions with 3–5 choices, A4/A5/Embedded format, title, label, version, selected student fields, instructions and an optional PNG/JPEG logo. Preview before choosing **Use this layout**. The printed image and calibration come from the same geometry. Print the selected version and check the answer key. Existing calibrated sheets and quizzes with saved grades are protected; create a printable copy to change geometry.
2. **Use an existing sheet.** Customize → Use an existing printed sheet. Import PNG/JPEG or page 1 of a PDF, confirm four reference-square centers clockwise, and map each bubble block. A ZipGrade custom-form code alone is insufficient. Existing v9 custom calibration, baseline data and blue-ink reading behavior are retained.
3. **Set the key and points.** One correct answer per question. An incomplete key blocks grading/export.
4. **Add students.** Import XLSX/CSV/TSV; map Serial, ID, Name, Lab and optional Lecture. Serial numbers are unique across a quiz. Filter a lab in Students to mark absences. Handwritten/bubbled student IDs are not read automatically.
5. **Choose a grading session.** Select all students, a lab, or a lecture; select queue, a specific student/rescan, or anonymous validation. The full-screen camera shows name, serial and ID before capture. Change by serial/ID/name before placing a paper. Previous/Next lets you navigate the group; absence, rescan, pause, view-fit and other controls live in Scan settings.
6. **Scan.** Auto capture accepts four aligned squares after two consistent frames. Large visible corner targets define the full acceptance windows. Full frame is the default and does not apply software cropping. Fill screen is an explicit setting; hardware lens behavior depends on the phone. Remove each paper before the next. Existing grades remain protected unless rescan is explicitly enabled; replacement is saved atomically.
7. **See the grade.** Scan settings → Show grade after each scan is on by default. A saved grade card waits for Continue/Next; it shows provisional status and opens flagged answers. Resolving a flag updates the displayed score. Review-each mode opens the full review directly. Turning the grade option off allows continuous grading without score cards. Auto-next still requires paper removal. Uploaded papers can also pause on their score/review.
8. **Review and export.** Choose the intended answer for multiple marks; assign an answer, no credit, or group credit for blanks; review faint marks. Results can filter papers needing review. Export Excel with one student row, lab sheets, question decisions and provisional status. Export again after changing a score; downloaded workbooks are not modified in place.

Anonymous tests use only transient memory, never the gradebook/photo database, backups or exports. A scan can be reviewed or re-read from its stored original. Results → Re-read saved photos previews repairs and preserves original records on failed saves, unavailable photos or stale previews.

## Google Drive: independent exam sharing

See [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md) for the one-time Google Cloud configuration and exact workflow. `drive-config.js` deliberately has empty public identifiers; live sign-in requires your Web OAuth client ID, restricted browser API key and project number. No client secret belongs in the website.

The owner explicitly uploads only the sheet/calibration, answer key, points and optional roster. Share with invited Google accounts or anyone with the link, optionally with password encryption. Colleagues import independent copies; their grades, attendance and paper photos stay on their own device and never sync back. Existing matching copies retain grades; changed keys/layouts create separate copies. Setup sync is manual. Google accounts provide authorization for Drive; there is no separate BubbleGrade password/account database.

Use a website that colleagues can access, such as the public GitHub Pages installation, when generating exam links. A public Drive file does not change a private website's access controls. Optional manual result exchange remains a separate, explicit export/import action.

## Storage and updating

The existing localStorage key `bubblegrade.v1` and IndexedDB `bubblegrade-photos` are retained. Metadata, grades and paper photos are specific to this browser and website origin. Back up the workspace before updating and periodically while grading. Clearing site data can delete local records. Signing into Google does not back up grades. Moving between Sites and GitHub Pages requires explicit backup/restore.

For GitHub Pages, use the complete release ZIP, whose assets are flattened to the repository root. Upload **all its contents** into the root of the existing repository, replacing same-named files in one commit. Do not delete the old files first. Enable Settings → Pages → Deploy from branch → main → /(root), then wait for deployment and refresh. The release retains compatible old file names and includes every new dependency. Never upload classroom backups, rosters, scans, answer keys or result packets to the public source repository.

## Validation

Run each `tests/*.test.cjs` with Node. Image regression tests use Sharp from `CODEX_PRIMARY_RUNTIME_NODE_MODULES`; optical/browser code itself has no Node dependency.

Checks cover optical detection and scoring, blue ink/background mapping, barcode distractors, projective distortion, reread decisions/blank credits, failed-save rollback, camera geometry and motion, group navigation, anonymous no-save, grade feedback, Excel and gradebook logic. `sheet-layout.test.cjs` renders and scans 45 layout combinations; `drive-sharing.test.cjs` checks setup-only packets, independent copies, AES-GCM/PBKDF2 passwords, resource keys, ownership and reader-only access with mocked HTTP. Browser QA runs the real app with a synthetic camera and dummy identities: known-answer capture, corrected score feedback, three-section navigation, sheet preview/apply and setup-only import.

Live Google OAuth/Picker needs the owner's actual configuration and a second-account test. Camera speed/lens/focus behavior needs testing on physical phones and paper; synthetic checks are not a ZipGrade speed benchmark. Glare, severe curl, low resolution or blur may need recapture/manual decisions.

JavaScript dependencies are bundled locally with licenses alongside the website. PDF import uses PDF.js. BubbleGrade is independent of ZipGrade and is not affiliated with its owner.
