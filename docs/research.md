# Step 3 research: four questions before brainstorming

Researched Oct 28, 2026; question 5 added after the brainstorm. Sources are primary where possible: statutes and regulators for the legal question, companies' own help pages for payment timing, peer-reviewed studies for chatbots vs. forms, and UX research firms (Nielsen Norman Group, Baymard Institute) for interface conventions. Where a source wasn't available, the gap is stated.

This is research to inform decisions, not legal advice. Nothing here is a claim about what Legion must do. That's for Legion's counsel.

## 1. Reviews and testimonials inside a signup flow

**Short answer:** UX research supports keeping the flow focused on the task. Social proof helps most before someone commits, and it can distract once they're filling in a form.

- Nielsen Norman Group's trust hierarchy says trust is built in order: relevance, then preference, then personal information, then sensitive or financial information. "Sites must meet users' basic trust needs before they demand that visitors enter information." Social proof is one of the tools for the early levels ([NN/g, Hierarchy of Trust](https://www.nngroup.com/articles/commitment-levels/))
- NN/g says social proof can "remove decision-making uncertainty", but also that it can create "a crowded and confusing interface that distracts users from calls to action", and that sites "may over-use the technique and complicate simple interactions". It recommends A/B testing testimonials rather than assuming they help ([NN/g, Social Proof in UX](https://www.nngroup.com/articles/social-proof-ux/))
- Baymard's checkout guideline flags that "users can be distracted during the checkout process by dominant noncheckout elements". The full guideline is behind a paywall, so only the issue statement was checked ([Baymard, enclosed checkout](https://baymard.com/guidelines/606-enclosed-checkout-design))
- **Gap:** no peer-reviewed study or health-tech-specific source was found on testimonials inside a signup flow. I didn't check what competitors show inside their own intake flows

**What it means for us:** this supports finding 3 (the quote panel keeps selling after Get Started). It doesn't rule out a small, specific trust signal at a real decision point, like the match page, if it's tested.

## 2. AI in the fit check: standard, or slower?

**Short answer:** in the two studies found, patients preferred a conversational format, but it was the same speed or slower. Neither tested a short eligibility screen like Legion's six questions.

- Soni et al., *Frontiers in Digital Health*, 2022: 206 US adults completed the same 21-question health assessment as a chatbot and as an online form. 69.9% preferred the chatbot, but it took longer: median 212.5 seconds vs. 123.0 for the form. Usability scores weren't significantly different (SUS 69.7 vs. 67.7). Limits: paid online panel, nearly half the sample excluded for low-quality answers, few people over 60, and some authors have ties to a chatbot company ([Soni et al. 2022](https://frontiersin.org/articles/10.3389/fdgth.2022.954069/full))
- Te Pas et al., *JMIR Medical Informatics*, 2020: 40 patients at one Dutch pre-operative clinic completed identical questions both ways. The chatbot was preferred on 20 of 26 user-experience terms, and completion times were similar (7.72 vs. 8.20 minutes). Limits: small sample, and the chatbot ran on a tablet while the form ran on a computer ([Te Pas et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7752526/))
- **Gap:** I couldn't confirm from primary sources whether competitors use AI in their eligibility screens, so "standard" is unverified

**What it means for us:** the evidence doesn't show AI making a short yes/no screen faster. It points more toward AI for open-ended questions (conditions, needs, pre-visit intake), where a form is weakest. The fit check includes a self-harm question, so any screen-out there has to route the same way every time, which is a safety point, not a research finding.

## 3. When competitors take payment

**Short answer:** all three charge after the visit. Talkiatry and Headway need a card before the booking is confirmed. Rula lets the patient reserve a slot first and add the card during registration, before a deadline, or the slot is cancelled. *(Corrected Oct 28: the first version said all three take the card at or before booking. Rula's sign-up guide, checked for question 5, shows the card comes after reserving.)*

| Company | When the card is needed | When it's charged | Source |
|---|---|---|---|
| Talkiatry (psychiatry, insurance) | New patients since January 2026: after picking an appointment. "Once you add your payment method, your first visit will be locked in" | Card covers late cancellation and missed appointment fees; exact charge timing not stated | [Talkiatry help center](https://www.talkiatry.com/help-center-articles/is-a-payment-method-on-file-required) |
| Rula (therapy and psychiatry, insurance) | "We require patients to keep a credit card on file," added during registration, which comes after reserving a slot. If registration isn't finished within six days of booking or 14 hours before the appointment, whichever is first, the appointment is cancelled ([Rula sign-up guide](https://patientsupport.rula.com/hc/en-us/articles/31296525013787-How-to-complete-the-sign-up-process-and-confirm-your-first-appointment-with-Rula)) | Copay after the visit; deductible after the insurer processes the claim (3 to 4 weeks); no-show or late-cancel fee within 72 hours | [Rula patient support](https://patientsupport.rula.com/hc/en-us/articles/26987317587739) |
| Headway (therapy and psychiatry, insurance) | Payment on file before a session can be confirmed. Connecticut is an exception: no card required, a one-time payment link is sent instead | "When you confirm a session", after it happens | [Headway help center](https://help.headway.co/hc/en-us/articles/360059065272) |

- Talkiatry and Headway both treat Connecticut differently. I didn't check why, so no claim about Connecticut law
- **Gap:** I didn't check Maple, since it's Canadian and outside Legion's market, or subscription services like Cerebral

**What it means for us:** charging after the visit is the norm, and the card mainly protects against no-shows. Rula's reserve-first approach, with a deadline to add the card, is the closest precedent for adding the card later (idea B4b).

## 4. Which consents are required in Texas

What Legion's patient-details page asks for (seen in the mobile recording at about 2:22):

1. "I agree to the Legion Health Terms of Service, Privacy Policy, and HIPAA Notice"
2. "I agree to the Legion Health Treatment Consent Policy, and Controlled Substance Policy"
3. "I agree to the Recording & AI Transcription Policy"

What I could verify:

| Item | What the law says | What I couldn't confirm |
|---|---|---|
| HIPAA Notice of Privacy Practices (federal) | A direct treatment provider must give the notice no later than the first service, and make a good-faith effort to get a written acknowledgment of receipt. For a first service delivered online, the notice is sent "automatically and contemporaneously" ([HHS](https://hhs.gov/ocr/privacy/hipaa/understanding/coveredentities/notice.html)) | HHS doesn't say the patient must "agree" to the notice for care to go ahead. It describes an acknowledgment of receipt |
| Terms of Service and Privacy Policy | No Texas or federal requirement found for a patient checkbox. Texas requires a general notice when health information can be disclosed electronically, which can be met by "posting a notice on the covered entity's Internet website" ([Tex. Health & Safety Code §181.154](https://tcss.legis.texas.gov/resources/HS/htm/HS.181.htm)) | Whether Legion uses the checkbox for contract reasons |
| Treatment consent | Texas requires informed consent before telemedicine or telehealth services ([Tex. Occ. Code §111.002](https://tcss.legis.texas.gov/resources/OC/htm/OC.111.htm)). But §111.008 says "This chapter does not apply to mental health services" | Whether that exclusion covers telepsychiatry. A question for Legion's counsel. Consent to treatment is standard practice either way |
| Controlled substance policy | Federal telemedicine prescribing flexibilities run through Dec 31, 2026, and don't add a patient consent requirement ([Federal Register, Dec 31, 2025](https://www.federalregister.gov/documents/2025/12/31/2025-24123/fourth-temporary-extension-of-covid-19-telemedicine-flexibilities-for-prescription-of-controlled)) | No law found requiring a patient checkbox. Likely Legion's own clinical policy |
| AI use | Since Jan 1, 2026, if AI is used in relation to a health care service or treatment, the provider must disclose it to the patient "before or at the time of interaction", no later than the date the service is first provided. It must be "clear and conspicuous", in plain language, may be a hyperlink, and "may not use a dark pattern" (Texas HB 149, [Bus. & Com. Code §552.051](https://capitol.texas.gov/tlodocs/89R/billtext/pdf/HB00149F.pdf)). Separately, a practitioner who uses AI for diagnostic purposes must disclose it to patients (since Sept 1, 2025, [Tex. Health & Safety Code §183.005](https://law.justia.com/codes/texas/health-and-safety-code/title-2/subtitle-i/chapter-183/section-183-005/)) | Both laws require **disclosure**, not agreement. Whether Legion also needs agreement is a policy choice |
| Recording | Not checked | Texas law on recording a visit wasn't researched, so no claim |

**What it means for us:** the prototype's AI steps must tell the patient they're talking to AI, clearly and before the interaction. That matches the game plan's transparency rule. The three checkboxes may be condensable into notices plus one consent, but that's a decision for Step 3, and any real change is for Legion's counsel.

## 5. How competitors run the first screening step

Added for the fit check rework (idea F3). Lily found these sources; the Legion Cowork Session checked each one.

- **Rula** asks for date of birth, the state you'll get care in, your insurance, the type of care, and your name, email and phone. It then shows "all of the providers that contract with Rula in your state and that accept your insurance." Address, insurance details for verification, sex assigned at birth and a card come later, in registration after reserving a slot ([Rula sign-up guide](https://patientsupport.rula.com/hc/en-us/articles/31296525013787-How-to-complete-the-sign-up-process-and-confirm-your-first-appointment-with-Rula))
- **Talkiatry** describes its online assessment as about 10 minutes, covering "why you're seeking care and what you're looking for", with an insurance eligibility checker, and then shows doctors who match ([Talkiatry](https://www.talkiatry.com/blog/how-to-find-a-psychiatrist))
- A Healthline review (medically reviewed, last updated June 26, 2025) says Talkiatry patients "must fill out a questionnaire before every appointment". That's a reviewer's account, not Talkiatry's own page ([Healthline](https://www.healthline.com/health/talkiatry))

**What it means for us:** Rula screens with facts (age, state, insurance) and shows in-network providers right away, then collects the rest after booking. Talkiatry's pre-visit questionnaire is a precedent for a check-in before each visit. Rula's first step also asks for name, email and phone, so it's short but not only facts.

## 6. How Legion rolls out AI today: Utah renewals

Added Oct 29 to source the rollout decision ("Roll out the AI intake the way Legion rolls out Utah renewals").

- **What Legion told Lily:** Yash Patel (CEO), Oct 27: for stable patients on a scoped formulary, AI can renew without a human. The first 250 need human plus AI concordance, then the next 1,000 get a human audit (`Legion Health - Take-Home Context Pack.md`, outside the repo)
- **What Utah's Department of Commerce publishes:** a 12-month pilot that only renews existing, non-controlled prescriptions for stable patients, and "does not diagnose, prescribe new medications, or adjust doses." Phased validation: the "first 250 requests: reviewed by a licensed clinician before completion", the "next 1,000 requests: undergo intensive retrospective review to confirm accuracy", then "monthly randomized sampling and auditing of cases", with monthly reporting to Utah's Office of Artificial Intelligence Policy ([Utah Department of Commerce: Legion Health agreement](https://commerce.utah.gov/ai/agreements/ai-legion-health/))

**What it means for us:** the 250 and 1,000 phases are Legion's own pattern, so the check-in rollout mirrors it. The 10% audit of the next 1,000 and the pause rules are our proposal for Legion's clinical team; Utah's page describes an intensive review of all 1,000.

- [NN/g: Hierarchy of Trust](https://www.nngroup.com/articles/commitment-levels/)
- [NN/g: Social Proof in the User Experience](https://www.nngroup.com/articles/social-proof-ux/)
- [Baymard: Enclosed checkout design](https://baymard.com/guidelines/606-enclosed-checkout-design)
- [Soni et al. 2022, Frontiers in Digital Health](https://frontiersin.org/articles/10.3389/fdgth.2022.954069/full)
- [Te Pas et al. 2020, JMIR Medical Informatics](https://pmc.ncbi.nlm.nih.gov/articles/PMC7752526/)
- [Talkiatry: Is a payment method on file required?](https://www.talkiatry.com/help-center-articles/is-a-payment-method-on-file-required)
- [Rula: Patient payment responsibilities](https://patientsupport.rula.com/hc/en-us/articles/26987317587739)
- [Headway: How Headway bills clients](https://help.headway.co/hc/en-us/articles/360059065272)
- [Rula: Sign-up and first appointment](https://patientsupport.rula.com/hc/en-us/articles/31296525013787-How-to-complete-the-sign-up-process-and-confirm-your-first-appointment-with-Rula)
- [Talkiatry: How to find a psychiatrist](https://www.talkiatry.com/blog/how-to-find-a-psychiatrist)
- [Healthline: Talkiatry review](https://www.healthline.com/health/talkiatry)
- [HHS: Notice of Privacy Practices](https://hhs.gov/ocr/privacy/hipaa/understanding/coveredentities/notice.html)
- [Texas Health & Safety Code Chapter 181](https://tcss.legis.texas.gov/resources/HS/htm/HS.181.htm)
- [Texas Occupations Code Chapter 111](https://tcss.legis.texas.gov/resources/OC/htm/OC.111.htm)
- [Federal Register: Fourth temporary extension of telemedicine flexibilities](https://www.federalregister.gov/documents/2025/12/31/2025-24123/fourth-temporary-extension-of-covid-19-telemedicine-flexibilities-for-prescription-of-controlled)
- [Texas HB 149 (enrolled)](https://capitol.texas.gov/tlodocs/89R/billtext/pdf/HB00149F.pdf)
- [Texas Health & Safety Code §183.005](https://law.justia.com/codes/texas/health-and-safety-code/title-2/subtitle-i/chapter-183/section-183-005/)
- [Utah Department of Commerce: Legion Health agreement](https://commerce.utah.gov/ai/agreements/ai-legion-health/)
