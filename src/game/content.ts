export type Story = {
  title: string;
  status: "confirmed" | "fictional-draft" | "game-detail";
  text: string;
};
export const stories: Record<string, Story> = {
  matcha: {
    title: "My usual kind of pause",
    status: "confirmed",
    text: "I visited Caffè Trieste during my SF internship summer. My memory here is ordering a matcha latte. This little cup is a nod to that visit—a personal recollection, rather than a promise about today’s menu.",
  },
  counter: {
    title: "A little morning warmth",
    status: "game-detail",
    text: "The espresso machine hums, cups wait on the warmer, and a green latte rests on the counter. Take your time. There’s a table by the window if you’d like to stay a while.",
  },
  seat: {
    title: "A seat by the window",
    status: "game-detail",
    text: "You settle into a chair. Outside, the neighborhood is waking up one window at a time. Bella has found a very good place to rest nearby. There’s no next thing you need to do.",
  },
  books: {
    title: "One more shelf",
    status: "fictional-draft",
    text: "Imagine ducking into the bookstore with no title in mind. A slim book catches my eye, then another. For a moment, the nicest thing about the city is having nowhere else I need to be.",
  },
  poetry: {
    title: "Room for a few words",
    status: "game-detail",
    text: "Poetry, essays, paperbacks with well-loved corners. These invented book spines are here for the pleasure of browsing. No purchase required, no reading list to finish.",
  },
  travel: {
    title: "Elsewhere, from here",
    status: "game-detail",
    text: "A shelf of imagined travel books: Fog Atlas, Small Walks, The Long Way Home. Sometimes a whole afternoon can fit between two covers.",
  },
  alley: {
    title: "Between two doorways",
    status: "fictional-draft",
    text: "Imagine pausing in Jack Kerouac Alley. The street feels a little farther away here. I look up at the walls, then down at the pavement, and let the city carry on around me.",
  },
  vesuvio: {
    title: "A room full of color",
    status: "game-detail",
    text: "Amber windows, patterned tiles, pictures tucked into every corner. This small room is a creative interpretation of Vesuvio. Its morning access is game fiction; it does not describe real business hours.",
  },
  view: {
    title: "A city worth the climb",
    status: "fictional-draft",
    text: "Imagine reaching the top of Telegraph Hill a little out of breath. The bay appears through the morning haze. From up here, all those streets become a patchwork of places I still want to know.",
  },
  tower: {
    title: "Above the rooftops",
    status: "game-detail",
    text: "Step into this imagined observation room and look toward the bay. Coit Tower’s familiar silhouette anchors the hill outside. This room and the route up are compressed artistic interpretations.",
  },
  bench: {
    title: "A perfectly good detour",
    status: "game-detail",
    text: "A little green bench, a sleepy pigeon, and the soft rustle of leaves. Bella seems happy to stop here. You can pet her any time with P or the heart button.",
  },
  flowers: {
    title: "Someone’s small garden",
    status: "game-detail",
    text: "A few terracotta pots brighten the sidewalk. Even in the fog, someone has made room for flowers. This is an invented detail in our little neighborhood.",
  },
};
export const statusLabel = {
  confirmed: "A real memory",
  "fictional-draft": "Imagined scene · draft for review",
  "game-detail": "A detail in this little world",
};
