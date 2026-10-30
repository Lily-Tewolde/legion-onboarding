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
