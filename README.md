# Hey Hooman! Chennai dog survey

An 8-question survey for Chennai dog parents, served at **https://heyhooman.in**. Each response is saved as a row in a Google Sheet.

| File | What it is |
|---|---|
| `index.html` | The survey page. |
| `photos/` | The five background photos: `hero.jpg`, `run.jpg`, `sniff.jpg`, `splash.jpg`, `rest.jpg`. To change one, replace the file with the same name. Landscape, dog in the left half, about 1600 px wide. |
| `apps-script/Code.gs` | The script that saves each response to your Google Sheet. |
| `og-image.jpg` | The picture WhatsApp and Instagram show when the link is shared. |
| `campaign.webp` | The campaign creative, for posting on social media. |
| `CNAME` | Tells GitHub Pages to serve the site at heyhooman.in. |

Until step 1 is done, the page runs in **preview mode**. It works, but it saves nothing and says so on the thank-you screen.

## 1. Connect the Google Sheet (about 5 minutes, easiest on a laptop)

1. Go to [sheets.new](https://sheets.new) and name the sheet, for example "Hey Hooman responses".
2. Open **Extensions → Apps Script**.
3. Delete what's in the editor, paste in everything from `apps-script/Code.gs`, and click **Save**.
4. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**. Google asks you to authorise. Choose your account, then **Advanced → Go to (project name)** and **Allow**. This lets the script write to your own sheet.
6. Copy the **Web app URL**. It ends in `/exec`.
7. In `index.html`, paste that address between the quotes on the line `const SURVEY_ENDPOINT = '';`, then commit.

To check it's live, open the `/exec` address in a browser. You should see `"Hey Hooman survey endpoint is running."` The **Responses** tab, with its column headings, appears with the first answer.

If you change `Code.gs` later, publish it with **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. The address stays the same.

## 2. Turn on GitHub Pages

1. In this repo, open **Settings → Pages**.
2. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
3. Under "Custom domain" you should see `heyhooman.in` (from the `CNAME` file). If not, type it in and save.
4. Once the DNS check passes, tick **Enforce HTTPS**. The certificate can take up to an hour.

## 3. Point heyhooman.in at GitHub (at your domain registrar)

Add these DNS records and remove any other A or AAAA records on `@`:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | angokhle.github.io |

DNS changes can take a few hours to reach everyone.

## 4. Share it

Use a different link for each channel so the sheet's **Source** column shows where each response came from:

- WhatsApp: `https://heyhooman.in/?src=whatsapp`
- Instagram: `https://heyhooman.in/?src=instagram`

## 5. See the results at heyhooman.in/results

A private results page with the headline numbers for the Illalur decision, a chart for every question, and breakdowns by area, channel and the places people already use. It never shows phone numbers or emails, and it asks for a results key.

One-time setup in the Apps Script editor:

1. Replace everything in `Code.gs` with the latest `apps-script/Code.gs` from this repo and **save**.
2. Click the **gear icon (Project Settings)** on the left, scroll to **Script Properties**, click **Add script property**, enter **Property** `RESULTS_KEY` and a **Value** of your choosing (your results key), then **Save script properties**.
3. **Deploy → Manage deployments → pencil (Edit) → Version: New version → Deploy.** The web address stays the same.

Then open **heyhooman.in/results** and enter the key. Your browser remembers it. To share with your team, send them the key, or the link `https://heyhooman.in/results/#key=YOUR-KEY`.

## What lands in the sheet

One row per response: time, source, the answer to each question, the place they named (if any), phone, email, whether they agreed to be contacted, and how many seconds they took. Anything under about 10 seconds is probably a bot or a mis-tap, so filter those out before you count.

## Privacy

The page asks for permission before taking a phone number or email, and says they're used only for early-access updates. The footer gives **hello@heyhooman.in** for deletion requests, so make sure that address reaches you. Delete contact details once the launch list has been used.
