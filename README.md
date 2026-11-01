# BubbleGrade — GitHub Pages edition v9

Upload all 17 extracted files to your existing repository root, replacing matching filenames. No deletion first. Commit, wait for GitHub Pages deployment, close the old scanner tab and reopen the same HTTPS site. Check LIVE SCAN · v9. Do not clear browser data: the same storage keys retain your quizzes, calibrated layouts, rosters, absences, photos and scores.

For a new installation: Settings → Pages → Deploy from a branch → main → /(root). No database, API key, paid service or npm build is needed.

## Camera and capture

Full frame is the default and shows the whole source image without software cropping. The camera sits between student details and controls. Fill screen is available if you prefer cropped edge-to-edge video. The app requests a portrait 3:4 stream on phones and resets hardware zoom to 1× where supported. Full frame may show borders if your phone supplies a landscape stream. Camera permissions, actual lens selection and image quality depend on the phone/browser.

Automatic detection checks every 250 ms and uses two consistent detections with greater hand-motion tolerance. All four marks must remain visible inside the large boxes. Remove each paper completely before the next. Clear lighting and readable marks still matter. Capture now and image uploads remain available.

## Student controls

Previous student / Next student navigate within the selected lab or lecture without changing attendance or grades. Absent & next student marks absence and advances to the next present, unscanned student. Previous can return to an absent student; Mark present restores them. Visiting an already-scanned student preserves their grade and pauses capture until you explicitly choose Rescan. Replacement happens only when the new result saves successfully.

Manual Next is the default after a paper saves. Turn on Auto-next for hands-free progression through present, unscanned students. Auto scan controls automatic image capture independently. Anonymous validation saves no grade or photo and has no student navigation.

## Quiz and grading workflow

Choose/create a quiz, calibrate the printed sheet, set its answer key, import students and mark absences. Start a camera session and select a lab or lecture. Review multiple, blank and faint answers, then export Excel again for the latest grades. A previously downloaded workbook is not modified automatically.

Share quiz / merge scans exchanges quiz setup and instructor results manually. All records are local to the current device/browser/site address. Back up workspace to retain or transfer records. Never add real rosters, results, backups or answer keys to a public source repository. This independent app is not affiliated with ZipGrade.

## Filled answers and saved-photo repair

The v9 reader samples paper outside filled blue bubbles and avoids joining barcode stripes into fake corner squares. Corner selection uses your calibrated sheet proportions. Tracking uses smaller frames while retaining full-resolution grading and saved photos.

Back up your workspace before updating. In Results, choose Re-read saved photos to preview updated detections and scores for this quiz. Keep my manual answer decisions is checked by default. Uncheck it to discard previous overrides and review fresh optical readings. Click Save updated readings only after checking the preview; then review pending answers and export Excel again. Unreadable or missing photos remain unchanged. You can also open a single paper and choose Re-read this photo. No rescanning or recalibration is needed when the saved photo and reference marks are readable.

## Verification

The actual custom calibration and all 14 supplied saved photos were checked without false blanks. Multiple marked answers still need review. Synthetic regression checks cover oversized blue fills, barcode corner confusion, perspective, lighting, camera geometry, group navigation, absence handling, saved-score protection and export. Phone-sized browser QA used redacted photos and dummy student identities to verify preview, optional decision reset and individual repair. Physical-phone speed is not yet measured against ZipGrade. The supplied backup, photos and real student records are excluded from this release.
