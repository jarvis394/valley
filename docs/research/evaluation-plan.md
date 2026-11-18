# Valley evaluation plan

Valley is a tool for building and sharing photo galleries. The thesis evaluates it with three studies, one form each:

| Study             | Question it answers                                                | Participants               | Form                                                       |
| ----------------- | ------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------- |
| 1. No-code editor | Can people without design skills make a gallery they are proud of? | 12 or more, any background | [Form 1](forms/1-editor.md), about 30 min                  |
| 2. Gallery value  | Do photo islands present a shoot better than a plain grid?         | 20 or more viewers         | [Form 2](forms/2-gallery-viewing.md), about 10 min         |
| 3. Self-hosting   | Can a photographer deploy Valley alone and keep using it?          | Exactly 3 photographers    | [Form 3](forms/3-self-hosting.md), 3 entries over 2 shoots |

The fourth point from the meeting, commitment over Google Photos, Adobe Portfolio, Vigbo and Immich, has no study of its own. Forms 1 and 3 measure it (see [Commitment](#commitment-across-studies)).

All scales are 5-point, except UEQ-S, which keeps its validated 7-point scale. A 5-point UEQ-S cannot be compared with the UEQ benchmark.

## Study 1: No-code editor

**Statement.** Valley has a low floor and a high ceiling: people without design experience can make a gallery they are proud of in 15 minutes, and people with design experience can go further with it.

**Hypotheses.**

| ID                  | Hypothesis                                                                                                                         | Measure                                                                                     | Form question                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| H1.1                | Most participants are proud enough to share the result: the median pride answer is "I'd send it to family or friends" or higher.   | Pride, 5 ordered options                                                                    | [1.B3](forms/1-editor.md#b-using-the-valley-app)                                                                                   |
| H1.2                | Valley supports creative work: the mean CSI is 60 or higher out of 100.                                                            | CSI agreement items × paired comparisons                                                    | [1.C](forms/1-editor.md#c-csi-statements), [1.D](forms/1-editor.md#d-csi-pairs)                                                    |
| H1.3 (low floor)    | Pride and CSI do not differ much between people with little design experience (A4 options 1–2) and people with more (options 3–5). | Mann–Whitney U and effect size r. With 12 people this is descriptive; report r, not only p. | [1.A4](forms/1-editor.md#a-about-you), [1.B3](forms/1-editor.md#b-using-the-valley-app), [1.C](forms/1-editor.md#c-csi-statements) |
| H1.4 (high ceiling) | People with more design experience change the starter template more: more block types, more layout and theme changes.              | Edit distance from the starter template, from the editor logs                               | [1.B1](forms/1-editor.md#b-using-the-valley-app) (code links the form to the log)                                                  |

**Steps to verify.**

1. Prepare the demo account at `valley.yekushev.dev/survey/demo` with the same starter gallery ("ABC Band Photoshoot") and the same photos for everyone.
2. Log every editor operation with the participant's code. The editor already emits each change through `editor.subscribe`; the survey build saves these with a timestamp.
3. Pilot with 2 people. Check the 15-minute timer, the code, and that the log reaches the server.
4. Run with 12 or more people.
5. Compute pride, CSI and edit distance per participant. Compare the two experience groups.

**Analysis.**

- CSI on a 5-point scale: convert each answer r to (r − 1) × 2.5, so it runs 0–10 like the original. For each factor, add its two items (0–20) and multiply by the number of times the factor was chosen in the pairs (0–4). Add the 5 factor scores and divide by 2 to get CSI (0–100).
- Edit distance: count operations that change structure (add, remove or move a block; change a layout, theme or font). Ignore text typing and selection.

## Study 2: Gallery value (photo islands vs grid)

**Statement.** Photo islands, which group photos into moments, help a viewer understand and remember a shoot better than a date-sorted grid of the same photos.

**Hypotheses.** On the 1–5 comparison scales, 1 is Munich (islands) and 5 is Stockholm (grid).

| ID   | Hypothesis                                                                                           | Measure                                                                                       | Form question                                               |
| ---- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| H2.1 | Viewers name more distinct moments for the islands gallery.                                          | Number of moments in each recall answer, counted with a written rubric. Wilcoxon signed-rank. | [2.B1, 2.B2](forms/2-gallery-viewing.md#b-recall)           |
| H2.2 | The islands gallery tells a more cohesive story and gives a better overview.                         | Median below 3. One-sample Wilcoxon against 3.                                                | [2.C3, 2.C5](forms/2-gallery-viewing.md#c-comparison)       |
| H2.3 | Viewers see the photographer of the islands gallery as more professional and would rather hire them. | Median below 3. One-sample Wilcoxon against 3.                                                | [2.C1, 2.C2, 2.C6](forms/2-gallery-viewing.md#c-comparison) |
| H2.4 | Viewers spend longer on the islands gallery.                                                         | Time and scroll depth from the viewer log (optional, only if the viewer logger is built)      | None. Needs a viewer code in Form 2 if the logger is built. |

**Steps to verify.**

1. Publish both galleries: Munich with islands, Stockholm as a date-sorted grid. Use the same layout, theme and number of photos. Both links currently return 404.
2. Write the recall rubric before reading any answers. A "moment" is a distinct scene or event, for example "the band on the bridge".
3. Pilot with 2 people, then run with 20 or more.
4. Count moments, run the tests and report medians with the distribution of answers.

**Known limitation.** Munich is always shown first and always has islands. Order and gallery content are mixed with the layout. State this in the thesis; it is a deliberate choice to keep the study simple.

## Study 3: Self-hosting

**Statement.** A photographer can deploy their own Valley without help, and keeps using it for their real work.

**Hypotheses.**

| ID   | Hypothesis                                                               | Measure                                              | Form question                                     |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- |
| H3.1 | All 3 photographers finish the deployment without the researcher's help. | Done or not, number of failure points, minutes spent | [3.B](forms/3-self-hosting.md#b-after-deploying)  |
| H3.2 | Deployment is usable: the UEQ-S pragmatic quality is above 0.8.          | UEQ-S items 1–4                                      | [3.C](forms/3-self-hosting.md#c-ueq-s)            |
| H3.3 | Photographers use Valley again for their second shoot.                   | Used for shoot 2: yes or no, and why                 | [3.D](forms/3-self-hosting.md#d-after-each-shoot) |

**Steps to verify.**

1. Recruit exactly 3 photographers who will each have 2 shoots in the study period.
2. Give them the deployment guide (Vercel or Cloudflare) and nothing else. The researcher only observes; any help counts as a failure point.
3. They fill in Form 3 parts A–C after deploying, and part D after each shoot.
4. Hold a 20-minute interview after the second shoot.
5. Score UEQ-S with the official analysis sheet from ueq-online.org.

## Commitment (across studies)

**Statement.** People would choose Valley over what they use now to share photos.

| ID   | Hypothesis                                                                                      | Measure                     | Form question                                                                           |
| ---- | ----------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| H4.1 | Valley is rated better than the current tool: median 4 or higher.                               | 1–5 comparison              | [1.B5](forms/1-editor.md#b-using-the-valley-app)                                        |
| H4.2 | People who share many photos (A7 is 4 or 5) are more likely to use Valley for their next shoot. | Spearman correlation        | [1.A7](forms/1-editor.md#a-about-you), [1.B4](forms/1-editor.md#b-using-the-valley-app) |
| H4.3 | The 3 photographers keep Valley after the study.                                                | Interview, last diary entry | [3.D4](forms/3-self-hosting.md#d-after-each-shoot)                                      |

## Ethics and data

- All forms move to Microsoft Forms in the University of Oulu account, set to "Anyone can respond" without recording names.
- Each form opens with a short notice and links to the full [privacy notice](privacy-notice.md).
- The answers are pseudonymous, not anonymous: the code links answers to the Valley logs. The forms say "we don't ask for your name or email" instead of "anonymous".
- Data is kept until the thesis is graded, then the raw answers and logs are deleted. Only summaries and anonymous quotes appear in the thesis.
