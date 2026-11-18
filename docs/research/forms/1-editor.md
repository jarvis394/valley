# Form 1: Making a gallery

Study 1 (no-code editor) and the commitment questions. [Evaluation plan](../evaluation-plan.md#study-1-no-code-editor). 12 or more participants, about 30 minutes.

Microsoft Forms settings: "Anyone can respond", don't record names, one response per person off. Every question is required unless marked optional.

## Start

**Title:** Valley: making a gallery

**Description:** the [short version of the privacy notice](../privacy-notice.md#short-version-for-the-start-of-each-form), with "It takes about 30 minutes: a few questions about you, a 15-minute task in the Valley app, and questions about how it went." as the second sentence.

| ID  | Question | Type               | Options                                                                                       |
| --- | -------- | ------------------ | --------------------------------------------------------------------------------------------- |
| S1  | Consent  | Choice, one answer | I am 18 or older, I have read the text above and the privacy notice, and I agree to take part |

## A. About you

| ID  | Question                                                                                                                                                                                                                                                                                 | Type                               | Options                                                                                                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Your age range                                                                                                                                                                                                                                                                           | Choice                             | 18-23 / 24-29 / 30-49 / 50+                                                                                                                                                                                                                                                                                   |
| A2  | How do you relate to photography/videography?                                                                                                                                                                                                                                            | Choice                             | Just taking family and friends pictures on my smartphone / Usually the one to take pictures (high-end smartphone) / Hobbyist (have a low to mid-range camera) / Paid work part-time / Main profession                                                                                                         |
| A3  | How creative are you?                                                                                                                                                                                                                                                                    | Rating, 5 levels, number           | 1 = ChatGPT thinks for me, 5 = I get paid for my creativity                                                                                                                                                                                                                                                   |
| A4  | What was your experience with design?                                                                                                                                                                                                                                                    | Choice                             | Didn't even open MS Paint / Occasionally editing in Photoshop, Figma, or other design related software / Often do work in Photoshop or Figma for myself / Did paid work/freelance in design industry (UI design, posters, etc.) / Work professionally in design industry                                      |
| A5  | Which tools have you used to make a visual layout (website, poster, presentation)?                                                                                                                                                                                                       | Choice, multiple answers           | PowerPoint / Google Slides; Canva; Framer; Tilda / WordPress / WebFlow / Squarespace / Wix; Figma; Photoshop / InDesign; I do frontend (or my clanker); None of the above                                                                                                                                     |
| A6  | If you were tasked with a design job, what would you choose? Choose the middle if you would want to do both.                                                                                                                                                                             | Rating, 5 levels, number           | 1 = User interfaces, 5 = Photo editing                                                                                                                                                                                                                                                                        |
| A7  | Rate how often you share photos or videos you took                                                                                                                                                                                                                                       | Rating, 5 levels, number           | 1 = I send 1 to 10 images in a month, 5 = Chats with me always have >1K media count                                                                                                                                                                                                                           |
| A8  | Sending photos. You have exactly 148 photos and 6 videos, all from a nice trip. The shots you took are so great that you want to share all of them with all your friends (and maybe upload some to the Internet!) What would you do to distribute? (you can choose multiple or just one) | Choice, multiple answers, Other on | Dump all of them in the chat; Create a special group chat for it (or use an existing one, just for sharing files); Upload on Google Photos / iCloud and share a link to the album; Use specialized website to create a pretty looking gallery (Adobe Portfolio, Vigbo); Upload them on your portfolio website |

Changed from the Google Form: A3, A6 and A7 go from 1–10 to 1–5. "Have you ever..." moved to Form 3, where deployment skills matter.

## B. Using the Valley app

**Section description:**

> Visit valley.yekushev.dev/survey/demo – you should be logged in with a demo user.
>
> Open the only gallery visible on the home page, it's named "ABC Band Photoshoot". This was a paid work for your friends. In 15 minutes, try to create a gallery that will impress them. You will see a timer on the top right. You cannot retouch or edit photos and you cannot remove or add new ones.
>
> After you are done, go to the home page and click Finish (or click on a timer). You will be presented with a code – paste it in the question below.

| ID  | Question                                                                     | Type                                       | Options                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Your unique code                                                             | Text                                       | Restriction: none (codes are not numbers)                                                                                                                                                         |
| B2  | About how many minutes did you spend editing your gallery?                   | Text, restriction "Number", greater than 0 |                                                                                                                                                                                                   |
| B3  | How proud are you of your work?                                              | Choice                                     | I wouldn't show it to anyone / I'd show it only if someone asked / I'd send it to family or friends / I'd send it to a client / I'd post it publicly (LinkedIn, Instagram, ...)                   |
| B4  | How likely are you to use Valley for your next shoot?                        | Rating, 5 levels, number                   | 1 = Not at all likely, 5 = Extremely likely                                                                                                                                                       |
| B5  | Compared with what you use now for sharing pictures/videos, Valley is...     | Rating, 5 levels, number                   | 1 = Significantly worse, 5 = Significantly better                                                                                                                                                 |
| B6  | Why so? Think of one or two features you liked and describe your experience. | Text, long answer, optional                |                                                                                                                                                                                                   |
| B7  | What would help you make a better gallery?                                   | Choice, multiple answers, Other on         | More block types (video, quotes, maps, ...); Ready-made templates to start from; More photo layouts; More fonts and colors; Tips or suggestions while editing; Nothing, I had everything I needed |
| B8  | Would you add any other features or change existing ones?                    | Text, long answer, optional                |                                                                                                                                                                                                   |

Changed: B4 goes from 0–10 to 1–5. B4 to B8 moved before the CSI so the CSI sections stay together.

## C. CSI statements

**Section description:** "Rate how much you agree with each statement about making your gallery in Valley. Some statements are similar on purpose; please rate each one separately."

One Microsoft Forms **Likert** question. Columns: Strongly disagree / Disagree / Neutral / Agree / Strongly agree (scored 1–5). Rows, in this order:

| ID  | Statement                                                                                                                           | Factor               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| C1  | It was easy for me to explore many different ideas, options, designs, or outcomes, without a lot of tedious, repetitive interaction | Exploration          |
| C2  | The tool was helpful in allowing me to track different ideas, outcomes, or possibilities                                            | Exploration          |
| C3  | I was able to be very creative while making the gallery                                                                             | Expressiveness       |
| C4  | My attention was fully tuned to the task, and I forgot about the tool I was using                                                   | Immersion            |
| C5  | I enjoyed using the tool                                                                                                            | Enjoyment            |
| C6  | I was satisfied with what I got out of the tool                                                                                     | Results worth effort |
| C7  | What I was able to make was worth the effort I put in                                                                               | Results worth effort |
| C8  | The tool allowed me to be very expressive                                                                                           | Expressiveness       |
| C9  | I was so immersed that I forgot about the tool I was using                                                                          | Immersion            |
| C10 | I would be happy to use this tool on a regular basis                                                                                | Enjoyment            |

## D. CSI pairs

**Section description:** "For each pair, choose the one that matters more to you when making a gallery. There are no right answers."

10 **Choice** questions, all titled "When doing this task, it is most important that I am able to...". Turn on "Shuffle options" for each.

| ID  | Option 1                                                 | Option 2                                           |
| --- | -------------------------------------------------------- | -------------------------------------------------- |
| D1  | Explore many different ideas, outcomes, or possibilities | Be creative and expressive                         |
| D2  | Explore many different ideas, outcomes, or possibilities | Become immersed in the activity                    |
| D3  | Explore many different ideas, outcomes, or possibilities | Enjoy using the system or tool                     |
| D4  | Explore many different ideas, outcomes, or possibilities | Produce results that are worth the effort I put in |
| D5  | Be creative and expressive                               | Become immersed in the activity                    |
| D6  | Be creative and expressive                               | Enjoy using the system or tool                     |
| D7  | Be creative and expressive                               | Produce results that are worth the effort I put in |
| D8  | Become immersed in the activity                          | Enjoy using the system or tool                     |
| D9  | Become immersed in the activity                          | Produce results that are worth the effort I put in |
| D10 | Enjoy using the system or tool                           | Produce results that are worth the effort I put in |

Scoring is in the [evaluation plan](../evaluation-plan.md#study-1-no-code-editor).

## End

**Thank-you message:** "Thank you! Your answers are saved. If you want your data deleted later, email Vladislav.Ekushev@student.oulu.fi with your code."
