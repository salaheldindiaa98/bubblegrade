# BubbleGrade — GitHub Pages edition v7

Upload ALL 17 files from this folder to your existing repository root, replacing matching files. Keep index.html at the root. Commit the upload, wait for GitHub Pages deployment to complete, then reload the site. Do not clear site data: your browser holds your quizzes and grades.

For a new installation, enable Settings → Pages → Deploy from a branch → main → /(root). Use the HTTPS URL shown by GitHub on your phone. No API key, database, paid service or build command is needed.

## Larger scanner

The camera now fills the portrait screen, including landscape camera streams, with compact student details and controls over the image. Numbered corner targets account for the crop and scale. Align all four printed registration squares, hold steady, then remove the paper fully before placing the next. The student's displayed identity is accepted by positioning the paper. Change student pauses capture while searching by serial or ID.

Choose a quiz, enter its key, import students and mark absences. Students → View lab narrows the roster; Scan this lab starts that group. Start a camera session to choose all students, a lab or lecture, a specific student/rescan, or anonymous validation. Rescan replaces a saved score; export Excel again to get an updated workbook. Anonymous tests save no grade or photo.

Share quiz / merge scans exchanges quiz setups and combines instructor result files. Everyone can create their own quizzes. Browser storage is local to each device and site address. Back up workspace before moving devices or browsers. Keep rosters, answer keys, result packets and backups out of the public repository.

Browser layout QA used a simulated wide camera. Validate your printed sheet, camera and lighting before official marking. This independent app is not affiliated with ZipGrade.

## v5 automatic capture fix

Camera capture now reads precisely the portrait region shown on screen, instead of the hidden full landscape camera frame. This fixes the spacing rejection that could keep all four guides yellow while the page looked aligned. It also shows a detection/focus message when no four-square set is found.

Upload all 17 extracted files to the repository root, replacing matching files, then Commit changes. Do not delete the old files first. Wait for Pages deployment, close the old scanner tab and reopen the same HTTPS site. Do not clear browser data. Existing quizzes, layouts, rosters and saved grades use the same storage keys.

Verified with generated-camera regression tests and two consecutive automatic browser captures. Actual phone lighting, focus and calibrated paper still need testing.

## v6: gray / blurred registration square detection

Live capture uses local contrast near the calibrated corner targets and selects a coherent four-square set. This handles gray, softened squares instead of requiring a fixed black pixel value. Barcode and middle-square distractors are checked. Displaced paper receives a detected-corner count and movement hint. Automatic capture still requires all four targets matched and a steady paper.

Upload all 17 extracted files to the repository root, replacing matching names; no deletion first. Commit, wait for GitHub Pages, close the old tab and reopen the same site. Confirm LIVE SCAN · v6 at the top. Keep browser data: existing storage keys and scores are retained.

Validated with blurred gray generated sheets, existing optical/queue/export regressions, and local browser replay of screenshot pixels. Replay detected four corners and captured after moving the paper upward. This verifies detection and capture; it is not a physical-phone test or a validation of the actual student's grade. No supplied screenshots, roster records or quiz data are included in this package.

## v7: larger, more forgiving corner boxes

The tiny center squares are removed. Put each printed square anywhere inside its large numbered box; centering is unnecessary. The visible box is exactly the accepted area. Targets stay on-screen and outside controls. A 390×844 portrait test uses 128×128 boxes instead of 56×56, and a vertically displaced paper automatically scanned twice in the browser test.

Upload all 17 files into your existing repository root, replacing matching files. No deletion first. Commit, wait for Pages deployment and reopen the same site. Confirm LIVE SCAN · v7. Do not clear browser data: existing quizzes and results use the same storage keys.

Geometry, detection, queue, scoring and export checks pass. Physical-phone alignment should be retested.
