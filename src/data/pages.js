export const SITE = {
  origin: 'https://brainrotchecker.com',
  defaultTitle: 'BrainRotChecker — Focus check and attention practice',
  defaultDescription:
    'A free browser tool that checks short-form scrolling habits, times a simple reaction task, and offers nine short attention games. For entertainment and habit reflection, not a medical test.',
}

const UPDATED = '5 October 2026'

export const PAGES = [
  {
    id: 'guides',
    screen: 'guides',
    path: '/guides',
    nav: 'Guides',
    title: 'Guides — BrainRotChecker',
    description:
      'Plain-language guides to the BrainRotChecker habit quiz, reaction task, score tiers, and nine attention games.',
    kicker: 'Help',
    heading: 'Guides',
    updated: UPDATED,
    summary: 'How the check works, what the numbers mean, and how to use the games.',
    sections: [
      {
        paragraphs: [
          'BrainRotChecker is a small practice tool for people who feel pulled around by short videos, tab switching, and phone checks. These pages explain what the site actually does, how the score is calculated, and how to use the games without treating a joke tier name as a diagnosis.',
          'The interface of the quiz and games is available in English, Hindi, Kannada, Tamil, Telugu, and Malayalam. These written guides are in English.',
        ],
      },
    ],
  },
  {
    id: 'about',
    screen: 'about',
    path: '/about',
    nav: 'About',
    title: 'About BrainRotChecker',
    description:
      'What BrainRotChecker is, who it is for, and what the habit check does not measure.',
    kicker: 'About',
    heading: 'About BrainRotChecker',
    updated: UPDATED,
    summary: 'An independent habit mirror and practice arcade, not a clinic.',
    sections: [
      {
        heading: 'What this site is',
        paragraphs: [
          'BrainRotChecker (brainrotchecker.com) is a free website you use in the browser. No account is required. It asks seven questions about everyday screen habits, times how quickly you tap a target across five short rounds, and then offers nine mini-games you can replay.',
          'People use it when they notice that a “five minute” scroll turned into half an hour, or that a long video feels hard to finish. The point is to notice the pattern and practice one short round of attention, memory, or pacing. It is a mirror and a set of drills, not a lab and not a treatment plan.',
        ],
      },
      {
        heading: 'What it is not',
        paragraphs: [
          'The tier names are jokes. “Clean sigma”, “mildly glazed”, “skibidi syndrome”, and “full Ohio mode” are labels on a points total. They are not diagnoses of ADHD, anxiety, depression, addiction, or any other medical or psychological condition. A high score does not mean something is wrong with you. A low score does not mean your habits are healthy in every part of life.',
          'The reaction task is a tap-when-you-see-it average on whatever device you are holding. Sleep, caffeine, a noisy room, a trackpad versus a thumb, and simple practice all change the number. It is a personal baseline you can repeat, not a clinical reaction-time test.',
        ],
      },
      {
        heading: 'How the product is put together',
        paragraphs: [
          'The flow is deliberate and short. The quiz comes first so the score reflects what you say about your week, not only how fast you tap. The reaction task comes second so there is one measured action, not only self-report. The arcade is optional practice after that. Results that compare a “before” tier with an “after” tier unlock once you have finished at least three different games. Scores from the arcade can move the displayed tier toward a lower number. They never push it higher.',
          'Quiz answers, reaction points, game bests, the daily streak, and your preferred reminder hour stay in this browser’s local storage. An optional daily reminder, off unless you turn it on, stores an anonymous push endpoint and the hour you picked. The site uses Google Analytics for aggregated usage and Google AdSense for labeled ads at natural breaks. Ads are not shown while a mini-game is in progress. Details are on the privacy policy.',
        ],
      },
      {
        heading: 'Who runs it',
        paragraphs: [
          'BrainRotChecker is an independent project. There is no clinic, employer, or school behind the score. Questions, corrections, and partnership notes can go to vkdarunacharya@gmail.com.',
          'The site is maintained as a product: the quiz, the games, the scoring notes on this site, and the privacy policy are updated when the behaviour of the tool changes. If a page and the game ever disagree, the game’s current rules win, and the page should be corrected.',
        ],
      },
    ],
  },
  {
    id: 'how',
    screen: 'how',
    path: '/how-it-works',
    nav: 'How it works',
    title: 'How the BrainRotChecker focus check works',
    description:
      'The seven habit questions, the five-round reaction task, and how those two scores become a tier.',
    kicker: 'Method',
    heading: 'How the check works',
    updated: UPDATED,
    summary: 'Seven habit questions plus a five-round tap task, then an optional arcade.',
    sections: [
      {
        heading: 'Part 1 — habit quiz',
        paragraphs: [
          'The quiz is seven questions. Each answer is worth 0, 1, 2, or 3 points. Zero is the calmer end of that question. Three is the more overloaded end. The quiz total is the sum, so it runs from 0 to 21.',
          'The questions are specific on purpose. They ask how many hours you spend on TikTok, Reels, or Shorts; whether you can watch something longer than five minutes without skipping; how many browser tabs are open; when you last read a book rather than a feed; what you do with ten free minutes; how you would rate your own attention; and how two hours without Wi-Fi would feel. They are prompts for honesty, not a validated psychological scale.',
        ],
      },
      {
        heading: 'Part 2 — reaction task',
        paragraphs: [
          'After the quiz, a target (a brain icon) appears in a random spot inside the play area. You tap it as soon as you see it. That happens for five rounds. The site averages your five times in milliseconds.',
          'The average becomes a second score, separate from the quiz: under 300 ms is 0 points, 300–499 ms is 3, 500–699 ms is 6, and 700 ms or slower is 9. Faster tapping adds fewer points. The task is there so the result is not only a story you tell about yourself. It is still a rough home measurement. Take it on the same kind of device if you want to compare two days.',
        ],
      },
      {
        heading: 'Putting the two scores together',
        paragraphs: [
          'The diagnosis screen adds the quiz points and the reaction points. That total is mapped to a tier: 0–7 is tier 0, 8–15 is tier 1, 16–22 is tier 2, and 23 or above is tier 3. The highest possible total is 30 (21 from the quiz and 9 from the reaction task).',
          'You can retake the check. The new quiz and reaction scores replace the ones stored in this browser. Nothing is sent to an account, because there is no account.',
        ],
      },
      {
        heading: 'Part 3 — arcade, only if you want it',
        paragraphs: [
          'The arcade is nine short games: a focus clicker, memory match, a sequence repeat, speed arithmetic, paced breathing with a tap, word unscramble, a colour-versus-word tap, odd-one-out, and tapping numbers in order. Each game keeps the best score on this device.',
          'A results view that compares your diagnosis tier with a later tier opens after three different games. If those games add up to at least 48 points, the displayed tier moves one step toward tier 0. If you have played at least six games and the points add up to at least 160, it moves two steps. It will not move past tier 0, and a weak arcade session does not make the tier worse. That rule is a scoring choice inside this product. It is not a claim that three games repaired anyone’s attention.',
        ],
      },
    ],
  },
  {
    id: 'score',
    screen: 'score',
    path: '/what-your-score-means',
    nav: 'Your score',
    title: 'What your BrainRotChecker score means',
    description:
      'How to read the quiz points, reaction points, joke tier names, and the before-and-after arcade result.',
    kicker: 'Score',
    heading: 'What your score means',
    updated: UPDATED,
    summary: 'A points total with a joke label, saved only in this browser.',
    sections: [
      {
        heading: 'Read the number before the nickname',
        paragraphs: [
          'The screen leads with a nickname because the check is meant to be easy to share with a friend. The useful part is the split underneath: quiz points, reaction points, and the total. Two people on the same tier can have very different weeks. Someone who rarely opens short-video apps but taps slowly on a laptop is not in the same situation as someone who lives in Reels and taps quickly. The total hides that. The split shows it.',
          'Tier 0 covers totals from 0 to 7. The label is “Clean sigma”. In plain words: your answers and your tap speed sat at the calmer end of this particular check. Tier 1 covers 8 to 15 (“Mildly glazed”): a mix, which is where a lot of ordinary phone use lands. Tier 2 covers 16 to 22 (“Skibidi syndrome”): the answers piled up toward heavier short-form use, harder long video, or a slower tap average. Tier 3 is 23 to 30 (“Full Ohio mode”): most answers were at the top of the scale, or a slow reaction score pushed a high quiz over the line.',
        ],
      },
      {
        heading: 'What a change from last time means',
        paragraphs: [
          'If you have finished the check before on this browser, the results view can say whether the latest total is better, worse, or the same as the previous visit stored locally. “Better” here only means a lower points total or a lower tier on this site’s scale. It does not measure schoolwork, mood, or sleep.',
          'A single slower reaction day is easy to get: low battery, a cold thumb, notifications arriving mid-round, or playing in bed. If you care about the comparison, retake it in similar conditions rather than treating one noisy round as a trend.',
        ],
      },
      {
        heading: 'What the arcade does to the tier',
        paragraphs: [
          'The arcade adjustment is optional and one-directional. Until three different games have a saved score, the results tier stays equal to the diagnosis tier. After that, points can lower the tier by one step, or by two steps if both the six-game and 160-point conditions are met. Playing badly does not increase the tier. Reset progress clears these saved scores on this device.',
          'Share cards and challenge links encode a result so a friend can open it. They are a snapshot for that link, not a public profile. You do not get a username.',
        ],
      },
      {
        heading: 'When not to use the score',
        paragraphs: [
          'Do not use this score to decide whether you or someone else needs professional help. If attention problems are getting in the way of school, work, safety, or relationships, talk to a qualified clinician. Do not use it to rank children, employees, or students. The questions assume a person is describing their own phone and browser habits.',
          'Do not treat a friend’s challenge result as a competition about intelligence. The quiz rewards reporting less short-form video and a faster tap. That is a narrow game. It leaves out reading for work, exercise, conversation, and plenty of screen time that is useful.',
        ],
      },
    ],
  },
  {
    id: 'practice',
    screen: 'practice',
    path: '/focus-practice',
    nav: 'Practice',
    title: 'A simple focus practice you can repeat',
    description:
      'How to use the daily drill and the nine games as a short practice, plus habit limits that do not require an app.',
    kicker: 'Practice',
    heading: 'A small practice you can repeat',
    updated: UPDATED,
    summary: 'One short session, the same device, and a few limits on the feed.',
    sections: [
      {
        heading: 'Use one short session',
        paragraphs: [
          'The daily drill picks one arcade game and expects about a minute. That is the session worth repeating. A streak is stored on this device so you can see whether you came back. The streak is not a moral score. Missing a day resets the count. It does not delete your best scores.',
          'If you want a reminder, turn it on and pick an hour. It stays off until you do that. The site can send an anonymous browser notification at that hour, or show a note the next time you open the site if lock-screen notifications are not available. Turn it off in the same card.',
        ],
      },
      {
        heading: 'Match the game to the slip',
        paragraphs: [
          'If the failure mode is “I tap whatever appears”, play the colour-versus-word game or the focus clicker and practise the pause before the tap. If the failure mode is “I lose the thread of a sequence”, play Pattern Simon or Tap Order. If you reread the same sentence, Memory Match and Word Scramble are closer to holding a few items in mind. Speed Math is mental arithmetic against a clock. It is not a maths course. Breath Focus asks you to follow a circle and tap when the prompt appears. It is a pacing drill, not a therapy protocol.',
          'Stop while the round still feels finishable. The games are short because long sessions of “attention training” often turn into another feed. One or two games is a practice. Clearing all nine in a single sitting is optional, not a target.',
        ],
      },
      {
        heading: 'Limits that are not inside the site',
        paragraphs: [
          'The check will keep describing the same habit if the habit does not change. A few limits are more direct than any game: charge the phone outside the bedroom, take short-video apps off the first home screen, set a cap you will actually notice, and decide the next concrete task before you unlock the phone. Ten free minutes was one of the quiz questions because that gap is where a scroll usually starts.',
          'Longer than five minutes was another question. If full videos feel impossible, pick one specific video you already intended to watch and finish it before opening a short-form app. That is a behaviour, not a personality type.',
          'Sleep, food, and a walk change attention as much as any mini-game. This site does not measure them and does not give medical advice about them.',
        ],
      },
      {
        heading: 'How to tell if it is doing anything',
        paragraphs: [
          'Look at something outside the tier. Examples that are easy to count: how many times you opened a short-form app yesterday, whether you finished one long video, whether a study block lasted the length you set. Use the site’s before-and-after line only as a side note. If the tier improves and the real habit does not, believe the habit.',
        ],
      },
    ],
  },
  {
    id: 'games',
    screen: 'games-guide',
    path: '/arcade-games',
    nav: 'The games',
    title: 'What each BrainRotChecker arcade game asks you to do',
    description:
      'A plain description of all nine BrainRotChecker mini-games and the kind of attention each one asks for.',
    kicker: 'Arcade',
    heading: 'What each game asks you to do',
    updated: UPDATED,
    summary: 'Nine short games, each with one job.',
    sections: [
      {
        heading: 'Focus Game',
        paragraphs: [
          'Items appear and you click the ones that count and avoid the ones that do not, across three rounds. The job is selective attention: act on the target, withhold the click on the lookalike. Best score on this device is kept.',
        ],
      },
      {
        heading: 'Memory Match',
        paragraphs: [
          'Cards start face down. You flip two at a time and try to find all eight emoji pairs before the timer ends. The job is holding a location in mind for a few seconds while you look elsewhere.',
        ],
      },
      {
        heading: 'Pattern Simon',
        paragraphs: [
          'A sequence of tiles lights up. You repeat it, and the sequence grows when you are right. The job is short-term order: first, second, third, without rushing the early taps and losing the end.',
        ],
      },
      {
        heading: 'Speed Math',
        paragraphs: [
          'Twenty quick arithmetic questions, each with its own short timer. The job is producing an answer while the clock is visible. It rewards fluent facts, not word problems or algebra.',
        ],
      },
      {
        heading: 'Breath Focus',
        paragraphs: [
          'A circle guides about four breath cycles, roughly half a minute. When TAP appears, you tap close to that moment. Points depend on how near you are to the cue. The job is waiting for a signal instead of tapping continuously. It is not a breathing treatment and it does not measure lung function.',
        ],
      },
      {
        heading: 'Word Scramble',
        paragraphs: [
          'A word is scrambled and you choose the unscrambled answer before the timer ends. The job is recognising a word from a disordered set of letters under a time limit.',
        ],
      },
      {
        heading: 'Colour vs Word',
        paragraphs: [
          'A colour word is painted in a different ink. You tap the ink colour, not the word you can read. The job is inhibition: the automatic read is the wrong response. This is a casual version of a well-known classroom demo. It is not a clinical Stroop test, and the site does not interpret your misses as a symptom.',
        ],
      },
      {
        heading: 'Odd One Out',
        paragraphs: [
          'A grid of emoji appears and one of them differs. You find it within the round timer, across a series of rounds. The job is visual search: scan on purpose instead of staring until the difference pops out.',
        ],
      },
      {
        heading: 'Tap Order',
        paragraphs: [
          'Numbers are scattered and you tap them from 1 through 6 before time runs out, for several rounds. The job is a short plan: find the next number without tapping the one your eye landed on first.',
        ],
      },
      {
        heading: 'Scores and the daily pick',
        paragraphs: [
          'Each game stores a best score in this browser. Playing again replaces that best only when the new run is higher. The daily drill points at one of these games so the practice has a default instead of a menu decision. You can still open the full arcade and choose.',
          'Ads, when the site is serving them, sit outside the active round. You do not need to interact with an ad to finish a game or to see a result.',
        ],
      },
    ],
  },
  {
    id: 'faq',
    screen: 'faq',
    path: '/faq',
    nav: 'FAQ',
    title: 'BrainRotChecker FAQ',
    description:
      'Answers about accounts, saved scores, medical claims, languages, reminders, and how to contact BrainRotChecker.',
    kicker: 'FAQ',
    heading: 'Questions people ask',
    updated: UPDATED,
    summary: 'Accounts, storage, medical claims, languages, and contact.',
    sections: [
      {
        heading: 'Do I need an account?',
        paragraphs: [
          'No. The site does not ask for a name, email, or phone number to take the check or play. A challenge card can include a display name you type, and that name is part of the share link you create. You can leave it blank or use a nickname.',
        ],
      },
      {
        heading: 'Where is my score saved?',
        paragraphs: [
          'In this browser, in local storage. Clearing site data, using a private window, or switching browsers starts you over. The operator does not have a database of your quiz answers.',
        ],
      },
      {
        heading: 'Is this a medical or psychological test?',
        paragraphs: [
          'No. It is an entertainment and habit-reflection tool. The questions were written for this site. They are not a published clinical instrument. The tier names are jokes. If you are worried about your attention, mood, or substance use, use a qualified professional, not this score.',
        ],
      },
      {
        heading: 'Why did my friend’s score differ on the same Wi-Fi?',
        paragraphs: [
          'Because the quiz is self-report and the reaction task depends on the device and the person. Two phones, or a phone and a laptop, will not match. The check is not measuring the network.',
        ],
      },
      {
        heading: 'Which languages does the site use?',
        paragraphs: [
          'The quiz, games, and main buttons support English, Hindi, Kannada, Tamil, Telugu, and Malayalam. You can switch language from the control on the page. These longer guides are written in English.',
        ],
      },
      {
        heading: 'Can I turn reminders off?',
        paragraphs: [
          'Yes. Reminders are off until you enable them. The same card turns them off. Turning them off stops further pings from this site. Browser notification permission is controlled in your browser or phone settings.',
        ],
      },
      {
        heading: 'How do I correct something or ask a question?',
        paragraphs: [
          'Email vkdarunacharya@gmail.com. If a guide disagrees with what the game just did, say which page and what you saw. The scoring rules on the “How it works” page are the ones implemented in the current version: quiz 0–21, reaction 0, 3, 6, or 9, tiers at 7, 15, and 22, arcade adjustment only after three games.',
        ],
      },
    ],
  },
]

