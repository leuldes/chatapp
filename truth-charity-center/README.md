# Truth Charity

A responsive front-end prototype for a transparency and social accountability platform. It demonstrates report submission and tracking, sample investigation updates, an illustrative financial dashboard, and a local-only administrator workspace.

## Run the project

1. Open the `truth-charity-center` folder in Visual Studio Code.
2. Open `index.html` and choose **Go Live** in the status bar (or right-click the file and choose **Open with Live Server**).
3. Use the navigation to explore the report form, tracking, transparency, and admin demo.

No build step, package installation, backend, or external JavaScript library is required. The page uses Google Fonts when online and falls back to system fonts. The app can also be opened directly as a file in a modern browser.

## Demo workflows

- **Submit a report:** Open **Report an issue**, complete the category, title, and description, and submit. The browser generates a tracking ID and stores the demonstration record in localStorage. The **Copy** button copies the ID where browser clipboard support is available.
- **Track a report:** Use the new ID or try the sample `TC-2026-1042` under **Track report**. Tracking displays only the category, status, progress, and updates—not the report title or description.
- **Review reports:** Open **Admin demo** and sign in with `reviewer` / `truth-demo`. Search and filter sample/local reports, select a report, change its status, and optionally add a public-safe update. Changes appear in tracking and are kept in this browser when storage is available.
- **Transparency:** Review the sample totals, native SVG allocation chart, CSS quarterly chart, and example projects. All are illustrative rather than actual organizational information.
- **Contact:** The form validates its fields and shows a local success message. It does not send or store a message.

The demonstration sign-in uses username `reviewer` and password `truth-demo`. These values are visible in the page and the JavaScript source. They only unlock a local interface and do not authenticate anyone or protect data.

## Files

- `index.html` contains the accessible page structure and all website sections.
- `style.css` provides the responsive styling, dashboard charts, forms, report timeline, admin interface, and mobile navigation presentation.
- `script.js` provides navigation, form validation, sample and submitted report state, tracking IDs, status/timeline updates, filters, copy support, and demo contact feedback.

## Demonstration limitations and privacy

**This prototype is not a secure reporting channel and does not guarantee anonymity. Do not submit real reports, identifying details, passwords, private contact information, or sensitive evidence.**

- `localStorage` is not a secure database. Data is readable and editable by people and scripts that can access this browser profile, and may be exposed on shared devices.
- Report descriptions and optional location/date are stored in browser localStorage for the demo. Avoid information that could identify or endanger anyone.
- Tracking IDs are not credentials. Anyone with an ID can see limited report category, status, and public-safe timeline information stored in this browser.
- The admin workspace includes a client-side demo sign-in only. Use username `reviewer` and password `truth-demo`; both are visible in the page and source code. This is not authentication and provides no server-side authorization or role-based access control.
- The report form has no evidence upload. Do not paste evidence into the description.
- Sample report content, progress percentages, impact metrics, finances, and projects are fictional examples.
- Local storage may be blocked, unavailable, cleared, or edited. The prototype reports when a save fails, but does not synchronize data between browsers or devices.

## Production implementation recommendations

Before accepting real reports, replace the demonstration with a threat-modeled service and independent security review. At minimum, plan for:

- A backend API and a securely configured database with documented retention and deletion policies.
- HTTPS everywhere, encrypted storage and backups, and managed secrets/keys.
- Data minimization, safe handling of sensitive evidence, malware scanning, strict file size/type limits, and encrypted evidence storage outside public web paths.
- Strong administrator authentication, role-based access control, least privilege, session protection, and tested authorization on every server-side operation.
- Server-side input validation, output encoding, rate limiting, abuse monitoring, and protections against common web attacks.
- Secure logging that avoids report contents and unnecessary identifiers; protected audit logs for privileged access and status changes.
- Backup/restore testing, incident response procedures, retention schedules, and privacy/legal review appropriate to the regions served.
- A carefully reviewed anonymity design. Consider what network, browser, operational, and metadata records may identify a reporter; do not promise anonymity until the full system has been independently tested.

These are recommendations, not protections implemented by this static demonstration.

## Manual test checklist

- [ ] Follow each navigation link and verify the mobile menu opens, closes, and collapses after a link is chosen.
- [ ] Submit the report form empty; confirm inline accessible errors appear.
- [ ] Submit a valid demo report; confirm it generates an ID, prevents duplicate submission while processing, and shows confirmation.
- [ ] Copy the generated tracking ID and use it to track the new report.
- [ ] Track `TC-2026-1042`; verify status, progress, and timeline display without the private report title or description.
- [ ] Try a blank tracking ID and an unknown ID; verify validation and helpful not-found feedback.
- [ ] Try the admin demo sign-in with empty fields and incorrect credentials, then sign in with `reviewer` / `truth-demo`; confirm the workspace close action returns to the sign-in form.
- [ ] In the admin workspace, try text/category/status filters, select a report, add a public-safe note, and change its status.
- [ ] Track the changed report again; confirm its updated status and note appear.
- [ ] Verify all financial figures are labeled illustrative and both charts render without chart libraries.
- [ ] Submit the contact form empty and with valid data; confirm validation and the demo-only success message.
- [ ] Reload and confirm submitted reports and admin updates persist in the same browser when localStorage is enabled.
- [ ] Test at 320px, tablet, and desktop sizes; confirm navigation, forms, cards, and charts remain usable without horizontal overflow.
- [ ] Navigate with a keyboard and check labels, focus indicators, reduced-motion behavior, and status announcements.
- [ ] Block localStorage in browser settings and verify the app remains usable while reporting that changes may not persist.
