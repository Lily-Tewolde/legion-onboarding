// Every user-facing string, from docs/copy-draft.md (Lily's edited version,
// Oct 29). One file so the readability check can read them all. Later PRs
// add each screen's strings here. {number} and {link} mark where a link goes

export const copy = {
  shell: {
    tabTitle: "Legion Health · Prototype",
    name: "Legion Health",
    banner: "Demo prototype: don't enter real information",
    helpLink: "Talk to a person",
  },
  helpPanel: {
    title: "Talk to a person",
    // {number} is the tap-to-call link
    phone: "Call or text us at {number}.",
    phoneNumber: "(555) 010-0123",
    phoneLabel: "Demo number",
    hours: "Monday to Friday, 8 am to 6 pm Central.",
    hoursLabel: "Demo hours",
    crisis: "If you're in crisis, call or text {number} any time.",
    crisisNumber: "988",
    close: "Close",
  },
  // The four phases on the booking screens, ending at "You're booked"
  progress: {
    aboutYou: "About you",
    whatsGoingOn: "What's going on",
    yourProvider: "Your provider",
    book: "Book",
  },
  common: {
    back: "Back",
    continue: "Continue",
    somethingWentWrong: "Something went wrong on our side. Please try again.",
    tryAgain: "Try again",
    keepsHappening: "If it keeps happening, talk to a person.",
    fromLegion: "From Legion's current flow",
    demoNumber: "Demo number",
  },
  // Screen 1, with the start screen and coverage merged in
  join: {
    title: "Let's get you care",
    intro:
      "Answer a few quick questions, and you'll see a provider who's right for you. It takes a few minutes.",
    video: "All visits are by video.",
    aiNotice:
      "We use AI to help with some steps. You can talk to a person any time.",
    welcomeBack: "Welcome back. Pick up where you left off.",
    dateOfBirth: "Date of birth",
    dateOfBirthHint: "MM / DD / YYYY",
    inTexas: "Will you be in Texas for your visits?",
    yes: "Yes",
    no: "No",
    payMethod: "Do you have health insurance?",
    withInsurance: "Yes",
    selfPay: "No",
    plan: "Your insurance plan",
    planPlaceholder: "Choose your plan",
    planNotListed: "I don't see my plan",
    selfPayPrice:
      "Self-pay is $250 for your first visit and $150 for follow-up visits, charged after your visit.",
    selfPayMedicaid: "Do you have Medicaid or Medicare?",
    safety: "Are you thinking about harming yourself or others?",
    safetyHint: "If you answer yes, we'll show you how to get help right away.",
    hospital:
      "Have you been in the hospital for mental health or substance use in the past year?",
    hospitalHint:
      "This helps us make sure we can offer the right level of care.",
    errors: {
      dateOfBirth: "Please enter your date of birth as MM / DD / YYYY.",
      payMethod: "Please choose Yes or No.",
      required: "Please answer this question.",
      planNotListed: "Choose ‘Continue as self-pay’ or talk to a person to keep going",
    },
  },
  coverage: {
    covered:
      "You're covered. Your plan is in network. Most patients pay $0 to $40 a visit.",
    fullCostLater: "You'll see your full cost before you book.",
    simulated: "Demo: coverage check simulated",
    // The plan search (decided Oct 29), Claude Design's wording
    searchTitle: "Search for your plan",
    searchLabel: "Plan name",
    // {count} more plans match than are shown
    searchMore: "Keep typing to see {count} more",
    stillNotListed: "I still don’t see my plan",
    choosePlan: "Please choose your plan.",
    searchAgain: "Search again",
    notListed:
      "We couldn't find your plan. You can continue as self-pay, or talk to a person to check your plan.",
    continueSelfPay: "Continue as self-pay",
    talkToPerson: "Talk to a person",
  },
  // {number} is a tap-to-call link
  screenOut: {
    title: "Let's find you the right care",
    goBack: "Answered by mistake? Go back",
    samhsa:
      "SAMHSA's National Helpline: {number}. Free, confidential, 24/7, in English and Spanish.",
    samhsaNumber: "1-800-662-HELP (4357)",
    under18: [
      "Our care is for adults 18 and older, but we still want you to get the right support.",
      "A parent, guardian or your doctor can help with next steps.",
    ],
    under18Crisis: "If you need to talk to someone now, call or text {number} any time.",
    crisisNumber: "988",
    notInTexas: [
      "We can't see patients in your state yet.",
      "Your insurance card has a member services number that can help you find care in your area.",
    ],
    medicaidMedicare: [
      "We can't see patients with Medicaid or Medicare right now, including as self-pay.",
      "Your insurance card has a member services number that can help you find care that's covered.",
    ],
    hospitalStay: [
      "Based on your answer, a program with more support may suit you better than online visits.",
    ],
    hospitalSamhsa:
      "SAMHSA's National Helpline: {number}. Free, confidential, 24/7, in English and Spanish. They can help you find treatment near you.",
  },
  // Screen 2. Starter chip labels are the concern labels themselves
  whatsGoingOn: {
    title: "What's going on?",
    intro: "Tell us in your own words. A sentence or two is enough.",
    placeholder: "For example: I was diagnosed with ADHD and my medication ran out.",
    speak: "Speak",
    listening: "Listening… Tap to stop.",
    empty: "Please tell us a little more.",
    useForm: "Use a simple form instead",
    stillWorking: "Still working on it…",
    // {link} is "use a simple form instead"
    notUnderstood: "We didn't quite catch that. Try again, or {link}.",
    notUnderstoodLink: "use a simple form instead",
    formNote: "We're using a simple form for this step.",
    formConditions: "What would you like help with? Choose any that fit.",
    formNeed: "How can we help you?",
    needs: {
      medication_support: "I already have a diagnosis and need medication support",
      new_diagnosis_or_medication: "I'm looking for a new diagnosis or medication",
      not_sure: "I'm not sure, but I need help",
    },
  },
  // Legion's conditions list from their current flow, for the simple form and
  // the confirm screen's "+ Add", shown against the standard labels
  conditions: {
    ADHD: "ADHD",
    Anxiety: "Anxiety",
    Depression: "Depression",
    Sleep: "Insomnia & sleep",
    PTSD: "PTSD",
    OCD: "OCD",
    "Panic disorder": "Panic disorder",
    "Bipolar disorder": "Bipolar disorder",
    Other: "Other",
    "Not sure": "I'm not sure",
  },
  someoneElse: {
    title: "Is this for someone else?",
    body: "It sounds like you're looking for help for someone else. They'll need to sign up themselves, so their provider can talk with them directly.",
    safety: "If you're worried about their safety right now, call or text {number}.",
    safetyNumber: "988",
    forMe: "This is for me",
    talkToPerson: "Talk to a person",
  },
  // Screen 3
  confirm: {
    title: "Here's what we understood",
    intro: "Remove anything that's wrong, or add anything we missed.",
    remove: "Remove {item}",
    add: "+ Add",
    // One line, only for the concern it applies to. To confirm with Legion
    policy: {
      Anxiety: "We don't prescribe benzodiazepines over 1 mg a day.",
    },
    notDiagnosis: "This only repeats what you told us. It isn't a diagnosis.",
    diagnosed: "Have you been diagnosed with {item}?",
    // {item} in the diagnosis question, a fixed name for each label. Never
    // asked for "Other" or "Not sure"
    diagnosisNames: {
      ADHD: "ADHD",
      Anxiety: "anxiety",
      Depression: "depression",
      Sleep: "insomnia",
      PTSD: "PTSD",
      OCD: "OCD",
      "Panic disorder": "panic disorder",
      "Bipolar disorder": "bipolar disorder",
    },
    notSure: "Not sure",
    looksRight: "Looks right",
    startOver: "Start over",
    // One small row per eligibility surprise, before the same question as screen 1
    recheck: {
      stateLead: "You mentioned another state.",
      insuranceLead: "You mentioned Medicaid or Medicare.",
      hospitalLead: "You mentioned a hospital stay.",
      dateOfBirth: "Can you check your date of birth?",
    },
  },
  // Screen 4. {facts} are "treats {concern}", "takes your plan" (not for
  // self-pay) and "available {day}", joined with " · "
  provider: {
    title: "Recommended for you",
    reason: "Why we recommend {name}, {credential}: {facts}",
    treats: "treats {concern}",
    takesPlan: "takes your plan",
    available: "available {day}",
    demoLabel: "Demo: made-up provider",
    visitLength: "Video visit · about 60 minutes",
    pickTime: "Pick a time",
    seeMore: "See more providers",
    earlierTime: "Tell me if an earlier time opens",
    earlierTimeOn: "We'll let you know if an earlier time opens.",
    notificationLabel: "Demo: notification simulated",
    book: "Book {day} at {time}",
    slot: "{day}, {date} at {time}",
    noTimes: "We don't have open times for your plan right now.",
    talkToPerson: "Talk to a person",
    tellMeWhenTimesOpen: "Tell me when times open",
  },
  // Screen 5, the one-page checkout. The title and section headings are the
  // screen's and sections' names in the copy draft
  checkout: {
    title: "Book your visit",
    yourVisit: "Your visit",
    yourDetails: "Your details",
    payment: "Payment",
    visitLine: "{day}, {date} at {time} · {provider} · Video visit",
    insuredCost: "Estimated cost per visit: $0 to $40",
    selfPayCost: "Cost: $250 for your first visit, $150 for follow-up visits",
    insuredCharged: "When you're charged: for what insurance doesn't cover, about 5 days after your visit",
    selfPayCharged: "When you're charged: after your visit",
    freeToCancel: "Free to cancel up to 48 hours before",
    whatIfCancel: "What if I cancel?",
    cancelPolicy:
      "You can cancel or reschedule from your visit page. If it's 48 hours or more before your visit, there's no charge. If it's later, or you miss the visit, the fee is $250 for your first visit and $100 for follow-ups. Missing the visit means not joining within 10 minutes of the start.",
    detailsIntro: "So your provider knows who you are, and we can send you your visit details.",
    name: "First and last name",
    email: "Email",
    phone: "Mobile phone",
    // To confirm with Legion; the links need pages that don't exist yet
    notice:
      "By continuing, you agree to our Terms of Service and Privacy Policy. You can read our HIPAA Notice of Privacy Practices and how we use AI.",
    consent: "I consent to treatment by Legion Health providers.",
    emailTaken: "There's already an account with this email.",
    signIn: "Sign in to continue",
    differentEmail: "Use a different email",
    signInLabel: "Demo: sign-in simulated",
    notCharged: "You won't be charged now.",
    cardNumber: "Card number",
    expiry: "Expiry (MM/YY)",
    securityCode: "Security code",
    zip: "ZIP code",
    paymentLabel: "Demo: payment simulated. Use any made-up card number.",
    bookMyVisit: "Book my visit",
    errors: {
      name: "Please enter your first and last name.",
      email: "Please enter an email like name@example.com.",
      phone: "Please enter a 10-digit US phone number.",
      consent: "Please check the box to continue.",
      card: "We couldn't save this card. Please check the details and try again.",
    },
  },
  // Screen 6
  booked: {
    title: "You're booked",
    reminder: "We'll send you a reminder before your visit.",
    addToCalendar: "Add to calendar",
    google: "Google",
    apple: "Apple",
    outlook: "Outlook",
    goToVisit: "Go to my visit page",
    // The calendar event, from the confirmation line
    calendarTitle: "{provider} · Video visit",
  },
  // The portal's tabs (decided Oct 29). Profile is only an entry point for now
  portal: {
    nav: "Your portal",
    visit: "Visit",
    inbox: "Inbox",
    profile: "Profile",
  },
  // Screen 7
  visit: {
    title: "Your first visit",
    expectTitle: "What to expect",
    expect:
      "Your provider will ask about what's going on, your history and any medications. Plan for about 60 minutes somewhere quiet and private.",
    reschedule: "Reschedule",
    cancel: "Cancel visit",
    checkInTitle: "Optional: pre-visit check-in",
    checkInBody: "About 5 minutes. Your provider can spend more of your visit on you. You can skip it.",
    checkInWhen: "Do it any time before your visit. Earlier gives your provider time to read it.",
    startCheckIn: "Start check-in",
    // "72 hours" is decided; the next two follow it, waiting for Lily's OK
    skipTo: {
      "72h": "Demo: skip to 72 hours",
      "24h": "Demo: skip to 24 hours",
      "1h": "Demo: skip to 1 hour",
    },
    // After "Mark no-show". The demo visit is a first visit, so only its fee
    // shows (decided Oct 29); the wording of the fee line waits for Lily's OK
    missed: "You missed your visit. Want to book a new time?",
    missedFee: "The fee for a missed first visit is $250.",
    // Milestone cards (decided). The milestone names
    // and the cancel check are placeholders, waiting for Lily's OK
    completedTag: "Completed",
    milestoneBooked: "Visit booked",
    milestoneCheckIn: "Check-in done",
    milestoneFirstVisit: "First visit",
    // After the visit (Claude Design's wording)
    done: "Your provider will send your next steps to your inbox.",
    goToInbox: "Go to my inbox",
    cancelCheck: "Cancel this visit?",
    cancelYes: "Yes, cancel it",
    keep: "Keep my visit",
    demoControls: "Demo controls",
  },
  // Screens 8 and 11, in the Inbox tab. {firstName}, {provider}, {day} and
  // {time} are filled in; {link} is the link in the message
  inbox: {
    title: "Inbox",
    label: "Also sent to your email and phone (demo)",
    inviteSubject: "Your visit on {day}: a 5-minute check-in",
    invite:
      "Hi {firstName}, your visit with {provider} is on {day} at {time}. Want to save time in your visit? Do a 5-minute check-in: {link}. We use AI to help with some steps. You can talk to a person any time.",
    reminder24h: "Reminder: your visit with {provider} is tomorrow at {time}. Need to change it? {link}",
    reminder1h: "Your visit starts in 1 hour. Join here: {link}",
    joinVisit: "Join visit",
    // Placeholder, waiting for Lily's OK
    empty: "No messages yet.",
  },
  // Screen 12
  demo: {
    title: "Demo controls",
    markCompleted: "Mark visit completed",
    markNoShow: "Mark no-show",
    note: "Demo only. This records how the visit went, so the funnel runs from start to finish.",
    markedCompleted: "Visit marked completed (demo)",
    markedNoShow: "Visit marked as a no-show (demo)",
  },
  // After the visit is marked completed, never during onboarding (decided).
  // Claude Design's wording, with the review ask after a 9 or 10
  nps: {
    question: "How was your first visit?",
    low: "Not good",
    high: "Great",
    reviewAsk: "Thank you! Would you share a short review? It helps other people find care.",
    writeReview: "Write a review",
    notNow: "Not now",
    thanks: "Thanks for telling us. It helps us get better.",
    // Placeholder: there's no real review page in the prototype
    reviewDemo: "Demo: this would open Legion's review page.",
    close: "Close",
  },
  // Placeholder screen, waiting for Lily's OK
  profile: {
    title: "Profile",
    notBuilt: "Demo: changing your details isn't part of this prototype.",
  },
  crisis: {
    title: "Help is available right now",
    fromText: "We want to make sure you're okay.",
    immediateDanger: "If you're in immediate danger, call 911.",
    lifeline:
      "Call or text 988 to reach the 988 Suicide & Crisis Lifeline, any time. You can also chat at {link}.",
    lifelineLink: "988lifeline.org",
    legion: "You can also talk to a person at Legion: {number}.",
    legionNumber: "(555) 010-0123",
    call988: "Call 988",
    text988: "Text 988",
    call911: "Call 911",
    talkToPerson: "Talk to a person",
    safeNow: "I'm safe right now and want to keep going",
    safeNowError: "Please check the box to continue.",
    // When someone may be in danger right now. To confirm with Legion's clinical team
    immediate: {
      title: "Call 911 now",
      body: "If you've taken something or you're in danger right now, call 911.",
      call911: "Call 911",
      callOrText988: "Call or text 988",
    },
    // When someone is being hurt by someone else. To confirm with Legion's clinical team
    beingHurt: {
      title: "Help is available",
      hotline:
        "The National Domestic Violence Hotline is free and open 24/7, with help in Spanish. Call 1-800-799-7233 or text START to 88788.",
      callHotline: "Call the hotline",
      textHotline: "Text the hotline",
      leave: "Leave this page",
    },
  },
} as const;
