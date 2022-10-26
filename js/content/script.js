/*
[INTRO]
Long ago, deep in the far reaches of space, 

there lived a young boy known only as “Kicker”. 

In his youth, Kicker discovered he had immense, near-infinite power 

- enough power to destroy the world around him 

- and even worlds beyond his own. 

To keep his loved ones safe, Kicker isolated himself to train every day, hoping he could control his powers before they harmed anyone else.

But in his absence, a dark force crept over their galaxy. 

The Agents of the Cosmos - followers of the Big Comet - were determined to take control of every planet across the universe.

Now Kicker must emerge from his training to defend his home

Was his training enough? 

Can he control his powers and save the galaxy? 

Or will he only destroy himself and everyone around him?

Is he powerful enough to become … 

[cut to title screen]

COMET KICKER
*/

/*
[ENDING]
  With the Big Comet defeated, Kicker saved his home. [IMAGE: Big Comet being destroyed]

  Kicker returned to his family, fully in command of his own power. [IMAGE: Kicker returning to his family (reversed from intro)]

  He had proven he could control his powers and defeat any evil that lurks deep in the galaxy. [IMAGE: shot of space, same as the beginning]

  He no longer had to be separated from his loved ones, no longer scared that he'd hurt them all. [IMAGE: same as outro 2]

  Finally, he was safe. [IMAGE: Kicker surrounded by his family, smiling]
*/

const BEAT = {
  title: "",
  text: {
    en: "",
    es: "",
    fr: "",
    zh: "",
  },
  image: "",
  music: "",
  speed: 3,
};
const INTRO_SCRIPT = [
  {
    ...BEAT,
    text: {
      en: "Long ago, deep in the far reaches of space,",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_1",
  },
  {
    ...BEAT,
    text: {
      en: "there lived a young boy known only as 'Kicker'.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_2",
  },
  {
    ...BEAT,
    text: {
      en: "In his youth, Kicker discovered he had immense, near-infinite power -",
      es: "",
      fr: "",
      zh: "",
    },
  },
  {
    ...BEAT,
    text: {
      en: "- power so great it could destroy the world around him -",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_3",
  },
  {
    ...BEAT,
    text: {
      en: "- and cause great harm to the people he loves.",
      es: "",
      fr: "",
      zh: "",
    },
  },
  {
    ...BEAT,
    text: {
      en: "To keep his loved ones safe, Kicker isolated himself to train every day.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_4",
  },
  {
    ...BEAT,
    text: {
      en: "He hoped to control his powers before he could hurt anyone.",
      es: "",
      fr: "",
      zh: "",
    },
  },
  {
    ...BEAT,
    text: {
      en: "But in his absence, a dark force crept over their galaxy.",
      es: "",
      fr: "",
      zh: "",
    },
    speed: 2,
    image: "intro_5",
  },
  {
    ...BEAT,
    text: {
      en: "The Agents of the Cosmos - followers of the Big Comet - were determined to take control of the universe.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_6",
  },
  {
    ...BEAT,
    text: {
      en: "Now, Kicker must emerge from his training and defend his home.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_7",
  },
  {
    ...BEAT,
    text: {
      en: "But was his training enough?",
      es: "",
      fr: "",
      zh: "",
    },
    speed: 4,
    image: "intro_8",
  },
  {
    ...BEAT,
    text: {
      en: "Can he control his powers and save the galaxy?",
      es: "",
      fr: "",
      zh: "",
    },
    speed: 4,
  },
  {
    ...BEAT,
    text: {
      en: "Or will he only destroy himself and everyone around him?",
      es: "",
      fr: "",
      zh: "",
    },
    speed: 4,
  },
  {
    ...BEAT,
    text: {
      en: "Is he powerful enough to become … ",
      es: "",
      fr: "",
      zh: "",
      speed: 1,
    },
    image: "intro_9",
  },
];
const OUTRO_SCRIPT = [
  {
    ...BEAT,
    text: {
      en: " With the Big Comet defeated, Kicker saved his home.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "outro_1",
  },
  {
    ...BEAT,
    text: {
      en: "Kicker returned to his family, fully in command of his own power.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "outro_2",
  },
  {
    ...BEAT,
    text: {
      en: "He had proven he could control his powers and defeat any evil that lurks deep in the galaxy.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "intro_1",
  },
  {
    ...BEAT,
    text: {
      en: "He no longer had to be separated from his loved ones, no longer scared that he'd hurt them all.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "outro_2",
  },
  {
    ...BEAT,
    text: {
      en: "Finally, he was safe.",
      es: "",
      fr: "",
      zh: "",
    },
    image: "outro_3",
  },
];