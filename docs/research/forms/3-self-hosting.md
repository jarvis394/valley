# Form 3: Hosting your own Valley

Study 3 (self-hosting) and long-term commitment. [Evaluation plan](../evaluation-plan.md#study-3-self-hosting). Exactly 3 photographers, codes P1, P2 and P3. Each fills this form 3 times: after deploying, after shoot 1 and after shoot 2.

One form with branching, so all entries land in one sheet. Microsoft Forms settings: "Anyone can respond" (the photographers may not have Oulu accounts), don't record names. Every question is required unless marked optional.

## Start

**Title:** Valley: hosting your own gallery

**Description:** the [short version of the privacy notice](../privacy-notice.md#short-version-for-the-start-of-each-form), with "You will fill in this form 3 times: after you deploy Valley, and after each of your next two shoots. Each time takes about 5 to 10 minutes." as the second sentence. Replace "A random code links your answers to what you do in Valley" with "Your code (P1, P2 or P3) links your entries together".

| ID  | Question              | Type               | Options                                                                                       | Branching                 |
| --- | --------------------- | ------------------ | --------------------------------------------------------------------------------------------- | ------------------------- |
| S1  | Consent               | Choice, one answer | I am 18 or older, I have read the text above and the privacy notice, and I agree to take part |                           |
| S2  | Your participant code | Choice             | P1 / P2 / P3                                                                                  |                           |
| S3  | Which entry is this?  | Choice             | I just deployed Valley / After my first shoot / After my second shoot                         | Deployed → A. Shoots → D. |

## A. About you (first entry only)

| ID  | Question                                          | Type                               | Options                                                                                                                                                                                  |
| --- | ------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Your age range                                    | Choice                             | 18-23 / 24-29 / 30-49 / 50+                                                                                                                                                              |
| A2  | How do you relate to photography/videography?     | Choice                             | Hobbyist (have a low to mid-range camera) / Paid work part-time / Main profession                                                                                                        |
| A3  | Have you ever...                                  | Choice, multiple answers, Other on | Used a terminal; Deployed a website (used Vercel, Netlify, Cloudflare, ...); Installed Linux; Diagnosed a server; Deployed self-hosted apps (Immich, NextCloud, etc.); None of the above |
| A4  | What do you use now to deliver photos to clients? | Choice, multiple answers, Other on | Google Photos / Google Drive; iCloud; Dropbox / WeTransfer; Adobe Portfolio; Vigbo; Pixieset / Pic-Time; Immich or another self-hosted app; My own website                               |

A4 is new: it is the baseline for the commitment question in D4.

## B. After deploying

| ID  | Question                                                                                               | Type                                       | Options                                      |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------- |
| B1  | Where did you deploy Valley?                                                                           | Choice, Other on                           | Vercel / Cloudflare                          |
| B2  | Did you finish the deployment?                                                                         | Choice                                     | Yes, on my own / Yes, but I needed help / No |
| B3  | About how many minutes did it take, from opening the guide to seeing your gallery online?              | Text, restriction "Number", greater than 0 |                                              |
| B4  | Where did you get stuck or unsure? Write each place on its own line, with what you did to get past it. | Text, long answer                          | Write "Nowhere" if it went smoothly          |
| B5  | Link to your Valley                                                                                    | Text                                       |                                              |

Each line in B4, and each time the researcher had to help, counts as a failure point.

## C. UEQ-S

**Section description:** "Rate setting up and deploying Valley. Each line has two opposite words; choose the circle closer to the word that fits better. Go with your first impression."

8 **Rating, 7 levels, number** questions. Keep the official UEQ-S order and direction; don't reword the anchors. Title each "Setting up Valley was..." so the item is only the pair of words.

| ID  | Left (1)        | Right (7)    | Scale     |
| --- | --------------- | ------------ | --------- |
| C1  | obstructive     | supportive   | Pragmatic |
| C2  | complicated     | easy         | Pragmatic |
| C3  | inefficient     | efficient    | Pragmatic |
| C4  | confusing       | clear        | Pragmatic |
| C5  | boring          | exciting     | Hedonic   |
| C6  | not interesting | interesting  | Hedonic   |
| C7  | conventional    | inventive    | Hedonic   |
| C8  | usual           | leading edge | Hedonic   |

Changed from the Google Form: the Google Form asks about the app ("Were UI elements helpful for navigating the app?") under a heading about deployment. Here every item is about deployment, which is what Study 3 measures. Score with the official analysis sheet from ueq-online.org: subtract 4 from each answer, so it runs from −3 to +3.

After C, go to End.

## D. After each shoot

| ID  | Question                                                                                   | Type                        | Options                                                                           |
| --- | ------------------------------------------------------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------- |
| D1  | Did you use your Valley for this shoot?                                                    | Choice                      | Yes, it was the main way I delivered the photos / Yes, next to my usual tool / No |
| D2  | What happened? Describe how you made and shared the gallery, or why you didn't use Valley. | Text, long answer           |                                                                                   |
| D3  | Did anything break or need fixing on your server?                                          | Text, long answer, optional |                                                                                   |
| D4  | For your next shoot, how likely are you to use Valley instead of what you use now?         | Rating, 5 levels, number    | 1 = Not at all likely, 5 = Extremely likely                                       |
| D5  | Did the client say anything about the gallery?                                             | Text, long answer, optional |                                                                                   |

## End

**Thank-you message:** "Thank you! See you after your next shoot." After shoot 2, the researcher books a 20-minute interview.