const byId = Object.fromEntries(PAGES.map((page) => [page.id, page]))

export function getPageByScreen(screen) {
  return PAGES.find((page) => page.screen === screen) ?? null
}

export function getGuideCards() {
  return PAGES.filter((page) => page.id !== 'guides')
}

export function getRelatedLinks(pageId) {
  return PAGES.filter((page) => page.id !== pageId).map((page) => ({
    path: page.path,
    screen: page.screen,
    label: page.nav,
  }))
}

export const HOME_SUMMARY = {
  path: '/',
  title: SITE.defaultTitle,
  description: SITE.defaultDescription,
  kicker: 'BrainRotChecker',
  heading: 'Train your focus before your feed trains you.',
  updated: UPDATED,
  sections: [
    {
      paragraphs: [
        'BrainRotChecker is a free browser tool. A seven-question habit quiz and a five-round reaction task produce a personal points total. Nine short games are there if you want to practice afterwards. No account is required. Scores stay in this browser.',
        'The tier nicknames are jokes for sharing. They are not a medical diagnosis, not an intelligence score, and not a clinical reaction-time test. Read the method before you treat the number as more than a snapshot of this check.',
      ],
    },
    {
      heading: 'Start here',
      paragraphs: [
        'Take the check, or read how the score is built. The written guides cover the quiz, the reaction scoring, each arcade game, and a small daily practice.',
        'How it works: seven questions scored 0–3, a five-round tap task scored 0, 3, 6, or 9, and tiers at totals 7, 15, and 22. Your score: the nickname is a joke; the useful part is the quiz and reaction split, saved only in this browser. The games: nine short drills, from a focus clicker to a colour-versus-word tap. Practice: one daily game, plus limits on the feed that the site cannot do for you. About and the FAQ state who runs the site and what it refuses to claim.',
      ],
    },
  ],
  links: [
    { path: '/quiz', label: 'Start the check' },
    { path: '/how-it-works', label: 'How it works' },
    { path: '/what-your-score-means', label: 'What the score means' },
    { path: '/arcade-games', label: 'The nine games' },
    { path: '/focus-practice', label: 'Practice' },
    { path: '/about', label: 'About' },
    { path: '/faq', label: 'FAQ' },
    { path: '/privacy', label: 'Privacy policy' },
  ],
}

export function withRelatedLinks(page) {
  return {
    ...page,
    links: page.links ?? getRelatedLinks(page.id),
  }
}

export function allPrerenderPages() {
  return [HOME_SUMMARY, ...PAGES.map(withRelatedLinks)]
}

export { byId }
