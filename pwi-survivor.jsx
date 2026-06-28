import { useState, useEffect } from "react";

// ─── Grade math (internal only) ───────────────────────────────────────────────
const GRADE_PTS = [
  { max: 10,  pts: 7 }, { max: 100, pts: 5 }, { max: 200, pts: 4 },
  { max: 300, pts: 3 }, { max: 400, pts: 2 }, { max: 999, pts: 1 },
];
const pts       = (rank) => (GRADE_PTS.find((g) => rank <= g.max) || GRADE_PTS[5]).pts;
const teamScore = (team) => team.reduce((s, w) => s + pts(w.rank), 0);
const rankColor = (rank) => {
  if (rank <= 10)  return "#FFD700"; if (rank <= 100) return "#00e554";
  if (rank <= 200) return "#3da9fc"; if (rank <= 300) return "#ff9d00";
  if (rank <= 400) return "#f54748"; return "#6c6c7e";
};
const rankGlow = (rank) => {
  if (rank <= 10)  return "rgba(255,215,0,0.45)";   if (rank <= 100) return "rgba(0,229,84,0.35)";
  if (rank <= 200) return "rgba(61,169,252,0.35)";   if (rank <= 300) return "rgba(255,157,0,0.35)";
  if (rank <= 400) return "rgba(245,71,72,0.35)";    return "rgba(108,108,126,0.2)";
};

// ─── Finisher / Submission database ──────────────────────────────────────────
// fin = finishers (pin), sub = submissions (tap-out)
const FINISHERS = {
  "John Cena":           { fin: ["AA"],                             sub: ["STF"] },
  "Kurt Angle":          { fin: ["Olympic Slam"],                   sub: ["Ankle Lock"] },
  "Bobby Lashley":       { fin: ["Spear"],                          sub: ["Hurt Lock"] },
  "Randy Orton":         { fin: ["RKO", "Punt Kick"],               sub: [] },
  "Edge":                { fin: ["Spear"],                          sub: [] },
  "Hulk Hogan":          { fin: ["Leg Drop"],                       sub: [] },
  "Randy Savage":        { fin: ["Diving Elbow Drop"],              sub: [] },
  "Jake Roberts":        { fin: ["DDT"],                            sub: [] },
  "Sting":               { fin: ["Scorpion Death Drop"],            sub: ["Scorpion Deathlock"] },
  "Ted DiBiase":         { fin: ["Million Dollar Dream"],           sub: [] },
  "Bob Holly":           { fin: ["Alabama Slam"],                   sub: [] },
  "Hardcore Holly":      { fin: ["Alabama Slam"],                   sub: [] },
  "Rick Rude":           { fin: ["Rude Awakening"],                 sub: [] },
  "Bret Hart":           { fin: [],                                 sub: ["Sharpshooter"] },
  "The Rock":            { fin: ["Rock Bottom"],                    sub: [] },
  "Roman Reigns":        { fin: ["Spear"],                          sub: [] },
  "Triple H":            { fin: ["Pedigree"],                       sub: [] },
  "Hunter Hearst Helmsley": { fin: ["Pedigree"],                    sub: [] },
  "Chris Jericho":       { fin: ["Codebreaker"],                    sub: ["Walls of Jericho"] },
  "Steve Austin":        { fin: ["Stone Cold Stunner"],             sub: [] },
  "Stone Cold Steve Austin": { fin: ["Stone Cold Stunner"],         sub: [] },
  "Batista":             { fin: ["Batista Bomb"],                   sub: [] },
  "Cody Rhodes":         { fin: ["Cross Rhodes", "Cody Cutter", "Disaster Kick"], sub: [] },
  "Seth Rollins":        { fin: ["Curb Stomp", "Pedigree"],         sub: [] },
  "Rhea Ripley":         { fin: ["Riptide"],                        sub: ["Prism Trap"] },
  "Sami Zayn":           { fin: ["Helluva Kick", "Blue Thunder Bomb"], sub: [] },
  "Kevin Owens":         { fin: ["Pop-Up Powerbomb", "Stunner"],    sub: [] },
  "AJ Styles":           { fin: ["Styles Clash", "Phenomenal Forearm"], sub: ["Calf Crusher"] },
  "LA Knight":           { fin: ["BFT"],                            sub: [] },
  "Eli Drake":           { fin: ["BFT"],                            sub: [] },
  "Becky Lynch":         { fin: ["Manhandle Slam"],                 sub: ["Dis-arm-her"] },
  "Shelton Benjamin":    { fin: ["Paydirt"],                        sub: [] },
  "Rey Mysterio":        { fin: ["619", "West Coast Pop"],          sub: [] },
  "Rey Mysterio Jr.":    { fin: ["619", "West Coast Pop"],          sub: [] },
  "Dominik Mysterio":    { fin: ["619"],                            sub: [] },
  "Carlito":             { fin: ["Backstabber"],                    sub: [] },
  "Kofi Kingston":       { fin: ["Trouble in Paradise", "S.O.S"],   sub: [] },
  "Kenny Omega":         { fin: ["One-Winged Angel", "V-Trigger"],  sub: [] },
  "Adam Page":           { fin: ["Buckshot Lariat"],                sub: [] },
  "Ricky Starks":        { fin: ["Roshambo", "Spear"],              sub: [] },
  "Jacob Fatu":          { fin: ["Mighty Moonsault", "Pop-Up Samoan Drop"], sub: [] },
  "Finn Balor":          { fin: ["Coup de Grace", "1916"],          sub: [] },
  "Damian Priest":       { fin: ["Razor's Edge", "South of Heaven"], sub: [] },
  "Big Show":            { fin: ["KO Punch"],                       sub: [] },
  "The Giant":           { fin: ["KO Punch"],                       sub: [] },
  "Diamond Dallas Page": { fin: ["Diamond Cutter"],                 sub: [] },
  "Drew McIntyre":       { fin: ["Claymore"],                       sub: [] },
  "Drew Galloway":       { fin: ["Claymore"],                       sub: [] },
  "The Miz":             { fin: ["Skull-Crushing Finale"],          sub: ["Figure-Four Leglock"] },
  "Baron Corbin":        { fin: ["End of Days"],                    sub: [] },
  "Dolph Ziggler":       { fin: ["Zig Zag"],                        sub: [] },
  "The Undertaker":      { fin: ["Tombstone Piledriver"],           sub: ["Hell's Gate"] },
  "Undertaker":          { fin: ["Tombstone Piledriver"],           sub: ["Hell's Gate"] },
  "Shawn Michaels":      { fin: ["Sweet Chin Music"],               sub: [] },
  "CM Punk":             { fin: ["Go To Sleep"],                    sub: ["Anaconda Vice"] },
  "Gunther":             { fin: ["Powerbomb", "Lariat"],            sub: ["Sleeper"] },
  "WALTER":              { fin: ["Powerbomb", "Lariat"],            sub: ["Sleeper"] },
  "Big Daddy Walter":    { fin: ["Powerbomb", "Lariat"],            sub: ["Sleeper"] },
  "Jon Moxley":          { fin: ["Paradigm Shift"],                 sub: ["Bulldog Choke"] },
  "Dean Ambrose":        { fin: ["Dirty Deeds"],                    sub: [] },
  "MJF":                 { fin: ["Dynamite Diamond Ring Punch"],    sub: ["Salt of the Earth"] },
  "Goldberg":            { fin: ["Jackhammer", "Spear"],            sub: [] },
  "Samoa Joe":           { fin: ["Muscle Buster"],                  sub: ["Coquina Clutch"] },
  "Chris Benoit":        { fin: ["Diving Headbutt"],                sub: ["Crippler Crossface"] },
  "Sheamus":             { fin: ["Brogue Kick"],                    sub: [] },
  "Kevin Owens":         { fin: ["Pop-Up Powerbomb", "Stunner"],    sub: [] },
  "Goldust":             { fin: ["Final Cut"],                      sub: [] },
  "Dustin Rhodes":       { fin: ["Final Cut"],                      sub: [] },
  "Ric Flair":           { fin: [],                                 sub: ["Figure-Four Leglock"] },
  "Zack Ryder":          { fin: ["Broski Boot", "Rough Ryder"],     sub: [] },
  "Matt Cardona":        { fin: ["Radio Silence"],                  sub: [] },
  "Daniel Bryan":        { fin: ["Running Knee"],                   sub: ["Yes Lock"] },
  "Bray Wyatt":          { fin: ["Sister Abigail"],                 sub: [] },
  "Hangman Page":        { fin: ["Buckshot Lariat"],                sub: [] },
  // Classic women's finishers
  "Manami Toyota":       { fin: ["Japanese Ocean Cyclone Suplex","Japanese Ocean Queen Bee Bomb"], sub: [] },
  "Akira Hokuto":        { fin: ["Dangerous Queen Bomb"],               sub: [] },
  "Chigusa Nagayo":      { fin: ["Tiger Suplex","Death Valley Bomb"],   sub: [] },
  "Megumi Kudo":         { fin: ["Kudome Driver"],                      sub: [] },
  "Bull Nakano":         { fin: ["Guillotine Legdrop","Lariat"],        sub: [] },
  "Lioness Asuka":       { fin: ["Tower Hacker Bomb"],                  sub: [] },
  "Alundra Blayze":      { fin: ["Bridging German Suplex"],             sub: [] },
  "Madusa":              { fin: ["Bridging German Suplex"],             sub: [] },
  "Molly Holly":         { fin: ["Molly-Go-Round"],                     sub: [] },
  "Wendi Richter":       { fin: ["Sitout DDT","Cowgirl Lariat"],        sub: [] },
  "Luna Vachon":         { fin: ["Luna Sault","Luna Bomb"],             sub: [] },
  "Mae Young":           { fin: ["Bronco Buster"],                      sub: [] },
  "Debra":               { fin: [],                                     sub: ["Figure Four Leglock"] },
  "Stacy Keibler":       { fin: ["Spinning Heel Kick"],                 sub: [] },
  "Eve Torres":          { fin: ["Spinning Neckbreaker"],               sub: [] },
  "Kaitlyn":             { fin: ["Spear"],                              sub: [] },
  "Tamina Snuka":        { fin: ["Superfly Splash"],                    sub: [] },
  "Tamina":              { fin: ["Superfly Splash"],                    sub: [] },
  // Extended roster finishers
  "AJ Lee":           { fin: ["Shining Wizard"],                           sub: ["Black Widow"] },
  "Abyss":            { fin: ["Black Hole Slam"],                          sub: [] },
  "Chris Parks":      { fin: ["Black Hole Slam"],                          sub: [] },
  "Akira Tozawa":     { fin: ["Diving Senton"],                            sub: [] },
  "Alexa Bliss":      { fin: ["Twisted Bliss","Bliss DDT","Twisted Abigail"], sub: [] },
  "Angel Garza":      { fin: ["Wing Clipper"],                             sub: [] },
  "Garza Jr.":        { fin: ["Wing Clipper"],                             sub: [] },
  "Angelo Dawkins":   { fin: ["The Anointment"],                           sub: [] },
  "Asuka":            { fin: ["Empress Impact"],                           sub: ["Asuka Lock"] },
  "Austin Theory":    { fin: ["A-Town Down","The Stomp"],                  sub: [] },
  "Theory":           { fin: ["A-Town Down","The Stomp"],                  sub: [] },
  "Axiom":            { fin: ["Golden Ratio"],                             sub: [] },
  "A-Kid":            { fin: ["Golden Ratio"],                             sub: [] },
  "B-Fab":            { fin: ["Hangman's Neckbreaker"],                    sub: [] },
  "Bayley":           { fin: ["Rose Plant","Bayley-To-Bayley"],            sub: [] },
  "Bianca Belair":    { fin: ["K.O.D."],                                   sub: [] },
  "Big E":            { fin: ["Big Ending"],                               sub: [] },
  "Big E. Langston":  { fin: ["Big Ending"],                               sub: [] },
  "Blake Monroe":     { fin: ["Glamour Shot"],                             sub: [] },
  "Mariah May":       { fin: ["Glamour Shot"],                             sub: [] },
  "Bob Backlund":     { fin: [],                                           sub: ["Crossface Chickenwing"] },
  "Bobby Roode":      { fin: ["Glorious DDT"],                             sub: [] },
  "Booker T":         { fin: ["Scissors Kick"],                            sub: [] },
  "Brie Bella":       { fin: ["Bella Buster"],                             sub: [] },
  "Brock Lesnar":     { fin: ["F-5"],                                      sub: ["Kimura Lock"] },
  "Bron Breakker":    { fin: ["Spear","Breakken-Steiner"],                 sub: [] },
  "Bronson Reed":     { fin: ["Tsunami"],                                  sub: [] },
  "Mark Henry":       { fin: ["World's Strongest Slam"],                   sub: [] },
  "The Great Khali":  { fin: ["Khali Bomb","Chop to the Head"],            sub: [] },
  "Jade Cargill":     { fin: ["Jaded"],                                    sub: [] },
  "Je'Von Evans":     { fin: ["OG Cutter"],                                sub: [] },
  "Johnny Gargano":   { fin: ["One Final Beat"],                           sub: ["Gargano Escape"] },
  "John Morrison":    { fin: ["Starship Pain"],                            sub: [] },
  "Liv Morgan":       { fin: ["ObLIVion"],                                 sub: [] },
  "Maryse":           { fin: ["French Kiss"],                              sub: [] },
  "Charlotte Flair":  { fin: ["Natural Selection"],                        sub: ["Figure-Eight"] },
  "Mickie James":     { fin: ["Mick Kick","Spinning Back Kick","Mick-DDT"],sub: [] },
  "Naomi":            { fin: ["Rear View","Split-legged Moonsault"],       sub: ["Feel The Glow"] },
  "Natalya":          { fin: [],                                           sub: ["Sharpshooter"] },
  "Nia Jax":          { fin: ["Annihilator"],                              sub: [] },
  "Nikki Bella":      { fin: ["Rack Attack 2.0"],                          sub: [] },
  "Oba Femi":         { fin: ["Fall From Grace"],                          sub: [] },
  "Otis":             { fin: ["Caterpillar"],                              sub: [] },
  "Otis Dozovic":     { fin: ["Caterpillar"],                              sub: [] },
  "Pete Dunne":       { fin: ["Bitter End"],                               sub: [] },
  "R-Truth":          { fin: ["Little Jimmy"],                             sub: [] },
  "Rusev":            { fin: [],                                           sub: ["Accolade"] },
  "Miro":             { fin: [],                                           sub: ["Accolade"] },
  "Sol Ruca":         { fin: ["Sol Snatcher"],                             sub: [] },
  "Solo Sikoa":       { fin: ["Spinning Solo","Samoan Spike"],             sub: [] },
  "Tyler Breeze":     { fin: ["Beauty Shot","Unprettier"],                 sub: [] },
  "Tommaso Ciampa":   { fin: ["Project Ciampa","Fairy Tale Ending","Willow's Bell"], sub: [] },
  "Toni Storm":       { fin: ["Storm Zero"],                               sub: [] },
  "Tony Nese":        { fin: ["450 Splash","Running Kneese"],              sub: [] },
  "Wade Barrett":     { fin: ["Bull Hammer","Wasteland"],                  sub: [] },
  "Bad News Barrett": { fin: ["Bull Hammer","Wasteland"],                  sub: [] },
  "Alicia Fox":       { fin: ["Scissors Kick"],                            sub: [] },
  "Cedric Alexander": { fin: ["Lumbar Check"],                             sub: [] },
  "Jeff Hardy":       { fin: ["Swanton Bomb","Twist of Fate"],             sub: [] },
  "Matt Hardy":       { fin: ["Twist of Fate","Side Effect"],              sub: [] },
  "Mustafa Ali":      { fin: ["450 Splash"],                               sub: [] },
  "Sonya Deville":    { fin: ["Deville's Advocate"],                       sub: [] },
  "Daria Rae":        { fin: ["Deville's Advocate"],                       sub: [] },
  "Fred Rosser":      { fin: ["Gut Check"],                                sub: [] },
  "Darren Young":     { fin: ["Gut Check"],                                sub: [] },
  "MVP":              { fin: ["Playmaker"],                                sub: [] },
  "Jay Lethal":       { fin: ["Lethal Injection"],                         sub: [] },
  "Jade Cargill":     { fin: ["Jaded"],                                    sub: [] },
};

// ─── Persona aliases ──────────────────────────────────────────────────────────
// Prevents alternate personas from appearing on opposing teams
const ALIASES = {
  "Otis Dozovic": "Otis", "Otis": "Otis Dozovic",
  "Dustin Rhodes": "Goldust", "Goldust": "Dustin Rhodes",
  "Andrade El Idolo": "Andrade 'Cien' Almas", "Andrade 'Cien' Almas": "Andrade El Idolo",
  "Andrade Almas": "Andrade 'Cien' Almas",
  "Dean Ambrose": "Jon Moxley", "Jon Moxley": "Dean Ambrose",
  "Punisher Martinez": "Damian Priest", "Punishment Martinez": "Damian Priest",
  "Damian Priest": "Punisher Martinez",
  "WALTER": "Gunther", "Big Daddy Walter": "Gunther", "Gunther": "WALTER",
  "Tye Dillinger": "Shawn Spears", "Shawn Spears": "Tye Dillinger",
  "Triple H": "Hunter Hearst Helmsley", "Hunter Hearst Helmsley": "Triple H",
  "Miro": "Rusev", "Rusev": "Miro",
  "Zack Ryder": "Matt Cardona", "Matt Cardona": "Zack Ryder",
  "Fandango": "Dirty Dango", "Dirty Dango": "Fandango",
  "Adrian Neville": "Neville", "Neville": "Adrian Neville",
  "LA Knight": "Eli Drake", "Eli Drake": "LA Knight",
  "Aleister Black": "Malakai Black", "Malakai Black": "Aleister Black",
  "Tommy End": "Malakai Black",
  "Chris Hero": "Kassius Ohno", "Kassius Ohno": "Chris Hero",
  "Drew Galloway": "Drew McIntyre", "Drew McIntyre": "Drew Galloway",
  "Chad Gable": "Shorty G", "Shorty G": "Chad Gable",
  "Murphy": "Buddy Murphy", "Buddy Murphy": "Murphy",
  "Buddy Matthews": "Buddy Murphy",
  "Matt Riddle": "Riddle", "Riddle": "Matt Riddle",
  "Gzim Selmani": "Rezar", "Rezar": "Gzim Selmani",
  "Aron Stevens": "Damian Sandow", "Damian Sandow": "Aron Stevens",
  "Bob Holly": "Hardcore Holly", "Hardcore Holly": "Bob Holly",
  "Rey Mysterio": "Rey Mysterio Jr.", "Rey Mysterio Jr.": "Rey Mysterio",
  // Bad-gimmick aliases
  "Bastion Booger": "Mike Shaw",    "Friar Ferguson": "Mike Shaw",
  "Golga": "John Tenta",            "Earthquake": "John Tenta",
  "Black Reign": "Dustin Rhodes",   "Seven": "Dustin Rhodes",
  "Stardust": "Cody Rhodes",        "Cedrick Von Hausen": "Johnny Gargano",
  "Saba Simba": "Tony Atlas",
  "Shockmaster": "Fred Ottman",     "Tugboat": "Fred Ottman", "Typhoon": "Fred Ottman",
  "Beaver Cleavage": "Headbanger Mosh",
  "Avatar": "Al Snow",
  "Oz": "Kevin Nash",
  "Meat": "Shawn Stasiak",
  "Kerwin White": "Chavo Guerrero",
  "Booty Man": "Brutus Beefcake",
  "Naked Mideon": "Mideon",
  "Arachnaman": "Brad Armstrong",
  "Mortis": "Kanyon",
  "Akeem": "One Man Gang",          "New One Man Gang": "One Man Gang",
  "General Hugh E. Rection": "Hugh Morrus",
  "Paul Heyman": "Paul E. Dangerously", "Paul E. Dangerously": "Paul Heyman",
  "Dutch Mantel": "Zeb Colter",    "Zeb Colter": "Dutch Mantel",
  "Adam Copeland": "Edge",          "Christian Cage": "Christian",
  "El Generico": "Sami Zayn",        "Sami Zayn": "El Generico",
  "Kevin Steen": "Kevin Owens",      "Kevin Owens": "Kevin Steen",
  "Tyson Kidd": "T.J. Wilson",       "T.J. Wilson": "Tyson Kidd",
  "Tyler Black": "Seth Rollins",     "Seth Rollins": "Tyler Black",
  "Prince Devitt": "Finn Balor",     "Finn Balor": "Prince Devitt",
  "Skip Sheffield": "Ryback",         "Ryback": "Skip Sheffield",
  "Desmond Wolfe": "Nigel McGuinness","Nigel McGuinness": "Desmond Wolfe",
  "Bo Rotundo": "Bo Dallas",          "Bo Dallas": "Bo Rotundo",
  "Big E. Langston": "Big E",         "Big E": "Big E. Langston",
  "Hunico": "Sin Cara",               "Sin Cara": "Hunico",
  "Roman Leakee": "Roman Reigns",    "Alexander Rusev": "Rusev",
  "Husky Harris": "Bray Wyatt",       "Michael McGillicutty": "Joe Hennig",
  "Brutus Magnus": "Magnus",          "Magnus": "Brutus Magnus",
  "Mr. Anderson": "Ken Kennedy",      "Ken Kennedy": "Mr. Anderson",
  "Samuray del Sol": "Kalisto",       "Uhaa Nation": "Apollo Crews",
  "Antonio Cesaro": "Cesaro",         "Cesaro": "Antonio Cesaro",
  "Leakee": "Roman Reigns",           "Dean Ambrose": "Jon Moxley",
  "Ryback": "Skip Sheffield",         "Tensai": "Giant Bernard",
  "El Super Fenix": "Fenix",         "Shane Strickland": "Swerve Strickland",
  "Curtis Axel": "Joe Hennig",        "Spud": "Rockstar Spud",
  "Rockstar Spud": "Spud",            "Fandango": "Dirty Dango",
  "Adrian Neville": "PAC",           "PAC": "Adrian Neville",
  "Bad News Barrett": "Wade Barrett", "Wade Barrett": "Bad News Barrett",
  "Colin Cassady": "Big Cass",        "Big Cass": "Colin Cassady",
  "Ethan Carter III": "EC3",          "EC3": "Ethan Carter III",
  "SANADA": "Sanada",                 "Sanada": "SANADA",
  "Blake Monroe": "Mariah May",       "Mariah May": "Blake Monroe",
  "Sonya Deville": "Daria Rae",       "Daria Rae": "Sonya Deville",
  "Fred Rosser": "Darren Young",      "Darren Young": "Fred Rosser",
  "Abyss": "Chris Parks",             "Chris Parks": "Abyss",
  "Axiom": "A-Kid",                   "A-Kid": "Axiom",
  "Angel Garza": "Garza Jr.",         "Garza Jr.": "Angel Garza",
  "Paige": "Saraya",                  "Saraya": "Paige",
  "Charlotte": "Charlotte Flair",     "Charlotte Flair": "Charlotte",
  "Heidi Lovelace": "Ruby Riott",     "Ruby Riott": "Heidi Lovelace",
  "Athena": "Ember Moon",             "Ember Moon": "Athena",
  "Ivelisse Velez": "Ivelisse",       "Ivelisse": "Ivelisse Velez",
  "Britt Baker": "Dr. Britt Baker, D.M.D.", "Dr. Britt Baker, D.M.D.": "Britt Baker",
  "Alberto El Patron": "Alberto Del Rio",
  "American Dragon": "Bryan Danielson",
  "American Dragon": "Daniel Bryan",
  "AAJ Styles": "AJ Styles",
  "King Booker": "Booker T",
  "Mike Mizanin": "The Miz",
  "Mike The Miz": "The Miz",
  "Senshi": "Low Ki",
  "Deacon Batista": "Batista",
  "Rob Conway": "Robert Conway",
  "Montel Vontavious Porter": "MVP",
  "Rocky Maivia": "The Rock",    "Paul Wight": "The Big Show",
  "Eddy Guerrero": "Eddie Guerrero", "K-Kwik": "R-Truth",
  "K-Krush": "R-Truth",           "Rhino Richards": "Rhyno",
  "The Giant": "The Big Show",    "Hak": "The Sandman",
  "2 Cold Scorpio": "Flash Funk",  "Tazz": "Taz",
  "Hollywood Hogan": "Hulk Hogan","Chyna": "Chyna", "Prince Puma": "Ricochet",
  "King Barrett": "Wade Barrett",         "Yujiro Kushida": "KUSHIDA",
  "Seiya Sanada": "SANADA",              "Hideo Itami": "KENTA",
  "Alberto El Patron": "Alberto Del Rio",
  "American Dragon": "Bryan Danielson",
  "American Dragon": "Daniel Bryan",
  "AAJ Styles": "AJ Styles",
  "King Booker": "Booker T",
  "Mike Mizanin": "The Miz",
  "Mike The Miz": "The Miz",
  "Senshi": "Low Ki",
  "Deacon Batista": "Batista",
  "Rob Conway": "Robert Conway",
  "Montel Vontavious Porter": "MVP",
  "Rocky Maivia": "The Rock",    "Paul Wight": "The Big Show",
  "Eddy Guerrero": "Eddie Guerrero", "K-Kwik": "R-Truth",
  "K-Krush": "R-Truth",           "Rhino Richards": "Rhyno",
  "The Giant": "The Big Show",    "Hak": "The Sandman",
  "2 Cold Scorpio": "Flash Funk",  "Tazz": "Taz",
  "Hollywood Hogan": "Hulk Hogan","Chyna": "Chyna",
  "Ruby Riott": "Ruby Soho",              "Ruby Soho": "Ruby Riott",
  "Kris Statlander": "Kris Stadtlander",  "Billie Kay": "Peyton Royce",
  "Shotzi Blackheart": "Shotzi",          "Shotzi": "Shotzi Blackheart",
  "Abbey Laith": "Kimber Lee",             "Alundra Blayze": "Madusa",
  "Brooke Tessmacher": "Miss Tessmacher",  "Naomi Night": "Naomi",
  "Tamina Snuka": "Tamina",               "Tamina": "Tamina Snuka",
  "Ruby Riot": "Ruby Riott",              "Ruby Riott": "Ruby Soho",
  "Taya Valkyrie": "Franky Monet",        "Franky Monet": "Taya Valkyrie",
  "Theory": "Austin Theory",         "Austin Theory": "Theory",
  "Felino": "Felino",                 "Manik": "TJ Perkins",
  "Aaron Stevens": "Damian Sandow",   "Damian Sandow": "Aaron Stevens",
  "Prince Nana": "Prince Nana",
  "Woman": "Nancy Benoit",          "Nancy Benoit": "Woman",
};

function areAliases(n1, n2) {
  if (n1.toLowerCase() === n2.toLowerCase()) return true;
  return ALIASES[n1] === n2 || ALIASES[n2] === n1 || (ALIASES[n1] && ALIASES[n1] === ALIASES[n2]);
}


// ─── Face / Heel personas ─────────────────────────────────────────────────────
function getPersona(name, year) {
  const F = "face", H = "heel";
  switch (name) {
    // Permanent faces
    case "Ricky Steamboat": case "Richie Steamboat":
    case "Mick Foley": case "Mankind": case "Cactus Jack":
    case "Sting": case "Cody Rhodes": return F;
    case "Rey Mysterio": case "Rey Mysterio Jr.": return F;
    case "John Cena": return F;
    // Year-conditional faces
    case "Hulk Hogan":    return year>=1984&&year<=1993 ? F : null;
    case "Daniel Bryan":  return year>=2018&&year<=2019 ? H : F;
    case "Bryan Danielson": return F;
    case "AJ Styles":     return year===2016 ? H : F;
    case "Sami Zayn":     return year>=2020&&year<=2022 ? H : F;
    case "El Generico":   return F;
    // Permanent heels
    case "MJF": case "Ric Flair": case "Edge":
    case "Christian Cage": case "Kevin Owens": case "Kevin Steen":
    case "Jeff Jarrett": return H;
    case "Triple H": case "Hunter Hearst Helmsley": return H;
    case "Chris Jericho": return H;
    // Year-conditional heels
    case "Roman Reigns": return year>=2015&&year<=2020 ? H : null;
    case "Randy Orton":  return year>=2021&&year<=2023 ? F : H;
    default: return null;
  }
}

// ─── Cheating styles ──────────────────────────────────────────────────────────
const CHEATING_STYLES = {
  dirty:    ["Edge", "Chris Jericho", "The Miz", "Dominik Mysterio", "Ethan Page",
             "Triple H", "Hunter Hearst Helmsley", "MJF"],
  mist:     ["Shinsuke Nakamura", "The Great Muta", "Kendo Nagasaki", "TAJIRI", "Tajiri"],
  hardcore: ["Cactus Jack", "New Jack", "Sabu", "Jeff Hardy", "Edge",
             "Mick Foley", "Mankind", "Tommy Dreamer"],
};
const CHEAT_MOVES = {
  dirty:    ["a low blow", "an eye poke", "a roll-up while grabbing the tights", "a foreign object"],
  mist:     ["a blast of poison mist"],
  hardcore: ["a steel chair shot", "a kendo stick strike", "TABLE_SPOT", "a trash can lid"],
};
const TABLE_ELBOW = new Set(["Randy Savage","Sabu","Mankind","Cactus Jack","Mick Foley","Bubba Ray Dudley","Brother Ray","Shawn Michaels","Shane McMahon","Dean Ambrose","Jon Moxley","Seth Rollins","CM Punk","Bayley","Max Caster","Matt Jackson","Nick Jackson","MJF","Mark Briscoe","Jack Perry","Jungle Boy","Jay Lethal","Grayson Waller"]);
const TABLE_SPEAR = new Set(["Bobby Lashley","Ricky Starks","Roman Reigns","Edge","Goldberg","Bron Breakker"]);
function tableVerb(name) {
  if (TABLE_ELBOW.has(name)) return "elbow drops";
  if (TABLE_SPEAR.has(name)) return "spears";
  return "splashes";
}

// ─── Female wrestlers ─────────────────────────────────────────────────────────
const FEMALE_WRESTLERS = new Set([
  // Active roster / modern
  "Rhea Ripley","Becky Lynch","Maki Itoh","Billie Starkz","Kaia McKenna",
  "Lulu Pencil","Jessica Troy","Jordan Blade","Trish Adora","Jordynne Grace",
  "Laynie Luck","Tessa Blanchard","Sonny Kiss","The Dark Sheik","Sandra Moone",
  "Max The Impaler","Allie Katch","Effy",
  // 2008 women's division
  "Awesome Kong","Beth Phoenix","Gail Kim","Mickie James","MsChif","Sara Del Rey",
  "Roxxi Laveaux","Melina","Michelle McCool","Candice Michelle","Mercedes Martinez",
  "Victoria","Taylor Wilde","O.D.B.","Daizee Haze","Angelina Love","Jacqueline",
  "April Hunter","Natalya","Sumie Sakai","Allison Danger","Traci Brooks",
  "Velvet Sky","Sarah Stock","Moose Knuckles","Katie Lea Burchill","Cherry",
  "Cheerleader Melissa","Maria Kanellis","Amber O'Neal","Lexie Fyfe","Kelly Kelly",
  "Cindy Rogers","Jillian Hall","Malia Hosaka","Christie Ricci","Becky Bayless",
  "Alere Little Feather","Layla","Kelly Couture","Jaime D.","Christy Hemme",
  "Milena Roucka","Annie Social","LuFisto","Rhaka Khan","Danyah","Jennifer Blake",
  "Daffney","Portia Perez",
  // 2009 women's additions
  "Tara","Maryse","Sarita","Madison Rayne","Nikki Roxx","Angel Orsini","Rain",
  "Sojourner Bolt","Jetta","Madison Eagles","Nevaeh","Wesna Busic","Ariel",
  "Nicole Matthews","Serena Deeb","Amy Lee","Cherry Bomb","Jessie McKay","Rosa Mendes",
  // 2022 women
  "Masha Slamovich","Erica Leigh","Willow Nightingale","Kennedi Copeland",
  "Rina Yamashita","Charli Evans","Davienne","Session Moth Martina","Kenzie Paige",
  "Edith Surreal","Veny","Kasey Catal","Rhio","Mickie Knuckles","Saki Akai",
  "Becca","Kylie Rae","Rebel Kel","Shazza McKenzie","Sawyer Wreck","Joseline Navarro",
  "Diamante","Kidd Bandit",
  // 2024 women
  "Megan Bayne","Zoe Sager","Hyan","Jody Threat","Vipress","Amira Lukens",
  "Dani Luna","Emersyn Jayne","Sierra","Alexia Nicole","Kristara","Aliss Ink",
  // Additional female wrestlers — 2015/2016
  "Sasha Banks","Santana Garrett","Sexy Star","Brooke","Blue Pants","Jade","Evie",
  "Kay Lee Ray","Vanessa Kraven","Xandra Bale","La Rosa Negra","Sienna","Rosemary",
  "Allie","Nicole Savoy","Mariposa","Dana Brooke","Amber Gallows","Taylor Made",
  "Kobra Moon","Carmella","Shayna Baszler","Marti Bell","Eva Marie","Allie Katch",
  // 2019-2021 women
  "Ronda Rousey","Io Shirai","Taya Valkyrie","Mayu Iwatani","Nikki Cross",
  "Allysin Kay","Bea Priestley","Lacey Evans","Arisa Hoshiki","Kelly Klein",
  "Britt Baker","Dr. Britt Baker, D.M.D.","Hiroyo Matsumoto","Peyton Royce",
  "Brandi Rhodes","Sarah Logan","Kiera Hogan","Samantha Heights","Billie Kay",
  "Hana Kimura","Hikaru Shida","Kacy Catanzaro","Nyla Rose","Mandy Rose",
  "Jazzy Gabert","Marina Shafir","Tam Nakano","Piper Niven","Shotzi Blackheart",
  "Deonna Purrazzo","Thunder Rosa","Kris Statlander","Kris Stadtlander",
  "Riho","Kairi Sane","Dakota Kai","Kylie Rae","Big Swole","Jamie Hayter",
  "Penelope Ford","Giulia","Tasha Steelz","Leyla Hirsch","Indi Hartwell",
  "Killer Kelly","Heather Monroe","Utami Hayashishita","Raquel Gonzalez",
  "Meiko Satomura","Rok-C","Miyu Yamashita","Kamille","Maki Ito","Tay Conti",
  "Lady Frost","Skye Blue","Emi Sakura","Zoey Stark","Queen Aminata",
  "Tenille Dashwood","Blair Davenport","Ruby Soho","Chelsea Green","Xia Li",
  "Savannah Evans","Franky Monet","Chihiro Hashimoto","Yuka Sakazaki",
  "Saya Kamitani","Lady Shani","Red Velvet","Serena Deeb","Jamie Senegal",
  "Carmella","Priscilla Kelly","Hikaru Shida","Shotzi","Jennacide",
  "Suzu Suzuki","Natsupoi","Havok","Starlight Kid","AZM","Jazz",
  "Rika Tatsumi","Mio Momono","Miranda Alize","KiLynn King","Doudrop",
  "Tsukushi Haruka","Leila Grey","Mina Shirakawa","Dani Jordyn","Tootie Lynn",
  "Princesa Sugehit","Franky Monet","Rachael Ellering","Tamina",
  "Maika","Unagi Sayaka","Ryo Mizunami","Chik Tormenta","Mazzerati",
  "Hokuto Nakajima","Zoey Skye","Solo Darling","Holidead","Isla Dawn",
  "Zoe Lucas","K. C. Spinelli","Gisele Shaw","Maddison Miles",
  "Jungle Kyona","Kagetsu","Joelle Jordyn",
  "Paige","Saraya","Ivelisse Velez","Courtney Rush","Charlotte","Barbi Hayden",
  "Jessicka Havok","Saraya Knight","Brittany","Cameron","Kacee Carlisle","Mia Yim",
  "Kellie Skater","Athena","Su Yung","Kimber Lee","Emma","Leva Bates","Nikki Storm",
  "Candice LeRae","Taryn Terrell","Marti Belle","Veda Scott","Sassy Stephie",
  "Christina Von Eerie","Crazy Mary Dobson","Jessie Kaye","Heidi Lovelace",
  "Angie Skye","Kat Von Heez","Ivelisse",
  "AJ Lee","Alexa Bliss","Asuka","B-Fab","Bayley","Bianca Belair",
  "Blake Monroe","Mariah May","Brie Bella","Charlotte Flair","Jade Cargill",
  "Liv Morgan","Naomi","Nia Jax","Nikki Bella","Sol Ruca",
  "Sonya Deville","Daria Rae","Toni Storm","Alicia Fox","AJ Lee",
  "Cyndi Lauper","Chyna",
  // Classic/historical women wrestlers
  "Manami Toyota","Akira Hokuto","Chigusa Nagayo","Megumi Kudo","Bull Nakano",
  "Lioness Asuka","Alundra Blayze","Molly Holly","Wendi Richter","Torrie Wilson",
  "Luna Vachon","Stacy Keibler","Rhonda Singh","Monster Ripper","Sable",
  "Leilani Kai","Fabulous Moolah","Mae Young","Kaitlyn","Tamina Snuka","Tamina",
  "Eve Torres","Hamada","Ayako Hamada","Hailey Hatred","Winter","Rachel Summerlyn",
  "Melanie Cruise","Tina San Antonio","Tasha Simone","Abbey Laith","Alex Windsor",
  "Charlie Morgan","Kris Wolf","Delilah Doom","Karen Q.","Sammii Jayne","Naomi Night",
  "Brittney Savage","Kalamity","Lexxus","Brooke Tessmacher","Miss Tessmacher",
  "Missy Hyatt","Terri Runnels","Debra",
  // Managers & valets
  "Sensational Sherri","Miss Elizabeth","Vickie Guerrero","Woman","Nancy Benoit",
  "Maxxine Dupri","JoJo","Lana","Momma Benjamin","Scarlett Bordeaux","Muffy",
  "The Bunny","Maria Kanellis",
]);

function getCheatStyle(name) {
  for (const [style, list] of Object.entries(CHEATING_STYLES)) {
    if (list.includes(name)) return style;
  }
  return null;
}


// ─── Character theatrics ──────────────────────────────────────────────────────
// "defense" = fires when wrestler is about to be eliminated (can reverse it once)
// "attack"  = fires when wrestler is the attacker (ref bump — cancels that exchange)
const THEATRICS = {
  // ── Defense: fires when wrestler is being eliminated; reverses it ─────────
  "The Undertaker": { dir:"defense", chance:0.25,
    msg:(att)=>{
      const fin=lookupFinisher(att.name)?.fin?.[0];
      const pre=fin?`${att.name} hits the ${fin}... `:``;
      const vars=["The Undertaker sits up! He's risen from the dead!","The Undertaker sits up! The deadman's risen!","The Undertaker sits up! The deadman still has life!","The Undertaker sits up! He's not human!"];
      return pre+vars[Math.floor(Math.random()*vars.length)];
    }},
  "Hulk Hogan": { dir:"defense", chance:0.30,
    msg:(att)=>{
      const fin=lookupFinisher(att.name)?.fin?.[0];
      return fin?`${att.name} hits the ${fin}! HULK HOGAN IS HULKING UP! He's shaking his finger at ${att.name}!`:`${att.name}'s heavy blows are ignored by Hulk Hogan! HULK HOGAN IS HULKING UP! He's shaking his finger at ${att.name}!`;
    }},
  "The Ultimate Warrior": { dir:"defense", chance:0.25,
    msg:(att)=>{
      const fin=lookupFinisher(att.name)?.fin?.[0];
      return fin?`${att.name} hits the ${fin}! THE ULTIMATE WARRIOR POPS UP! THE POWER OF THE WARRIOR!`:`${att.name}'s attacks are shrugged off! THE ULTIMATE WARRIOR POPS UP! THE POWER OF THE WARRIOR!`;
    }},
  // ── Attack: fires when wrestler is attacking; cancels that exchange ────────
  "Stone Cold Steve Austin": { dir:"attack", chance:0.15,
    msg:(victim)=>`Stone Cold accidentally stuns the ref! The official is down!` },
  "Randy Orton": { dir:"attack", chance:0.15,
    msg:(victim)=>`RKO OUTTA NOWHERE — Randy Orton RKOs the ref! Complete chaos!` },
  // ── Signature: fires when attacking; adds flavour then elimination proceeds ─
  "The Rock": { dir:"signature", chance:0.20,
    msg:(victim)=>`THE ROCK DROPS THE PEOPLE'S ELBOW on ${victim.name}!` },
  "John Cena": { dir:"signature", chance:0.15,
    msg:(victim)=>`JOHN CENA HITS THE FIVE-KNUCKLE SHUFFLE on ${victim.name}!` },
};

// Resolve theatric via direct name, alias, or "The " prefix
function checkTheatric(name, firedSet) {
  if (firedSet.has(name)) return null;
  const t = THEATRICS[name] || THEATRICS[ALIASES[name]] ||
            THEATRICS[name.replace(/^The /,"")] || THEATRICS["The "+name];
  if (!t) return null;
  return Math.random() < t.chance ? t : null;
}

// ─── Finisher lookup ──────────────────────────────────────────────────────────
function lookupFinisher(name) {
  return FINISHERS[name] || FINISHERS[ALIASES[name]] ||
    FINISHERS[name.replace(/^The /, "")] || FINISHERS["The " + name] || null;
}

function makeElimMsg(att, victim, isPlayerElim) {
  const moves = lookupFinisher(att.name);
  const useSub = moves?.sub?.length && Math.random() < 0.3;
  const useFin = !useSub && moves?.fin?.length;

  if (useSub) {
    const sub = moves.sub[Math.floor(Math.random() * moves.sub.length)];
    return isPlayerElim
      ? `${att.name} makes ${victim.name} tap out to the ${sub}`
      : `${victim.name} taps out to ${att.name}'s ${sub}`;
  }
  if (useFin) {
    const fin = moves.fin[Math.floor(Math.random() * moves.fin.length)];
    const art = /^[aeiouAEIOU]/.test(fin) ? "an" : "a";
    return isPlayerElim
      ? `${att.name} pins ${victim.name} off ${art} ${fin}`
      : `${victim.name} pinned by ${att.name} off ${art} ${fin}`;
  }
  return isPlayerElim
    ? `${att.name} pins ${victim.name}`
    : `${victim.name} eliminated by ${att.name}`;
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function calcStarRating(events, wentToFinal) {
  const combatEvents  = events.filter(e => e.type === "win" || e.type === "loss").length;
  const cheatCount    = events.filter(e => e.type === "cheat").length;
  const theatricCount = events.filter(e => e.type === "theatric").length;
  const finCount      = events.filter(e => e.hasFin).length;
  let stars = Math.min(2.5, combatEvents * 0.3)
            + finCount * 0.25
            + (wentToFinal ? 0.5 : 0)
            + cheatCount * 0.15
            + theatricCount * 0.35;
  return Math.min(5, Math.max(0.25, Math.round(stars * 4) / 4));
}

function formatStars(r) {
  const full = Math.floor(r), frac = Math.round((r - full) * 4);
  const f = frac === 3 ? "¾" : frac === 2 ? "½" : frac === 1 ? "¼" : "";
  return "★".repeat(full) + f || "¼";
}

// ─── Simulation ───────────────────────────────────────────────────────────────
function simulate(myTeam, oppTeam, noDq = false) {
  const events       = [];
  const theatricFired = new Set(); // each wrestler fires theatric at most once
  let mi = [...myTeam], oi = [...oppTeam], guard = 30, wentToFinal = false;

  while (mi.length > 0 && oi.length > 0 && guard-- > 0) {
    const ms = mi.reduce((s, w) => s + pts(w.rank), 0);
    const os = oi.reduce((s, w) => s + pts(w.rank), 0);
    let prob = ms / (ms + os);
    if (mi.length === 1 && oi.length === 1) wentToFinal = true;

    // ── No-DQ cheating (dirty cheats have 10-20% chance of direct elimination) ──
    let cheatElim = false;
    if (noDq && Math.random() < 0.25) {
      const allActive = [...mi, ...oi];
      const cheater   = allActive[Math.floor(Math.random() * allActive.length)];
      const style     = getCheatStyle(cheater.name);
      if (style) {
        const move    = CHEAT_MOVES[style][Math.floor(Math.random() * CHEAT_MOVES[style].length)];
        const myCheat = !!mi.find(w => w.name === cheater.name);
        const isDirtyElim = (move === "a low blow" || move === "a roll-up while grabbing the tights")
                         && Math.random() < 0.15;
        if (isDirtyElim) {
          if (myCheat) {
            const victim = [...oi].sort((a,b) => pts(a.rank)-pts(b.rank))[0];
            events.push({ type:"win", msg:`${cheater.name} pins ${victim.name} off ${move}!`, hasFin:false });
            oi = oi.filter(w => w.name !== victim.name);
          } else {
            const victim = [...mi].sort((a,b) => pts(a.rank)-pts(b.rank))[0];
            events.push({ type:"loss", msg:`${victim.name} caught by ${cheater.name}'s ${move}!`, hasFin:false });
            mi = mi.filter(w => w.name !== victim.name);
          }
          cheatElim = true;
        } else {
          const oppSide = myCheat ? oi : mi;
          const displayTarget = oppSide.length ? oppSide[Math.floor(Math.random()*oppSide.length)] : null;
          let cheatMsg;
          if (move === "TABLE_SPOT") {
            const verb = tableVerb(cheater.name);
            cheatMsg = `${cheater.name} ${verb} ${displayTarget?.name ?? "an opponent"} through a table!`;
          } else {
            cheatMsg = `${cheater.name} resorts to ${move}`;
          }
          events.push({ type:"cheat", msg: cheatMsg });
          prob = myCheat ? Math.min(0.92, prob+0.12) : Math.max(0.08, prob-0.12);
        }
      }
    }

    if (!cheatElim) {
      if (Math.random() < prob) {
        // ── Player team wins this exchange ──────────────────────────────────────
        const victim = [...oi].sort((a,b) => pts(a.rank)-pts(b.rank))[0];
        const att    = mi[Math.floor(Math.random() * mi.length)];

        // Check theatric for attacker
        const tDir = (checkTheatric(att.name, theatricFired) && (THEATRICS[att.name]?.dir || THEATRICS[ALIASES[att.name]]?.dir || "")) || "";
        const attT = ["attack","signature"].includes(tDir) ? checkTheatric(att.name, theatricFired) : null;
        if (attT?.dir === "attack") {
          theatricFired.add(att.name);
          events.push({ type:"theatric", msg: attT.msg(victim) });
          // No elimination — ref is bumped
        } else {
          if (attT?.dir === "signature") {
            theatricFired.add(att.name);
            events.push({ type:"theatric", msg: attT.msg(victim) });
          }
          const hasFin = !!lookupFinisher(att.name);
          events.push({ type:"win", msg: makeElimMsg(att, victim, true), hasFin });
          oi = oi.filter(w => w.name !== victim.name);
        }
      } else {
        // ── Opponent team wins this exchange ────────────────────────────────────
        const victim = [...mi].sort((a,b) => pts(a.rank)-pts(b.rank))[0];
        const att    = oi[Math.floor(Math.random() * oi.length)];

        // Defense theatric (e.g. Taker situp, Hogan hulk-up) — reverses elimination
        const defT = THEATRICS[victim.name]?.dir === "defense" ? checkTheatric(victim.name, theatricFired) : null;
        if (defT) {
          theatricFired.add(victim.name);
          events.push({ type:"theatric", msg: defT.msg(att) });
          // Wrestler survives — no elimination this exchange
        } else {
          // Check if attacker has an attack theatric (ref bump on opp side)
          const attT = THEATRICS[att.name]?.dir === "attack" ? checkTheatric(att.name, theatricFired) : null;
          if (attT) {
            theatricFired.add(att.name);
            events.push({ type:"theatric", msg: attT.msg(victim) });
          } else {
            const hasFin = !!lookupFinisher(att.name);
            events.push({ type:"loss", msg: makeElimMsg(att, victim, false), hasFin });
            mi = mi.filter(w => w.name !== victim.name);
          }
        }
      }
    }
  }

  return { events, playerWins: oi.length === 0, starRating: calcStarRating(events, wentToFinal) };
}

// ─── Special pool: bad gimmicks, guests, managers ────────────────────────────
// These inject 1-2 era-appropriate wildcards into any draft pool.
// All rank 499 = 1 pt. Gimmick aliases prevent them appearing vs their base wrestler.
const SPECIAL_POOL = [
  // Bad gimmicks
  {name:"Bastion Booger",rank:499,yearMin:1993,yearMax:1994,specialType:"gimmick"},
  {name:"Friar Ferguson",rank:499,yearMin:1993,yearMax:1993,specialType:"gimmick"},
  {name:"Golga",rank:499,yearMin:1998,yearMax:1999,specialType:"gimmick"},
  {name:"Black Reign",rank:499,yearMin:2007,yearMax:2008,specialType:"gimmick"},
  {name:"Seven",rank:499,yearMin:1999,yearMax:2000,specialType:"gimmick"},
  {name:"Saba Simba",rank:499,yearMin:1990,yearMax:1991,specialType:"gimmick"},
  {name:"Shockmaster",rank:499,yearMin:1993,yearMax:1993,specialType:"gimmick"},
  {name:"Tugboat",rank:499,yearMin:1990,yearMax:1993,specialType:"gimmick"},
  {name:"Beaver Cleavage",rank:499,yearMin:1999,yearMax:1999,specialType:"gimmick"},
  {name:"Cedrick Von Hausen",rank:499,yearMin:2000,yearMax:2003,specialType:"gimmick"},
  {name:"Stardust",rank:499,yearMin:2014,yearMax:2016,specialType:"gimmick"},
  {name:"Mantaur",rank:499,yearMin:1994,yearMax:1995,specialType:"gimmick"},
  {name:"Avatar",rank:499,yearMin:1994,yearMax:1997,specialType:"gimmick"},
  {name:"Gobbledy Gooker",rank:499,yearMin:1991,yearMax:2020,specialType:"gimmick"},
  {name:"Max Moon",rank:499,yearMin:1992,yearMax:1993,specialType:"gimmick"},
  {name:"Executioner",rank:499,yearMin:1993,yearMax:1997,specialType:"gimmick"},
  {name:"Terrorist",rank:499,yearMin:1990,yearMax:1999,specialType:"gimmick"},
  {name:"Phantasio",rank:499,yearMin:1995,yearMax:1995,specialType:"gimmick"},
  {name:"Damian Demento",rank:499,yearMin:1992,yearMax:1994,specialType:"gimmick"},
  {name:"Braun the Leprechaun",rank:499,yearMin:1990,yearMax:1999,specialType:"gimmick"},
  {name:"Bongo the Caveman",rank:499,yearMin:1990,yearMax:1999,specialType:"gimmick"},
  {name:"ECW Zombie",rank:499,yearMin:2006,yearMax:2009,specialType:"gimmick"},
  {name:"Stormtrooper",rank:499,yearMin:1990,yearMax:2005,specialType:"gimmick"},
  {name:"Fat Chick Thriller",rank:499,yearMin:2000,yearMax:2005,specialType:"gimmick"},
  {name:"TL Hopper",rank:499,yearMin:1996,yearMax:1997,specialType:"gimmick"},
  {name:"Shinobi",rank:499,yearMin:1990,yearMax:1999,specialType:"gimmick"},
  {name:"Oz",rank:499,yearMin:1991,yearMax:1991,specialType:"gimmick"},
  {name:"General Hugh E. Rection",rank:499,yearMin:2000,yearMax:2001,specialType:"gimmick"},
  {name:"Giant Silva",rank:499,yearMin:1998,yearMax:1999,specialType:"gimmick"},
  {name:"KISS Demon",rank:499,yearMin:1999,yearMax:2000,specialType:"gimmick"},
  {name:"Akeem",rank:499,yearMin:1988,yearMax:1990,specialType:"gimmick"},
  {name:"Big Josh",rank:499,yearMin:1991,yearMax:1992,specialType:"gimmick"},
  {name:"Oklahoma",rank:499,yearMin:1999,yearMax:2000,specialType:"gimmick"},
  {name:"Meat",rank:499,yearMin:1999,yearMax:1999,specialType:"gimmick"},
  {name:"Kerwin White",rank:499,yearMin:2005,yearMax:2005,specialType:"gimmick"},
  {name:"Booty Man",rank:499,yearMin:1995,yearMax:1997,specialType:"gimmick"},
  {name:"Key",rank:499,yearMin:1990,yearMax:2000,specialType:"gimmick"},
  {name:"Man Mountain Rock",rank:499,yearMin:1994,yearMax:1996,specialType:"gimmick"},
  {name:"Naked Mideon",rank:499,yearMin:1999,yearMax:2000,specialType:"gimmick"},
  {name:"Giant Gonzalez",rank:499,yearMin:1993,yearMax:1993,specialType:"gimmick"},
  {name:"Battle Kat",rank:499,yearMin:1990,yearMax:1992,specialType:"gimmick"},
  {name:"Yeti",rank:499,yearMin:1995,yearMax:1995,specialType:"gimmick"},
  {name:"Road Block",rank:499,yearMin:1993,yearMax:1998,specialType:"gimmick"},
  {name:"Arachnaman",rank:499,yearMin:1991,yearMax:1993,specialType:"gimmick"},
  {name:"Mortis",rank:499,yearMin:1997,yearMax:1997,specialType:"gimmick"},
  {name:"Fake Razor",rank:499,yearMin:1996,yearMax:1997,specialType:"gimmick"},
  {name:"Just Joe",rank:499,yearMin:1999,yearMax:2003,specialType:"gimmick"},
  // Special Guests
  {name:"Pee-wee Herman",rank:499,yearMin:1991,yearMax:2025,specialType:"guest"},
  {name:"Shaq",rank:499,yearMin:2010,yearMax:2021,specialType:"guest"},
  {name:"Johnny Knoxville",rank:499,yearMin:2022,yearMax:2022,specialType:"guest"},
  {name:"IShowSpeed",rank:499,yearMin:2025,yearMax:2025,specialType:"guest"},
{name:"Jelly Roll",rank:499,yearMin:2025,yearMax:2025,specialType:"guest"},
  {name:"Travis Scott",rank:499,yearMin:2025,yearMax:2025,specialType:"guest"},
  {name:"Mr. T",rank:499,yearMin:1985,yearMax:2014,specialType:"guest"},
  {name:"Cyndi Lauper",rank:499,yearMin:1984,yearMax:2012,specialType:"guest"},
  {name:"RoboCop",rank:499,yearMin:1990,yearMax:1990,specialType:"guest"},
  {name:"Mike Tyson",rank:499,yearMin:1998,yearMax:2012,specialType:"guest"},
  {name:"Dennis Rodman",rank:499,yearMin:1997,yearMax:2025,specialType:"guest"},
  {name:"Karl Malone",rank:499,yearMin:1998,yearMax:1999,specialType:"guest"},
  {name:"Mark Cuban",rank:499,yearMin:2003,yearMax:2009,specialType:"guest"},
  {name:"LaMelo Ball",rank:499,yearMin:2017,yearMax:2017,specialType:"guest"},
  {name:"Lonzo Ball",rank:499,yearMin:2017,yearMax:2017,specialType:"guest"},
  {name:"LaVar Ball",rank:499,yearMin:2017,yearMax:2017,specialType:"guest"},
  {name:"Tyrese Haliburton",rank:499,yearMin:2024,yearMax:2024,specialType:"guest"},
  {name:"Jalen Brunson",rank:499,yearMin:2024,yearMax:2024,specialType:"guest"},
  // Managers & Valets
  {name:"Paul Heyman",rank:499,yearMin:1990,yearMax:2025,specialType:"manager"},
  {name:"Lil Yachty",rank:499,yearMin:2025,yearMax:2025,specialType:"manager"},
  {name:"Gingerbread Man",rank:499,yearMin:2025,yearMax:2025,specialType:"manager"},
  {name:"The Bunny",rank:499,yearMin:2014,yearMax:2016,specialType:"manager"},
  {name:"Bobby Heenan",rank:499,yearMin:1990,yearMax:1997,specialType:"manager"},
  {name:"Jim Cornette",rank:499,yearMin:1990,yearMax:2005,specialType:"manager"},
  {name:"Paul Bearer",rank:499,yearMin:1991,yearMax:2004,specialType:"manager"},
  {name:"Jimmy Hart",rank:499,yearMin:1990,yearMax:2000,specialType:"manager"},
  {name:"Mr. Fuji",rank:499,yearMin:1991,yearMax:1996,specialType:"manager"},
  {name:"Sensational Sherri",rank:499,yearMin:1991,yearMax:1997,specialType:"manager"},
  {name:"Miss Elizabeth",rank:499,yearMin:1991,yearMax:1995,specialType:"manager"},
  {name:"Vickie Guerrero",rank:499,yearMin:2005,yearMax:2015,specialType:"manager"},
  {name:"Woman",rank:499,yearMin:1991,yearMax:2000,specialType:"manager"},
  {name:"Maria Kanellis",rank:499,yearMin:2006,yearMax:2019,specialType:"manager"},
  {name:"Maxxine Dupri",rank:499,yearMin:2022,yearMax:2025,specialType:"manager"},
  {name:"Lou Albano",rank:499,yearMin:1991,yearMax:1993,specialType:"manager"},
  {name:"Paul Ellering",rank:499,yearMin:1990,yearMax:1997,specialType:"manager"},
  {name:"Dutch Mantel",rank:499,yearMin:1991,yearMax:2016,specialType:"manager"},
  {name:"Jesse Ventura",rank:499,yearMin:1991,yearMax:1994,specialType:"manager"},
  {name:"Jim Ross",rank:499,yearMin:1993,yearMax:2005,specialType:"manager"},
  {name:"JoJo",rank:499,yearMin:2013,yearMax:2018,specialType:"manager"},
  {name:"Lana",rank:499,yearMin:2014,yearMax:2021,specialType:"manager"},
  {name:"Jonathan Coachman",rank:499,yearMin:2000,yearMax:2009,specialType:"manager"},
  {name:"Momma Benjamin",rank:499,yearMin:2004,yearMax:2005,specialType:"manager"},
  {name:"Rico",rank:499,yearMin:2001,yearMax:2004,specialType:"manager"},
  {name:"Scarlett Bordeaux",rank:499,yearMin:2019,yearMax:2025,specialType:"manager"},
  {name:"Sunny",rank:499,yearMin:1995,yearMax:1999,specialType:"manager"},
  {name:"Muffy",rank:499,yearMin:1990,yearMax:2000,specialType:"manager"},
  {name:"Missy Hyatt",rank:499,yearMin:1985,yearMax:2016,specialType:"manager"},
  {name:"Terri Runnels",rank:499,yearMin:1990,yearMax:2004,specialType:"manager"},
  {name:"Debra",rank:499,yearMin:1996,yearMax:2002,specialType:"manager"},
  {name:"Stacy Keibler",rank:499,yearMin:1999,yearMax:2005,specialType:"manager"},
  {name:"Torrie Wilson",rank:499,yearMin:1999,yearMax:2008,specialType:"guest"},
  {name:"Sable",rank:499,yearMin:1998,yearMax:2004,specialType:"guest"},
  {name:"Adam Rose's Bunny",rank:499,yearMin:2014,yearMax:2015,specialType:"manager"},
  {name:"Travis Scott",rank:499,yearMin:2025,yearMax:2025,specialType:"guest"},
];

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_DATA = {
  2008: [
    {name:"Awesome Kong",rank:1},{name:"Beth Phoenix",rank:2},{name:"Gail Kim",rank:3},
    {name:"Mickie James",rank:4},{name:"MsChif",rank:5},{name:"Sara Del Rey",rank:6},
    {name:"Roxxi Laveaux",rank:7},{name:"Melina",rank:8},{name:"Michelle McCool",rank:9},
    {name:"Candice Michelle",rank:10},{name:"Mercedes Martinez",rank:11},{name:"Victoria",rank:12},
    {name:"Taylor Wilde",rank:13},{name:"O.D.B.",rank:14},{name:"Daizee Haze",rank:15},
    {name:"Angelina Love",rank:16},{name:"Jacqueline",rank:17},{name:"April Hunter",rank:18},
    {name:"Natalya",rank:19},{name:"Sumie Sakai",rank:20},{name:"Allison Danger",rank:21},
    {name:"Traci Brooks",rank:22},{name:"Velvet Sky",rank:23},{name:"Sarah Stock",rank:24},
    {name:"Moose Knuckles",rank:25},{name:"Katie Lea Burchill",rank:26},{name:"Cherry",rank:27},
    {name:"Cheerleader Melissa",rank:28},{name:"Maria Kanellis",rank:29},
    {name:"Amber O'Neal",rank:30},{name:"Lexie Fyfe",rank:31},{name:"Kelly Kelly",rank:32},
    {name:"Cindy Rogers",rank:33},{name:"Jillian Hall",rank:34},{name:"Malia Hosaka",rank:35},
    {name:"Christie Ricci",rank:36},{name:"Becky Bayless",rank:37},
    {name:"Alere Little Feather",rank:38},{name:"Layla",rank:39},{name:"Kelly Couture",rank:40},
    {name:"Jaime D.",rank:41},{name:"Christy Hemme",rank:42},{name:"Milena Roucka",rank:43},
    {name:"Annie Social",rank:44},{name:"LuFisto",rank:45},{name:"Rhaka Khan",rank:46},
    {name:"Danyah",rank:47},{name:"Jennifer Blake",rank:48},{name:"Daffney",rank:49},
    {name:"Portia Perez",rank:50},
    // Men's rankings (separate list from women's top 50 above)
    {name:"Randy Orton",rank:1},{name:"Kurt Angle",rank:2},{name:"Triple H",rank:3},
    {name:"Samoa Joe",rank:4},{name:"Edge",rank:5},{name:"The Undertaker",rank:6},
    {name:"Shawn Michaels",rank:7},{name:"Nigel McGuinness",rank:8},{name:"John Cena",rank:9},
    {name:"Shinsuke Nakamura",rank:10},{name:"Takeshi Morishima",rank:11},{name:"Ultimo Guerrero",rank:12},
    {name:"Bryan Danielson",rank:13},{name:"Christian Cage",rank:14},{name:"Batista",rank:15},
    {name:"Keiji Mutoh",rank:16},{name:"Mistico",rank:17},{name:"Jeff Hardy",rank:18},
    {name:"Ric Flair",rank:19},{name:"Hiroshi Tanahashi",rank:20},{name:"AJ Styles",rank:21},
    {name:"Perro Aguayo Jr.",rank:22},{name:"MVP",rank:23},{name:"CM Punk",rank:24},
    {name:"Tomko",rank:25},{name:"El Mesias",rank:26},{name:"Jay Lethal",rank:27},
    {name:"Dr. Wagner Jr.",rank:28},{name:"Chris Jericho",rank:29},{name:"Kensuke Sasaki",rank:30},
    {name:"Austin Aries",rank:31},{name:"Cibernetico",rank:32},{name:"Kane",rank:33},
    {name:"Booker T",rank:34},{name:"Mr. Kennedy",rank:35},{name:"Chavo Guerrero",rank:36},
    {name:"Umaga",rank:37},{name:"Robert Roode",rank:38},{name:"Suwama",rank:39},
    {name:"John Bradshaw Layfield",rank:40},{name:"Matt Hardy",rank:41},{name:"James Storm",rank:42},
    {name:"John Morrison",rank:43},{name:"Adam Pearce",rank:44},{name:"Kaz",rank:45},
    {name:"CIMA",rank:46},{name:"Minoru Suzuki",rank:47},{name:"Petey Williams",rank:48},
    {name:"Jay Briscoe",rank:49},{name:"Mark Briscoe",rank:50},{name:"The Big Show",rank:51},
    {name:"Claudio Castagnoli",rank:52},{name:"Giant Bernard",rank:53},{name:"The Miz",rank:54},
    {name:"William Regal",rank:55},{name:"Finlay",rank:56},{name:"Yuji Nagata",rank:57},
    {name:"Chris Hero",rank:58},{name:"Rey Mysterio",rank:59},{name:"Eric Young",rank:60},
    {name:"Rhino",rank:61},{name:"Shelton Benjamin",rank:62},{name:"Carlito",rank:63},
    {name:"Scott Steiner",rank:64},{name:"Mark Henry",rank:65},{name:"Chuck Palumbo",rank:66},
    {name:"Homicide",rank:67},{name:"Averno",rank:68},{name:"Chris Sabin",rank:69},
    {name:"Alex Shelley",rank:70},{name:"Zorro",rank:71},{name:"Hernandez",rank:72},
    {name:"Dos Caras Jr.",rank:73},{name:"Jimmy Jacobs",rank:74},{name:"Orlando Colon",rank:75},
    {name:"Kofi Kingston",rank:76},{name:"Alan Stone",rank:77},{name:"Brother Ray",rank:78},
    {name:"Cody Rhodes",rank:79},{name:"Lance Cade",rank:80},{name:"Sonjay Dutt",rank:81},
    {name:"Brother Devon",rank:82},{name:"The Great Khali",rank:83},{name:"Sting",rank:84},
    {name:"El Hijo del Santo",rank:85},{name:"Kenta Kobashi",rank:86},{name:"Mitsuharu Misawa",rank:87},
    {name:"Tyler Black",rank:88},{name:"Masato Tanaka",rank:89},{name:"Naomichi Marufuji",rank:90},
    {name:"Santino Marella",rank:91},{name:"Hardcore Holly",rank:92},{name:"Satoshi Kojima",rank:93},
    {name:"Ron Killings",rank:94},{name:"Curry Man",rank:95},{name:"Trevor Murdoch",rank:96},
    {name:"KENTA",rank:97},{name:"Charly Manson",rank:98},{name:"Elijah Burke",rank:99},
    {name:"Toshiaki Kawada",rank:100},{name:"Nick Dinsmore",rank:101},{name:"Chessman",rank:102},
    {name:"Roderick Strong",rank:103},{name:"Abyss",rank:104},{name:"Mephisto",rank:105},
    {name:"Festus",rank:106},{name:"Davey Richards",rank:107},{name:"Rocky Romero",rank:108},
    {name:"Atlantis",rank:109},{name:"El Condor",rank:110},{name:"Brian Kendrick",rank:111},
    {name:"Negro Casas",rank:112},{name:"Halloween",rank:113},{name:"Tommy Dreamer",rank:114},
    {name:"Rey Bucanero",rank:115},{name:"Paul London",rank:116},{name:"Jerry Lynn",rank:117},
    {name:"Wataru Inoue",rank:118},{name:"Jushin Liger",rank:119},{name:"Brent Albright",rank:120},
    {name:"Blue Demon Jr.",rank:121},{name:"Shark Boy",rank:122},{name:"Hector Garza",rank:123},
    {name:"Blitz",rank:124},{name:"Jamie Noble",rank:125},{name:"Matt Morgan",rank:126},
    {name:"Black Warrior",rank:128},{name:"Kevin Steen",rank:129},{name:"Johnny Devine",rank:130},
    {name:"Paul Burchill",rank:131},{name:"Kip James",rank:132},{name:"Sangre Azteca",rank:133},
    {name:"Snitsky",rank:134},{name:"Togi Makabe",rank:135},{name:"Erick Stevens",rank:136},
    {name:"Masato Yoshino",rank:137},{name:"Mr. Niebla",rank:138},{name:"B.G. James",rank:139},
    {name:"Zack Ryder",rank:140},{name:"Curt Hawkins",rank:141},{name:"Juventud Guerrera",rank:142},
    {name:"El Generico",rank:143},{name:"Jimmy Wang Yang",rank:144},{name:"Jack Evans",rank:145},
    {name:"Mr. Aguila",rank:146},{name:"Jesse",rank:147},{name:"Joe Doering",rank:148},
    {name:"Vladimir Kozlov",rank:149},{name:"Lance Hoyt",rank:150},{name:"Mike Knox",rank:151},
    {name:"B.J. Whitmer",rank:152},{name:"Joey Matthews",rank:153},{name:"Big Daddy V",rank:154},
    {name:"Masahiro Chono",rank:155},{name:"Delirious",rank:156},{name:"Mike Quackenbush",rank:157},
    {name:"Milano Collection AT",rank:158},{name:"Shannon Moore",rank:159},{name:"Jimmy Rave",rank:160},
    {name:"Rellik",rank:161},{name:"Necro Butcher",rank:162},{name:"Eddie Colon",rank:163},
    {name:"Yoshihiro Takayama",rank:164},{name:"Deuce",rank:165},{name:"Matt Striker",rank:166},
    {name:"Chicano",rank:167},{name:"Mike DiBiase",rank:168},{name:"Domino",rank:169},
    {name:"Steve Corino",rank:170},{name:"Shawn Spears",rank:171},{name:"Marco Corleone",rank:172},
    {name:"Bryan Logan",rank:173},{name:"Yoshinobu Kanemaru",rank:174},{name:"Glen Osbourne",rank:175},
    {name:"Manabu Nakanishi",rank:176},{name:"Shad Gaspard",rank:177},{name:"Go Shiozaki",rank:178},
    {name:"Eric Perez",rank:179},{name:"Rory Fox",rank:180},{name:"Dragon Kid",rank:181},
    {name:"Toru Yano",rank:182},{name:"Joey Ryan",rank:183},{name:"Charlie Haas",rank:184},
    {name:"JTG",rank:185},{name:"Kevin Nash",rank:186},{name:"Ted DiBiase Jr.",rank:187},
    {name:"Human Tornado",rank:188},{name:"Nic Nemeth",rank:189},{name:"Chris Harris",rank:190},
    {name:"Volador Jr.",rank:191},{name:"La Sombra",rank:192},{name:"Heath Miller",rank:193},
    {name:"Super Crazy",rank:194},{name:"Consequences Creed",rank:195},{name:"Rory McAllister",rank:196},
    {name:"D.H. Smith",rank:197},{name:"Robbie McAllister",rank:198},{name:"Ruckus",rank:199},
    {name:"PAC",rank:200},{name:"Katsuhiko Nakajima",rank:201},{name:"Jigsaw",rank:202},
    {name:"Scott Lost",rank:203},{name:"Rob Eckos",rank:204},{name:"Ricky Reyes",rank:205},
    {name:"Tiger Mask IV",rank:207},{name:"Matt Cross",rank:208},{name:"El Sagrado",rank:209},
    {name:"Stevie Richards",rank:210},{name:"Tatsumi Fujinami",rank:211},{name:"L.A. Park",rank:212},
    {name:"Rikishi",rank:213},{name:"Ryusuke Taguchi",rank:214},{name:"Evan Bourne",rank:215},
    {name:"Drew McIntyre",rank:219},{name:"D-Lo Brown",rank:220},{name:"Jake Hager",rank:222},
    {name:"Chris Masters",rank:223},{name:"Naruki Doi",rank:225},{name:"Sheamus",rank:226},
    {name:"Low Ki",rank:227},{name:"Kid Kash",rank:228},{name:"2 Cold Scorpio",rank:230},
    {name:"Hiroyoshi Tenzan",rank:234},{name:"Teddy Hart",rank:236},{name:"La Mascara",rank:238},
    {name:"Heavy Metal",rank:240},{name:"T.J. Wilson",rank:241},{name:"Balls Mahoney",rank:243},
    {name:"Colt Cabana",rank:245},{name:"La Parka",rank:249},{name:"Sabu",rank:250},
    {name:"Masaaki Mochizuki",rank:255},{name:"Damian 666",rank:257},{name:"Ephesto",rank:259},
    {name:"Mike Mondo",rank:261},{name:"Rob Conway",rank:262},{name:"Shocker",rank:263},
    {name:"Nunzio",rank:264},{name:"Lince Dorado",rank:275},{name:"Jun Akiyama",rank:277},
    {name:"Eddie Kingston",rank:278},{name:"Madman Pondo",rank:279},{name:"Shingo Takagi",rank:283},
    {name:"Maximo",rank:286},{name:"Hallowicked",rank:289},{name:"Kotaro Suzuki",rank:290},
    {name:"Devon Moore",rank:300},{name:"Ricky Marvin",rank:301},{name:"Bobby Fish",rank:303},
    {name:"Chuck Taylor",rank:309},{name:"Rhett Titus",rank:311},{name:"Blue Panther",rank:313},
    {name:"Savio Vega",rank:314},{name:"Ultimo Dragon",rank:315},{name:"Val Venis",rank:318},
    {name:"TAKA Michinoku",rank:321},{name:"Tyson Dux",rank:323},{name:"Arik Cannon",rank:342},
    {name:"Doug Williams",rank:347},{name:"Al Snow",rank:348},{name:"John McChesney",rank:350},
    {name:"Orlando Jordan",rank:355},{name:"Yoshihiro Tajiri",rank:362},{name:"Jim Duggan",rank:377},
    {name:"Jerry Lawler",rank:380},{name:"Sean Waltman",rank:389},{name:"BxB Hulk",rank:392},
    {name:"Sho Funaki",rank:393},{name:"Colin Delaney",rank:400},{name:"Johnny Gargano",rank:410},
    {name:"Sami Callihan",rank:430},{name:"Brodie Lee",rank:437},{name:"Kenny King",rank:453},
    {name:"Tim Donst",rank:488},{name:"Larry Zbyszko",rank:492},{name:"Kurt Adonis",rank:500},
  ],
  2014: [
    {name:"Daniel Bryan",rank:1},{name:"Randy Orton",rank:2},{name:"John Cena",rank:3},
    {name:"AJ Styles",rank:4},{name:"Kazuchika Okada",rank:5},{name:"Bray Wyatt",rank:6},
    {name:"Roman Reigns",rank:7},{name:"Magnus",rank:8},{name:"Adam Cole",rank:9},
    {name:"Bully Ray",rank:10},{name:"Hiroshi Tanahashi",rank:11},{name:"Seth Rollins",rank:12},
    {name:"Cesaro",rank:13},{name:"Michael Elgin",rank:14},{name:"Bobby Lashley",rank:15},
    {name:"Batista",rank:16},{name:"Shinsuke Nakamura",rank:17},{name:"Dean Ambrose",rank:18},
    {name:"Eric Young",rank:19},{name:"Sheamus",rank:21},{name:"Alberto Del Rio",rank:22},
    {name:"Austin Aries",rank:23},{name:"Big E",rank:24},{name:"Jimmy Uso",rank:25},
    {name:"Jey Uso",rank:26},{name:"Kevin Steen",rank:27},{name:"Jeff Hardy",rank:29},
    {name:"Prince Devitt",rank:30},{name:"Samoa Joe",rank:31},{name:"KENTA",rank:32},
    {name:"The Big Show",rank:33},{name:"Luke Harper",rank:34},{name:"Jay Lethal",rank:35},
    {name:"Bobby Roode",rank:36},{name:"Bad News Barrett",rank:37},{name:"Jay Briscoe",rank:38},
    {name:"Adrian Neville",rank:39},{name:"Gunner",rank:40},{name:"Kane",rank:42},
    {name:"Chris Sabin",rank:43},{name:"Sami Zayn",rank:44},{name:"Eddie Edwards",rank:45},
    {name:"James Storm",rank:46},{name:"Matt Hardy",rank:47},{name:"Kurt Angle",rank:48},
    {name:"Davey Richards",rank:49},{name:"Ethan Carter III",rank:50},{name:"Ken Anderson",rank:51},
    {name:"Satoshi Kojima",rank:52},{name:"Ricochet",rank:53},{name:"Dolph Ziggler",rank:54},
    {name:"Chris Jericho",rank:55},{name:"The Miz",rank:56},{name:"Erick Rowan",rank:57},
    {name:"Roderick Strong",rank:58},{name:"Kofi Kingston",rank:59},{name:"Rob Van Dam",rank:60},
    {name:"Kyle O'Reilly",rank:61},{name:"Johnny Gargano",rank:62},{name:"Tetsuya Naito",rank:63},
    {name:"Joe Doering",rank:64},{name:"Rusev",rank:65},{name:"SANADA",rank:66},
    {name:"Tommaso Ciampa",rank:67},{name:"Chris Hero",rank:69},{name:"Karl Anderson",rank:70},
    {name:"Mark Henry",rank:71},{name:"Bobby Fish",rank:72},{name:"Bo Dallas",rank:73},
    {name:"Jack Swagger",rank:74},{name:"Ryback",rank:75},{name:"Nick Jackson",rank:76},
    {name:"Takeshi Morishima",rank:77},{name:"Christian",rank:78},{name:"Texano Jr.",rank:79},
    {name:"Matt Jackson",rank:80},{name:"Christopher Daniels",rank:81},{name:"Stardust",rank:82},
    {name:"Yuji Nagata",rank:83},{name:"Goldust",rank:84},{name:"Frankie Kazarian",rank:86},
    {name:"R-Truth",rank:87},{name:"Drew Gulak",rank:89},{name:"Jun Akiyama",rank:90},
    {name:"BxB Hulk",rank:91},{name:"Curtis Axel",rank:92},{name:"Matt Taven",rank:93},
    {name:"A.R. Fox",rank:94},{name:"Tyler Breeze",rank:95},{name:"Mark Briscoe",rank:96},
    {name:"Doc Gallows",rank:98},{name:"Kenny King",rank:99},{name:"MVP",rank:100},
    {name:"Sin Cara",rank:101},{name:"Damien Sandow",rank:102},{name:"Michael Bennett",rank:103},
    {name:"Rey Mysterio",rank:104},{name:"Jessie Godderz",rank:105},{name:"Davey Boy Smith Jr.",rank:106},
    {name:"Kota Ibushi",rank:107},{name:"Hiroyoshi Tenzan",rank:108},{name:"Abyss",rank:109},
    {name:"Alex Shelley",rank:110},{name:"Lance Archer",rank:112},{name:"Tyson Kidd",rank:113},
    {name:"Rhino",rank:115},{name:"KUSHIDA",rank:116},{name:"Rocky Romero",rank:117},
    {name:"Bad Luck Fale",rank:118},{name:"La Sombra",rank:119},{name:"Adam Pearce",rank:120},
    {name:"YAMATO",rank:121},{name:"Tomohiro Ishii",rank:129},{name:"Naomichi Marufuji",rank:130},
    {name:"Go Shiozaki",rank:131},{name:"Crazzy Steve",rank:132},{name:"Rich Swann",rank:133},
    {name:"Low Ki",rank:135},{name:"Justin Gabriel",rank:136},{name:"Corey Graves",rank:137},
    {name:"Colt Cabana",rank:140},{name:"Masato Tanaka",rank:141},{name:"Fandango",rank:142},
    {name:"Adam Rose",rank:144},{name:"Daisuke Sekimoto",rank:145},{name:"Volador Jr.",rank:147},
    {name:"Jimmy Jacobs",rank:148},{name:"Daga",rank:149},{name:"Zack Ryder",rank:153},
    {name:"Naruki Doi",rank:154},{name:"Kohei Sato",rank:156},{name:"Biff Busick",rank:157},
    {name:"ACH",rank:158},{name:"Fenix",rank:159},{name:"BJ Whitmer",rank:160},
    {name:"CIMA",rank:161},{name:"Takashi Sugiura",rank:165},{name:"Kalisto",rank:167},
    {name:"HARASHIMA",rank:168},{name:"Mojo Rawley",rank:170},{name:"Tigre Uno",rank:172},
    {name:"Katsuyori Shibata",rank:174},{name:"Chuck Taylor",rank:175},{name:"Heath Slater",rank:177},
    {name:"Cedric Alexander",rank:178},{name:"Titan",rank:179},{name:"Rockstar Spud",rank:180},
    {name:"Masakatsu Funaki",rank:182},{name:"Kenny Omega",rank:183},{name:"Xavier Woods",rank:185},
    {name:"Togi Makabe",rank:186},{name:"Caprice Coleman",rank:188},
    {name:"Drew Galloway",rank:196},{name:"Taiji Ishimori",rank:197},{name:"Trent Beretta",rank:200},
    {name:"Chavo Guerrero",rank:201},{name:"Silas Young",rank:206},{name:"Aiden English",rank:207},
    {name:"Uhaa Nation",rank:208},{name:"Minoru Suzuki",rank:209},{name:"David Starr",rank:210},
    {name:"Shelton Benjamin",rank:212},{name:"Simon Gotch",rank:215},{name:"Scorpio Sky",rank:216},
    {name:"Akira Tozawa",rank:219},{name:"Jeff Jarrett",rank:227},{name:"Jinder Mahal",rank:228},
    {name:"Titus O'Neil",rank:230},{name:"D-Lo Brown",rank:232},{name:"Rush",rank:243},
    {name:"Jushin Thunder Liger",rank:244},{name:"Tony Nese",rank:248},
    {name:"Paul London",rank:251},{name:"Hirooki Goto",rank:252},{name:"Masaaki Mochizuki",rank:254},
    {name:"Sonjay Dutt",rank:257},{name:"Dr. Wagner Jr.",rank:263},{name:"Brian Kendrick",rank:264},
    {name:"Joey Ryan",rank:261},{name:"BUSHI",rank:271},{name:"Tye Dillinger",rank:272},
    {name:"Jack Evans",rank:273},{name:"Baron Corbin",rank:274},{name:"Homicide",rank:279},
    {name:"Colin Cassady",rank:281},{name:"L.A. Park",rank:284},{name:"Eddie Kingston",rank:285},
    {name:"Chessman",rank:286},{name:"Jason Jordan",rank:289},{name:"Trevor Lee",rank:294},
    {name:"Tommy Dreamer",rank:300},{name:"Caleb Konley",rank:305},{name:"Alex Colon",rank:307},
    {name:"Raymond Rowe",rank:308},{name:"Zack Sabre Jr.",rank:310},{name:"Adam Page",rank:311},
    {name:"Tim Donst",rank:312},{name:"Shane Haste",rank:315},{name:"Psycho Clown",rank:317},
    {name:"Josh Alexander",rank:367},{name:"Timothy Thatcher",rank:372},{name:"Matt Tremont",rank:371},
    {name:"El Barbaro Cavernario",rank:380},{name:"Lince Dorado",rank:388},
    {name:"Shane Strickland",rank:340},{name:"Joe Gacy",rank:346},{name:"Chase Owens",rank:347},
    {name:"Ethan Page",rank:358},{name:"Mike Bailey",rank:425},{name:"Willie Mack",rank:422},
    {name:"Andrew Everett",rank:410},{name:"Tony Carbonie",rank:461},
    // Men #462-500
    {name:"Brandon Thurston",rank:462},{name:"Mike Posey",rank:463},{name:"Josh Hess",rank:464},
    {name:"Steve Stasiak",rank:465},{name:"The Stro",rank:466},{name:"Blackjack Phoenix",rank:467},
    {name:"Chief Attakullakulla",rank:468},{name:"Peter Avalon",rank:469},{name:"Joey Knight",rank:470},
    {name:"Greg Excellent",rank:476},{name:"Robin Knightwing",rank:477},
    {name:"Jaxon Jarvis",rank:478},{name:"Brandon Scott",rank:479},{name:"Cheeseburger",rank:480},
    {name:"Kevin Bennett",rank:481},{name:"Dalton Castle",rank:482},{name:"Jeff Cobb",rank:489},
    {name:"Barry Hardy",rank:491},{name:"Kratos",rank:494},{name:"Chris Perish",rank:495},
    {name:"Mr. Juicy",rank:496},{name:"Grado",rank:500},
    // Women's rankings (separate list)
    {name:"Paige",rank:1},{name:"AJ Lee",rank:2},{name:"Gail Kim",rank:3},
    {name:"Cheerleader Melissa",rank:4},{name:"LuFisto",rank:5},{name:"Angelina Love",rank:6},
    {name:"Ivelisse Velez",rank:7},{name:"Courtney Rush",rank:8},{name:"Natalya",rank:9},
    {name:"Charlotte",rank:10},{name:"Madison Rayne",rank:11},{name:"Barbi Hayden",rank:12},
    {name:"Jessicka Havok",rank:13},{name:"Saraya Knight",rank:14},{name:"Brittany",rank:15},
    {name:"Brie Bella",rank:16},{name:"Cameron",rank:17},{name:"Kacee Carlisle",rank:18},
    {name:"Bayley",rank:19},{name:"Mia Yim",rank:20},{name:"Kellie Skater",rank:21},
    {name:"Mercedes Martinez",rank:22},{name:"Athena",rank:23},{name:"Nikki Bella",rank:24},
    {name:"Alicia Fox",rank:25},{name:"Cherry Bomb",rank:26},{name:"Su Yung",rank:27},
    {name:"Kimber Lee",rank:28},{name:"Emma",rank:29},{name:"Nicole Matthews",rank:30},
    {name:"Leva Bates",rank:31},{name:"Nikki Storm",rank:32},{name:"Candice LeRae",rank:33},
    {name:"Mickie Knuckles",rank:34},{name:"Portia Perez",rank:35},{name:"Taryn Terrell",rank:36},
    {name:"Nevaeh",rank:37},{name:"Marti Belle",rank:38},{name:"Naomi",rank:39},
    {name:"Velvet Sky",rank:40},{name:"Becky Lynch",rank:41},{name:"Veda Scott",rank:42},
    {name:"Amber O'Neal",rank:43},{name:"Sassy Stephie",rank:44},{name:"Christina Von Eerie",rank:45},
    {name:"Crazy Mary Dobson",rank:46},{name:"Jessie Kaye",rank:47},{name:"Heidi Lovelace",rank:48},
    {name:"Angie Skye",rank:49},{name:"Kat Von Heez",rank:50},
  ],
  2013: [
    {name:"John Cena",rank:1},{name:"CM Punk",rank:2},{name:"Hiroshi Tanahashi",rank:3},
    {name:"Bully Ray",rank:4},{name:"Kazuchika Okada",rank:5},{name:"Sheamus",rank:6},
    {name:"Jeff Hardy",rank:7},{name:"Alberto Del Rio",rank:8},{name:"Dolph Ziggler",rank:9},
    {name:"Kevin Steen",rank:10},{name:"Daniel Bryan",rank:11},{name:"Austin Aries",rank:12},
    {name:"Ryback",rank:13},{name:"The Big Show",rank:14},{name:"Randy Orton",rank:15},
    {name:"Kane",rank:16},{name:"Suwama",rank:17},{name:"Antonio Cesaro",rank:18},
    {name:"James Storm",rank:19},{name:"Kofi Kingston",rank:20},{name:"Wade Barrett",rank:21},
    {name:"KENTA",rank:22},{name:"Kurt Angle",rank:23},{name:"Bobby Roode",rank:24},
    {name:"Chris Jericho",rank:25},{name:"Dean Ambrose",rank:26},{name:"Jay Briscoe",rank:27},
    {name:"AJ Styles",rank:28},{name:"Jack Swagger",rank:29},{name:"Takeshi Morishima",rank:30},
    {name:"The Miz",rank:31},{name:"Devon",rank:32},{name:"Big E. Langston",rank:33},
    {name:"Seth Rollins",rank:35},{name:"Kenny King",rank:36},{name:"Michael Elgin",rank:37},
    {name:"Prince Devitt",rank:38},{name:"Roman Reigns",rank:39},{name:"Mark Henry",rank:40},
    {name:"Samoa Joe",rank:41},{name:"Davey Richards",rank:42},{name:"Magnus",rank:43},
    {name:"Jay Lethal",rank:44},{name:"Christopher Daniels",rank:45},{name:"Sting",rank:46},
    {name:"Curtis Axel",rank:47},{name:"El Texano Jr.",rank:48},{name:"Mark Briscoe",rank:49},
    {name:"Damien Sandow",rank:50},{name:"Johnny Gargano",rank:51},{name:"La Sombra",rank:52},
    {name:"Cody Rhodes",rank:53},{name:"Shinsuke Nakamura",rank:54},{name:"Adam Cole",rank:55},
    {name:"Kazarian",rank:56},{name:"Hernandez",rank:57},{name:"R-Truth",rank:58},
    {name:"Fandango",rank:59},{name:"Chavo Guerrero Jr.",rank:60},{name:"Eddie Edwards",rank:61},
    {name:"Mr. Anderson",rank:62},{name:"Rob Van Dam",rank:63},{name:"Rey Mysterio",rank:64},
    {name:"Sami Callihan",rank:66},{name:"Roderick Strong",rank:67},{name:"Sami Zayn",rank:68},
    {name:"Togi Makabe",rank:70},{name:"Christian",rank:72},{name:"Kyle O'Reilly",rank:73},
    {name:"Sin Cara",rank:75},{name:"Jun Akiyama",rank:76},{name:"CIMA",rank:77},
    {name:"Bo Dallas",rank:79},{name:"Go Shiozaki",rank:80},{name:"Bobby Fish",rank:81},
    {name:"Titus O'Neil",rank:82},{name:"Abyss",rank:83},{name:"Mike Bennett",rank:85},
    {name:"Gunner",rank:86},{name:"Rhino",rank:87},{name:"Karl Anderson",rank:88},
    {name:"Darren Young",rank:89},{name:"Volador Jr.",rank:90},{name:"Adam Pearce",rank:91},
    {name:"Steve Corino",rank:92},{name:"Matt Taven",rank:93},{name:"Lance Archer",rank:95},
    {name:"Jimmy Jacobs",rank:96},{name:"A.R. Fox",rank:97},{name:"Davey Boy Smith Jr.",rank:98},
    {name:"Colt Cabana",rank:99},{name:"Minoru Suzuki",rank:100},{name:"Kassius Ohno",rank:102},
    {name:"Matt Hardy",rank:103},{name:"Tensai",rank:105},{name:"Samuray del Sol",rank:106},
    {name:"Jimmy Uso",rank:107},{name:"Blue Demon Jr.",rank:108},{name:"Satoshi Kojima",rank:109},
    {name:"Jey Uso",rank:110},{name:"Tyson Kidd",rank:111},{name:"Adrian Neville",rank:112},
    {name:"ACH",rank:113},{name:"Hiroyoshi Tenzan",rank:114},{name:"Bray Wyatt",rank:115},
    {name:"Alex Shelley",rank:116},{name:"Leo Kruger",rank:117},{name:"Corey Graves",rank:118},
    {name:"Naomichi Marufuji",rank:119},{name:"Rhett Titus",rank:120},{name:"Caprice Coleman",rank:121},
    {name:"KUSHIDA",rank:122},{name:"L.A. Park",rank:123},{name:"Shelton Benjamin",rank:124},
    {name:"Kenny Omega",rank:125},{name:"Luke Harper",rank:126},{name:"Ricochet",rank:127},
    {name:"Takashi Sugiura",rank:128},{name:"Cedric Alexander",rank:129},{name:"Rush",rank:131},
    {name:"Erick Rowan",rank:145},{name:"Santino Marella",rank:147},{name:"Jinder Mahal",rank:148},
    {name:"T.J. Perkins",rank:150},{name:"Matt Jackson",rank:151},{name:"Mascara Dorada",rank:152},
    {name:"Ted DiBiase Jr.",rank:155},{name:"William Regal",rank:156},{name:"Nick Jackson",rank:157},
    {name:"Drew McIntyre",rank:159},{name:"Chuck Taylor",rank:160},{name:"El Super Fenix",rank:163},
    {name:"Curt Hawkins",rank:164},{name:"Ryusuke Taguchi",rank:166},{name:"Eddie Kingston",rank:168},
    {name:"Kota Ibushi",rank:169},{name:"Stevie Richards",rank:171},{name:"B.J. Whitmer",rank:172},
    {name:"Katsuyori Shibata",rank:187},{name:"Dr. Wagner Jr.",rank:188},{name:"JTG",rank:190},
    {name:"Cibernetico",rank:192},{name:"Masato Tanaka",rank:193},{name:"Q.T. Marshall",rank:194},
    {name:"Hunico",rank:196},{name:"David Starr",rank:197},{name:"Shawn Spears",rank:202},
    {name:"La Mascara",rank:204},{name:"El Hijo del Santo",rank:206},{name:"Taiji Ishimori",rank:211},
    {name:"Spud",rank:212},{name:"Averno",rank:213},{name:"Brian Kendrick",rank:214},
    {name:"Paul London",rank:216},{name:"Ultimo Dragon",rank:217},{name:"Katsuhiko Nakajima",rank:219},
    {name:"Uhaa Nation",rank:224},{name:"Jushin Thunder Liger",rank:226},{name:"Ultimo Guerrero",rank:227},
    {name:"Jessie Godderz",rank:228},{name:"Yuji Nagata",rank:229},{name:"Mojo Rawley",rank:230},
    {name:"Xavier Woods",rank:232},{name:"BxB Hulk",rank:233},{name:"Akira Tozawa",rank:238},
    {name:"Super Crazy",rank:240},{name:"Pentagon Jr.",rank:251},{name:"Anthony Nese",rank:253},
    {name:"Tyler Breeze",rank:255},{name:"Tetsuya Naito",rank:259},{name:"Petey Williams",rank:260},
    {name:"Jack Evans",rank:267},{name:"Delirious",rank:269},{name:"Scorpio Sky",rank:271},
    {name:"MVP",rank:272},{name:"Carlito",rank:274},{name:"Rey Escorpion",rank:276},
    {name:"Daisuke Sekimoto",rank:279},{name:"Chris Masters",rank:280},{name:"Marco Corleone",rank:285},
    {name:"Mason Ryan",rank:286},{name:"Trent Beretta",rank:287},{name:"Richie Steamboat",rank:293},
    {name:"Teddy Hart",rank:294},{name:"Danny Havoc",rank:295},{name:"Chessman",rank:296},
    {name:"Tama Tonga",rank:298},{name:"Mike Quackenbush",rank:299},{name:"Shuji Ishikawa",rank:303},
    {name:"Atlantis",rank:304},{name:"Jigsaw",rank:305},{name:"John Morrison",rank:309},
    {name:"Hallowicked",rank:315},{name:"Negro Casas",rank:330},{name:"Brian Cage",rank:333},
    {name:"Rich Swann",rank:339},{name:"Jake Crist",rank:340},{name:"Drew Gulak",rank:342},
    {name:"Dave Crist",rank:346},{name:"Robbie Eagles",rank:347},{name:"Rocky Romero",rank:358},
    {name:"Shane Haste",rank:359},{name:"Eita",rank:368},{name:"Josh Alexander",rank:369},
    {name:"Ethan Page",rank:371},{name:"Mikey Nicholls",rank:373},{name:"Homicide",rank:374},
    {name:"Tiger Mask IV",rank:375},{name:"Danny Burch",rank:382},{name:"Ray Rosas",rank:385},
    {name:"Tommy Dreamer",rank:321},{name:"Jon Davis",rank:418},{name:"Matt Tremont",rank:419},
    {name:"Lince Dorado",rank:444},{name:"Shane Strickland",rank:435},{name:"Joe Gacy",rank:405},
    {name:"Crazzy Steve",rank:422},{name:"Garrett Dylan",rank:464},
    // Women's rankings 2013
    {name:"Cheerleader Melissa",rank:1},{name:"Mickie James",rank:2},{name:"Saraya Knight",rank:3},
    {name:"Jessicka Havok",rank:4},{name:"Kaitlyn",rank:5},{name:"Gail Kim",rank:6},
    {name:"Tara",rank:8},{name:"AJ Lee",rank:9},{name:"Mercedes Martinez",rank:10},
    {name:"Velvet Sky",rank:11},{name:"Paige",rank:12},{name:"Natalya",rank:13},
    {name:"Madison Eagles",rank:14},{name:"Taryn Terrell",rank:17},{name:"Layla",rank:18},
    {name:"Brooke Tessmacher",rank:19},{name:"MsChif",rank:20},{name:"LuFisto",rank:21},
    {name:"Brie Bella",rank:22},{name:"Naomi",rank:24},{name:"Athena",rank:25},
    {name:"Nicole Matthews",rank:26},{name:"Cherry Bomb",rank:28},{name:"Portia Perez",rank:29},
    {name:"Allysin Kay",rank:31},{name:"Nikki Bella",rank:32},{name:"Alicia Fox",rank:35},
    {name:"Cameron",rank:37},{name:"Emma",rank:38},{name:"Bayley",rank:47},
    {name:"Mia Yim",rank:41},{name:"Santana Garrett",rank:45},{name:"Veda Scott",rank:43},
  ],
  2012: [
    {name:"CM Punk",rank:1},{name:"Bobby Roode",rank:2},{name:"John Cena",rank:3},
    {name:"Daniel Bryan",rank:4},{name:"Sheamus",rank:5},{name:"Jun Akiyama",rank:6},
    {name:"Davey Richards",rank:7},{name:"Kurt Angle",rank:8},{name:"Mark Henry",rank:9},
    {name:"Alberto Del Rio",rank:10},{name:"Hiroshi Tanahashi",rank:11},{name:"James Storm",rank:12},
    {name:"Austin Aries",rank:13},{name:"Randy Orton",rank:14},{name:"Christian",rank:15},
    {name:"Dolph Ziggler",rank:16},{name:"The Big Show",rank:17},{name:"Eddie Edwards",rank:18},
    {name:"L.A. Park",rank:19},{name:"Kevin Steen",rank:20},{name:"Jeff Hardy",rank:21},
    {name:"Kane",rank:22},{name:"Cody Rhodes",rank:23},{name:"Takashi Sugiura",rank:24},
    {name:"Brother Devon",rank:25},{name:"Dr. Wagner Jr.",rank:26},{name:"Mr. Anderson",rank:27},
    {name:"AJ Styles",rank:28},{name:"Chris Jericho",rank:29},{name:"Bully Ray",rank:30},
    {name:"Kofi Kingston",rank:31},{name:"Roderick Strong",rank:32},{name:"Jack Swagger",rank:33},
    {name:"Sting",rank:35},{name:"R-Truth",rank:36},{name:"Rob Van Dam",rank:37},
    {name:"Go Shiozaki",rank:38},{name:"Jay Lethal",rank:39},{name:"Kazuchika Okada",rank:40},
    {name:"Crimson",rank:41},{name:"Shelton Benjamin",rank:42},{name:"Magnus",rank:43},
    {name:"Colt Cabana",rank:44},{name:"Tensai",rank:45},{name:"Seth Rollins",rank:46},
    {name:"Shinsuke Nakamura",rank:47},{name:"Christopher Daniels",rank:48},
    {name:"The Miz",rank:49},{name:"Matt Morgan",rank:50},{name:"Samoa Joe",rank:51},
    {name:"Sami Callihan",rank:52},{name:"Charlie Haas",rank:53},{name:"Michael Elgin",rank:54},
    {name:"Gunner",rank:55},{name:"Wade Barrett",rank:56},{name:"Jeff Jarrett",rank:57},
    {name:"Kazarian",rank:58},{name:"Johnny Gargano",rank:59},{name:"Santino Marella",rank:60},
    {name:"Takeshi Morishima",rank:61},{name:"Adam Pearce",rank:62},{name:"Jay Briscoe",rank:63},
    {name:"Karl Anderson",rank:64},{name:"Mark Briscoe",rank:65},{name:"Prince Devitt",rank:68},
    {name:"Averno",rank:69},{name:"Zack Ryder",rank:70},{name:"Tommaso Ciampa",rank:71},
    {name:"Primo",rank:72},{name:"Satoshi Kojima",rank:73},{name:"Brodus Clay",rank:74},
    {name:"Adam Cole",rank:75},{name:"Epico",rank:76},{name:"Leo Kruger",rank:77},
    {name:"Mike Bennett",rank:78},{name:"YAMATO",rank:79},{name:"Negro Casas",rank:80},
    {name:"Hiroyoshi Tenzan",rank:81},{name:"La Mascara",rank:82},{name:"El Generico",rank:83},
    {name:"Kenny King",rank:85},{name:"Eric Young",rank:86},{name:"Hernandez",rank:87},
    {name:"PAC",rank:89},{name:"Damien Sandow",rank:90},{name:"Jey Uso",rank:91},
    {name:"Jimmy Uso",rank:92},{name:"Hunico",rank:93},{name:"Harry Smith",rank:94},
    {name:"Tetsuya Naito",rank:95},{name:"Carlito",rank:96},{name:"Evan Bourne",rank:97},
    {name:"Rhett Titus",rank:98},{name:"Richie Steamboat",rank:99},{name:"Justin Gabriel",rank:100},
    {name:"Sin Cara",rank:101},{name:"Kyle O'Reilly",rank:102},{name:"Luke Harper",rank:107},
    {name:"Tyson Kidd",rank:108},{name:"Heath Slater",rank:109},{name:"Alex Shelley",rank:110},
    {name:"Antonio Cesaro",rank:111},{name:"Ryback",rank:112},{name:"Suwama",rank:113},
    {name:"Finlay",rank:114},{name:"Abyss",rank:115},{name:"Masato Yoshino",rank:116},
    {name:"Jerry Lynn",rank:117},{name:"Togi Makabe",rank:118},{name:"Xavier Woods",rank:119},
    {name:"Ultimo Dragon",rank:120},{name:"La Sombra",rank:121},{name:"Shingo",rank:122},
    {name:"Masaaki Mochizuki",rank:123},{name:"Akira Tozawa",rank:124},
    {name:"Kassius Ohno",rank:125},{name:"Yoshi Tatsu",rank:126},{name:"Chuck Taylor",rank:127},
    {name:"Hirooki Goto",rank:128},{name:"Rhino",rank:129},{name:"Low Ki",rank:130},
    {name:"Naomichi Marufuji",rank:132},{name:"Volador Jr.",rank:134},
    {name:"Bo Dallas",rank:142},{name:"Yuji Nagata",rank:143},{name:"Rush",rank:145},
    {name:"Douglas Williams",rank:146},{name:"Drake Younger",rank:147},{name:"A.R. Fox",rank:148},
    {name:"BxB Hulk",rank:149},{name:"Jushin Thunder Liger",rank:150},{name:"CIMA",rank:152},
    {name:"Ryusuke Taguchi",rank:153},{name:"Uhaa Nation",rank:155},{name:"Rey Escorpion",rank:156},
    {name:"Darren Young",rank:157},{name:"Blue Demon Jr.",rank:158},{name:"Shannon Moore",rank:159},
    {name:"Caprice Coleman",rank:160},{name:"Cedric Alexander",rank:164},
    {name:"Minoru Suzuki",rank:165},{name:"Jinder Mahal",rank:166},{name:"Ultimo Guerrero",rank:167},
    {name:"Bray Wyatt",rank:168},{name:"Titus O'Neil",rank:169},{name:"Matt Jackson",rank:173},
    {name:"KENTA",rank:174},{name:"Nick Jackson",rank:179},{name:"Shawn Spears",rank:180},
    {name:"Mark Haskins",rank:181},{name:"Kota Ibushi",rank:184},{name:"Kenny Omega",rank:185},
    {name:"Ted DiBiase Jr.",rank:186},{name:"Drew McIntyre",rank:191},
    {name:"Michael McGillicutty",rank:197},{name:"Corey Graves",rank:200},
    {name:"Eddie Kingston",rank:201},{name:"Naruki Doi",rank:202},{name:"Masato Tanaka",rank:203},
    {name:"JTG",rank:208},{name:"Brian Kendrick",rank:212},{name:"Cibernetico",rank:213},
    {name:"Delirious",rank:215},{name:"Mike Quackenbush",rank:218},{name:"Scott Steiner",rank:219},
    {name:"Trent Beretta",rank:221},{name:"Josh Alexander",rank:222},{name:"Ricochet",rank:227},
    {name:"Texano Jr.",rank:230},{name:"Dragon Kid",rank:231},{name:"Chessman",rank:232},
    {name:"Devon Moore",rank:235},{name:"Petey Williams",rank:236},{name:"Rocky Romero",rank:237},
    {name:"Paul London",rank:238},{name:"Mascara Dorada",rank:239},{name:"Hallowicked",rank:240},
    {name:"Steve Corino",rank:241},{name:"TAJIRI",rank:245},{name:"Dean Ambrose",rank:254},
    {name:"MVP",rank:263},{name:"Big E. Langston",rank:265},{name:"Joey Ryan",rank:266},
    {name:"Homicide",rank:271},{name:"Rich Swann",rank:276},{name:"Shane Haste",rank:277},
    {name:"Jigsaw",rank:278},{name:"John Silver",rank:280},{name:"Silas Young",rank:282},
    {name:"Lince Dorado",rank:336},{name:"Anthony Nese",rank:291},{name:"Sabu",rank:304},
    {name:"Jason Jordan",rank:319},{name:"Caleb Konley",rank:320},{name:"Alexander Rusev",rank:323},
    {name:"Willie Mack",rank:332},{name:"Drew Gulak",rank:345},{name:"Leakee",rank:351},
    {name:"The Amazing Red",rank:353},{name:"Bobby Fish",rank:369},{name:"Jimmy Jacobs",rank:371},
    {name:"Timothy Thatcher",rank:393},{name:"Sara Del Rey",rank:430},
    {name:"Scorpio Sky",rank:410},{name:"Samuray del Sol",rank:441},
    {name:"Jessie Godderz",rank:442},{name:"Joe Gacy",rank:448},{name:"Lumberjack LeRoux",rank:484},
    // Women's rankings 2012
    {name:"Gail Kim",rank:1},{name:"Beth Phoenix",rank:2},{name:"Cheerleader Melissa",rank:3},
    {name:"Sara Del Rey",rank:4},{name:"Jessicka Havok",rank:5},{name:"Layla",rank:6},
    {name:"Miss Tessmacher",rank:7},{name:"Saraya Knight",rank:8},{name:"Mercedes Martinez",rank:9},
    {name:"Tara",rank:10},{name:"Hailey Hatred",rank:11},{name:"Natalya",rank:12},
    {name:"Jazz",rank:13},{name:"Velvet Sky",rank:14},{name:"Madison Rayne",rank:15},
    {name:"Mickie James",rank:16},{name:"LuFisto",rank:17},{name:"Winter",rank:18},
    {name:"Tamina Snuka",rank:19},{name:"MsChif",rank:20},{name:"Eve Torres",rank:22},
    {name:"Kelly Kelly",rank:23},{name:"Paige",rank:30},{name:"Angelina Love",rank:31},
    {name:"Portia Perez",rank:32},{name:"Allysin Kay",rank:43},{name:"Marti Belle",rank:47},
    {name:"Leva Bates",rank:49},{name:"Veda Scott",rank:50},{name:"Athena",rank:28},
  ],
  2011: [
    {name:"The Miz",rank:1},{name:"Randy Orton",rank:2},{name:"John Cena",rank:3},
    {name:"Kane",rank:4},{name:"Takashi Sugiura",rank:5},{name:"Alberto Del Rio",rank:6},
    {name:"Mr. Anderson",rank:7},{name:"Rey Mysterio",rank:8},{name:"Eddie Edwards",rank:9},
    {name:"CM Punk",rank:10},{name:"Rob Van Dam",rank:11},{name:"Sheamus",rank:12},
    {name:"Roderick Strong",rank:13},{name:"Suwama",rank:14},{name:"Daniel Bryan",rank:15},
    {name:"Jeff Hardy",rank:16},{name:"Dolph Ziggler",rank:17},{name:"Kurt Angle",rank:18},
    {name:"Wade Barrett",rank:19},{name:"Jeff Jarrett",rank:20},{name:"Sting",rank:21},
    {name:"Hiroshi Tanahashi",rank:22},{name:"AJ Styles",rank:24},{name:"Davey Richards",rank:25},
    {name:"Christopher Daniels",rank:26},{name:"John Morrison",rank:27},{name:"Dr. Wagner Jr.",rank:28},
    {name:"Kofi Kingston",rank:29},{name:"Bobby Roode",rank:30},{name:"The Big Show",rank:31},
    {name:"Matt Morgan",rank:32},{name:"Christian",rank:33},{name:"Kazarian",rank:34},
    {name:"Cody Rhodes",rank:35},{name:"Chris Hero",rank:36},{name:"James Storm",rank:37},
    {name:"Jack Swagger",rank:39},{name:"Bully Ray",rank:40},{name:"Satoshi Kojima",rank:41},
    {name:"Samoa Joe",rank:42},{name:"Sin Cara",rank:43},{name:"Claudio Castagnoli",rank:44},
    {name:"Shinsuke Nakamura",rank:45},{name:"El Generico",rank:46},{name:"Alex Shelley",rank:47},
    {name:"Chris Sabin",rank:48},{name:"Adam Pearce",rank:49},{name:"R-Truth",rank:51},
    {name:"Drew McIntyre",rank:52},{name:"Seth Rollins",rank:53},{name:"Togi Makabe",rank:54},
    {name:"Hernandez",rank:55},{name:"Mark Henry",rank:57},{name:"Negro Casas",rank:58},
    {name:"Abyss",rank:60},{name:"Justin Gabriel",rank:61},{name:"Douglas Williams",rank:62},
    {name:"Brother Devon",rank:63},{name:"Go Shiozaki",rank:64},{name:"Matt Hardy",rank:65},
    {name:"Heath Slater",rank:66},{name:"Robbie E",rank:67},{name:"Ted DiBiase Jr.",rank:68},
    {name:"Evan Bourne",rank:69},{name:"Naomichi Marufuji",rank:70},{name:"Shelton Benjamin",rank:71},
    {name:"Tommy Dreamer",rank:72},{name:"Prince Devitt",rank:73},{name:"Jay Briscoe",rank:74},
    {name:"Austin Aries",rank:76},{name:"Max Buck",rank:77},{name:"Ezekiel Jackson",rank:78},
    {name:"Charlie Haas",rank:79},{name:"Jushin Thunder Liger",rank:80},{name:"Mark Briscoe",rank:81},
    {name:"Kenny Omega",rank:85},{name:"Shingo Takagi",rank:86},{name:"Carlito",rank:87},
    {name:"Volador Jr.",rank:88},{name:"Crimson",rank:89},{name:"BxB Hulk",rank:90},
    {name:"Shannon Moore",rank:91},{name:"Homicide",rank:93},{name:"Colt Cabana",rank:94},
    {name:"Yuji Nagata",rank:95},{name:"Eric Young",rank:96},{name:"YAMATO",rank:98},
    {name:"Tommaso Ciampa",rank:99},{name:"Santino Marella",rank:100},{name:"Kenny King",rank:101},
    {name:"Jon Moxley",rank:102},{name:"Low Ki",rank:104},{name:"Alex Riley",rank:106},
    {name:"Brian Kendrick",rank:107},{name:"Jimmy Jacobs",rank:108},{name:"Rhett Titus",rank:109},
    {name:"Scott Steiner",rank:110},{name:"Minoru Suzuki",rank:111},{name:"La Parka",rank:112},
    {name:"Tyson Kidd",rank:113},{name:"Mike Bennett",rank:114},{name:"Adam Cole",rank:115},
    {name:"Jay Lethal",rank:118},{name:"Kevin Steen",rank:122},{name:"Minoru Tanaka",rank:123},
    {name:"David Hart Smith",rank:124},{name:"Ryota Hama",rank:125},{name:"Hirooki Goto",rank:127},
    {name:"Blue Demon Jr.",rank:128},{name:"Husky Harris",rank:129},{name:"Giant Bernard",rank:130},
    {name:"La Sombra",rank:131},{name:"Chessman",rank:133},{name:"Kaz Hayashi",rank:134},
    {name:"Ryusuke Taguchi",rank:135},{name:"Yoshi Tatsu",rank:137},{name:"Toru Yano",rank:139},
    {name:"Zack Ryder",rank:140},{name:"Delirious",rank:141},{name:"Primo Colon",rank:143},
    {name:"Karl Anderson",rank:144},{name:"L.A. Park",rank:146},{name:"Averno",rank:147},
    {name:"Joe Doering",rank:151},{name:"JTG",rank:153},{name:"Kota Ibushi",rank:154},
    {name:"Takeshi Morishima",rank:155},{name:"Mephisto",rank:156},{name:"Rhino",rank:160},
    {name:"Steve Corino",rank:161},{name:"Chavo Guerrero Jr.",rank:162},{name:"Magnus",rank:164},
    {name:"Chris Masters",rank:165},{name:"Masato Tanaka",rank:166},{name:"William Regal",rank:169},
    {name:"CIMA",rank:171},{name:"Trent Beretta",rank:172},{name:"KENTA",rank:173},
    {name:"Curt Hawkins",rank:175},{name:"Paul London",rank:177},{name:"Luke Gallows",rank:178},
    {name:"Kensuke Sasaki",rank:179},{name:"Atlantis",rank:182},{name:"Yoshihiro Tajiri",rank:183},
    {name:"Tetsuya Naito",rank:186},{name:"Sami Callihan",rank:187},{name:"PAC",rank:188},
    {name:"Jimmy Uso",rank:189},{name:"Jon Davis",rank:190},{name:"Bo Rotundo",rank:191},
    {name:"Jey Uso",rank:192},{name:"Jun Akiyama",rank:193},{name:"Jack Evans",rank:199},
    {name:"Arik Cannon",rank:200},{name:"Perro Aguayo Jr.",rank:201},{name:"Taiji Ishimori",rank:204},
    {name:"Darren Young",rank:205},{name:"Richie Steamboat",rank:206},{name:"Xavier Woods",rank:208},
    {name:"Big E. Langston",rank:215},{name:"Silver King",rank:217},{name:"Brodie Lee",rank:220},
    {name:"Michael Elgin",rank:229},{name:"Raven",rank:230},{name:"Matt Taven",rank:231},
    {name:"Kyle O'Reilly",rank:231},{name:"Tim Donst",rank:247},{name:"Titus O'Neil",rank:248},
    {name:"Vampiro",rank:250},{name:"Rich Swann",rank:297},{name:"Dragon Kid",rank:299},
    {name:"Silas Young",rank:309},{name:"T.J. Perkins",rank:318},{name:"Hallowicked",rank:319},
    {name:"Damien Sandow",rank:276},{name:"Joey Ryan",rank:277},{name:"Chuck Taylor",rank:279},
    {name:"Okada",rank:285},{name:"Eddie Kingston",rank:287},{name:"Mike Quackenbush",rank:288},
    {name:"Rocky Romero",rank:290},{name:"Hunico",rank:295},{name:"Jinder Mahal",rank:335},
    {name:"Alexander Rusev",rank:337},{name:"Jake Crist",rank:353},{name:"D.J. Hyde",rank:355},
    {name:"Shane Haste",rank:360},{name:"Lince Dorado",rank:362},{name:"Dave Crist",rank:363},
    {name:"Josh Alexander",rank:384},{name:"R.J. City",rank:386},{name:"Ricochet",rank:395},
    {name:"Ethan Page",rank:483},{name:"Roman Leakee",rank:370},{name:"Joe Gacy",rank:441},
    {name:"Crazzy Steve",rank:415},{name:"Gino Martino",rank:500},
    // Women's rankings 2011
    {name:"Madison Eagles",rank:1},{name:"Mercedes Martinez",rank:2},{name:"Mickie James",rank:3},
    {name:"Natalya",rank:4},{name:"Madison Rayne",rank:5},{name:"Cheerleader Melissa",rank:6},
    {name:"Beth Phoenix",rank:7},{name:"Tara",rank:8},{name:"MsChif",rank:9},
    {name:"Sara Del Rey",rank:10},{name:"Eve Torres",rank:11},{name:"Angelina Love",rank:12},
    {name:"Layla",rank:13},{name:"Kelly Kelly",rank:15},{name:"Serena Deeb",rank:16},
    {name:"Velvet Sky",rank:17},{name:"Ayako Hamada",rank:18},{name:"LuFisto",rank:19},
    {name:"Winter",rank:20},{name:"Brie Bella",rank:21},{name:"Melina",rank:23},
    {name:"Daizee Haze",rank:24},{name:"Gail Kim",rank:26},{name:"Jazz",rank:27},
    {name:"Maryse",rank:28},{name:"Alicia Fox",rank:43},{name:"AJ Lee",rank:48},
  ],
  2010: [
    {name:"AJ Styles",rank:1},{name:"John Cena",rank:2},{name:"CM Punk",rank:3},
    {name:"Randy Orton",rank:4},{name:"Chris Jericho",rank:5},{name:"Batista",rank:6},
    {name:"Shinsuke Nakamura",rank:7},{name:"The Undertaker",rank:8},{name:"Kurt Angle",rank:9},
    {name:"Sheamus",rank:10},{name:"Triple H",rank:11},{name:"The Miz",rank:12},
    {name:"Rey Mysterio",rank:13},{name:"Takashi Sugiura",rank:14},{name:"Rob Van Dam",rank:15},
    {name:"Dr. Wagner Jr.",rank:16},{name:"The Big Show",rank:17},{name:"Edge",rank:18},
    {name:"Tyler Black",rank:19},{name:"Jeff Hardy",rank:20},{name:"Jack Swagger",rank:21},
    {name:"Christian",rank:22},{name:"Abyss",rank:23},{name:"Ryota Hama",rank:24},
    {name:"Austin Aries",rank:25},{name:"Kofi Kingston",rank:26},{name:"John Morrison",rank:27},
    {name:"Desmond Wolfe",rank:28},{name:"Ultimo Guerrero",rank:29},{name:"Drew McIntyre",rank:30},
    {name:"Samoa Joe",rank:31},{name:"Davey Richards",rank:32},{name:"Mr. Anderson",rank:33},
    {name:"Ted DiBiase Jr.",rank:34},{name:"Hirooki Goto",rank:35},{name:"D'Angelo Dinero",rank:36},
    {name:"Eddie Edwards",rank:37},{name:"Matt Morgan",rank:38},{name:"Hiroshi Tanahashi",rank:39},
    {name:"Yoshihiro Takayama",rank:40},{name:"Cody Rhodes",rank:41},{name:"Mistico",rank:42},
    {name:"James Storm",rank:43},{name:"Daniel Bryan",rank:44},{name:"Douglas Williams",rank:45},
    {name:"Roderick Strong",rank:46},{name:"Christopher Daniels",rank:47},{name:"El Mesias",rank:48},
    {name:"Eric Young",rank:49},{name:"Dolph Ziggler",rank:50},{name:"Robert Roode",rank:51},
    {name:"Naomichi Marufuji",rank:52},{name:"Kevin Nash",rank:53},{name:"Kevin Steen",rank:54},
    {name:"R-Truth",rank:55},{name:"Jeff Jarrett",rank:56},{name:"Electro Shock",rank:57},
    {name:"Tyson Kidd",rank:58},{name:"MVP",rank:59},{name:"Sting",rank:60},
    {name:"Adam Pearce",rank:61},{name:"Jay Briscoe",rank:62},{name:"Evan Bourne",rank:63},
    {name:"Minoru Suzuki",rank:64},{name:"Blue Demon Jr.",rank:65},{name:"Matt Hardy",rank:66},
    {name:"Go Shiozaki",rank:68},{name:"David Hart Smith",rank:69},{name:"Satoshi Kojima",rank:70},
    {name:"Hernandez",rank:71},{name:"Cibernetico",rank:72},{name:"Brother Devon",rank:73},
    {name:"Chris Hero",rank:74},{name:"Togi Makabe",rank:75},{name:"Shelton Benjamin",rank:76},
    {name:"Brother Ray",rank:77},{name:"Yoshi Tatsu",rank:78},{name:"Kane",rank:79},
    {name:"Claudio Castagnoli",rank:80},{name:"Volador Jr.",rank:81},{name:"Takeshi Rikio",rank:82},
    {name:"Dos Caras Jr.",rank:83},{name:"JTG",rank:84},{name:"Shad Gaspard",rank:85},
    {name:"Mark Briscoe",rank:86},{name:"The Amazing Red",rank:87},{name:"Alex Shelley",rank:88},
    {name:"Luke Gallows",rank:90},{name:"La Sombra",rank:91},{name:"Kazarian",rank:92},
    {name:"Ezekiel Jackson",rank:93},{name:"Carlito",rank:94},{name:"Chris Sabin",rank:95},
    {name:"Kenny King",rank:96},{name:"BxB Hulk",rank:98},{name:"Mark Henry",rank:99},
    {name:"Heath Slater",rank:100},{name:"Colt Cabana",rank:101},{name:"Homicide",rank:102},
    {name:"Jon Moxley",rank:103},{name:"Averno",rank:104},{name:"Yuji Nagata",rank:105},
    {name:"Delirious",rank:106},{name:"Magnus",rank:107},{name:"Jerry Lynn",rank:108},
    {name:"Wade Barrett",rank:109},{name:"Naruki Doi",rank:110},{name:"Mephisto",rank:111},
    {name:"Steve Corino",rank:112},{name:"Goldust",rank:113},{name:"Joe Hennig",rank:114},
    {name:"Masakatsu Funaki",rank:115},{name:"Max Buck",rank:116},{name:"Zack Ryder",rank:117},
    {name:"El Generico",rank:118},{name:"Jeremy Buck",rank:119},{name:"Keiji Muto",rank:120},
    {name:"Suwama",rank:121},{name:"Karl Anderson",rank:122},{name:"Rhett Titus",rank:123},
    {name:"Shannon Moore",rank:124},{name:"Primo Colon",rank:125},{name:"William Regal",rank:126},
    {name:"Yujiro",rank:127},{name:"Erick Stevens",rank:128},{name:"Brian Kendrick",rank:129},
    {name:"The Great Khali",rank:130},{name:"Tyson Dux",rank:131},{name:"KENTA",rank:132},
    {name:"Chessman",rank:133},{name:"Jay Lethal",rank:134},{name:"Finlay",rank:136},
    {name:"Toshiaki Kawada",rank:137},{name:"Negro Casas",rank:138},{name:"Rhino",rank:139},
    {name:"Kensuke Sasaki",rank:140},{name:"Justin Gabriel",rank:141},{name:"Kenny Omega",rank:142},
    {name:"Masato Tanaka",rank:143},{name:"Paul London",rank:144},{name:"Marco Corleone",rank:145},
    {name:"Tetsuya Naito",rank:146},{name:"La Parka",rank:148},{name:"Jimmy Jacobs",rank:150},
    {name:"Kaz Hayashi",rank:151},{name:"Trent Beretta",rank:154},{name:"Vladimir Kozlov",rank:155},
    {name:"Katsuhiko Nakajima",rank:156},{name:"Silver King",rank:157},{name:"CIMA",rank:158},
    {name:"Chuck Taylor",rank:161},{name:"Perro Aguayo Jr.",rank:162},{name:"Scott Steiner",rank:163},
    {name:"Brent Albright",rank:165},{name:"Tajiri",rank:167},{name:"Vance Archer",rank:168},
    {name:"Sean Waltman",rank:169},{name:"Joey Ryan",rank:171},{name:"Chris Masters",rank:172},
    {name:"Sami Callihan",rank:174},{name:"Chavo Guerrero",rank:177},{name:"Sonjay Dutt",rank:178},
    {name:"PAC",rank:183},{name:"Petey Williams",rank:186},{name:"Atlantis",rank:188},
    {name:"Necro Butcher",rank:190},{name:"Giant Bernard",rank:192},{name:"Tommy Dreamer",rank:193},
    {name:"Stevie Richards",rank:194},{name:"Darren Young",rank:197},{name:"Blue Panther",rank:199},
    {name:"Alex Riley",rank:201},{name:"Arik Cannon",rank:203},{name:"Takeshi Morishima",rank:206},
    {name:"Kaval",rank:209},{name:"Jack Evans",rank:210},{name:"Jon Davis",rank:211},
    {name:"Toru Yano",rank:212},{name:"Prince Devitt",rank:217},{name:"Skip Sheffield",rank:218},
    {name:"Tommaso Ciampa",rank:228},{name:"Kohei Sato",rank:229},{name:"Okada",rank:230},
    {name:"Brodie Lee",rank:235},{name:"Super Crazy",rank:236},{name:"Lince Dorado",rank:239},
    {name:"Mascara Dorada",rank:240},{name:"Dragon Kid",rank:242},{name:"Drake Younger",rank:245},
    {name:"Raven",rank:247},{name:"Kota Ibushi",rank:250},{name:"El Hijo del Santo",rank:251},
    {name:"Eddie Kingston",rank:252},{name:"Rocky Romero",rank:254},{name:"Curt Hawkins",rank:255},
    {name:"Jigsaw",rank:259},{name:"Rey Bucanero",rank:260},{name:"El Terrible",rank:269},
    {name:"Michael Elgin",rank:271},{name:"YAMATO",rank:273},{name:"Texano Jr.",rank:274},
    {name:"Hallowicked",rank:276},{name:"Vampiro",rank:277},{name:"Nick Gage",rank:284},
    {name:"Scorpio Sky",rank:316},{name:"Jushin Thunder Liger",rank:317},{name:"Silas Young",rank:335},
    {name:"T.J. Perkins",rank:336},{name:"Tim Donst",rank:340},{name:"Leo Kruger",rank:342},
    {name:"Santino Marella",rank:350},{name:"L.A. Park",rank:354},{name:"Gregory Helms",rank:355},
    {name:"Hunico",rank:358},{name:"Johnny Gargano",rank:363},{name:"Richie Steamboat",rank:364},
    {name:"Caprice Coleman",rank:365},{name:"Mason Ryan",rank:366},{name:"Josh Alexander",rank:370},
    {name:"Shane Haste",rank:374},{name:"Ultimo Dragon",rank:386},{name:"Aero Star",rank:397},
    {name:"Titan",rank:401},{name:"Big E. Langston",rank:402},{name:"Ricochet",rank:407},
    {name:"Adam Cole",rank:417},{name:"Aaron Stevens",rank:446},{name:"Wes Brisco",rank:452},
    {name:"Titus O'Neil",rank:453},{name:"Slim J",rank:435},{name:"Billy Gunn",rank:492},
    {name:"Crazzy Steve",rank:474},{name:"Barry Wolf",rank:500},
    // Women's rankings 2010
    {name:"Michelle McCool",rank:1},{name:"Angelina Love",rank:2},{name:"Mercedes Martinez",rank:3},
    {name:"Cheerleader Melissa",rank:4},{name:"Eve Torres",rank:5},{name:"Madison Rayne",rank:6},
    {name:"Beth Phoenix",rank:7},{name:"Mickie James",rank:8},{name:"MsChif",rank:9},
    {name:"Maryse",rank:10},{name:"Tara",rank:11},{name:"Sara Del Rey",rank:12},
    {name:"Gail Kim",rank:13},{name:"Awesome Kong",rank:14},{name:"Madison Eagles",rank:15},
    {name:"Sarita",rank:16},{name:"Alicia Fox",rank:17},{name:"Taylor Wilde",rank:18},
    {name:"Daffney",rank:19},{name:"Hamada",rank:20},{name:"Velvet Sky",rank:21},
    {name:"Nikki Roxx",rank:23},{name:"Portia Perez",rank:25},{name:"Kelly Kelly",rank:26},
    {name:"Natalya",rank:29},{name:"Serena Deeb",rank:30},{name:"Nicole Matthews",rank:31},
    {name:"LuFisto",rank:33},{name:"Daizee Haze",rank:34},{name:"Jazz",rank:40},
    {name:"Jessicka Havok",rank:46},{name:"Naomi Night",rank:48},{name:"Cherry Bomb",rank:44},
  ],
  2009: [
    {name:"Mickie James",rank:1},{name:"Angelina Love",rank:2},{name:"Melina",rank:3},
    {name:"MsChif",rank:4},{name:"Tara",rank:5},{name:"Awesome Kong",rank:6},
    {name:"Beth Phoenix",rank:7},{name:"Michelle McCool",rank:8},{name:"Maryse",rank:9},
    {name:"Taylor Wilde",rank:10},{name:"Sara Del Rey",rank:11},{name:"Cheerleader Melissa",rank:12},
    {name:"Gail Kim",rank:13},{name:"Mercedes Martinez",rank:14},{name:"O.D.B.",rank:15},
    {name:"Daizee Haze",rank:16},{name:"Sarita",rank:17},{name:"Daffney",rank:18},
    {name:"Madison Rayne",rank:19},{name:"Katie Lea Burchill",rank:20},
    {name:"Nikki Roxx",rank:21},{name:"Angel Orsini",rank:22},{name:"Velvet Sky",rank:23},
    {name:"Sojourner Bolt",rank:24},{name:"Natalya",rank:25},{name:"Rain",rank:26},
    {name:"Amber O'Neal",rank:27},{name:"Jillian Hall",rank:28},{name:"Jetta",rank:29},
    {name:"LuFisto",rank:30},{name:"Madison Eagles",rank:31},{name:"Nevaeh",rank:32},
    {name:"Wesna Busic",rank:33},{name:"Kelly Kelly",rank:34},{name:"Portia Perez",rank:35},
    {name:"Danyah",rank:36},{name:"Ariel",rank:37},{name:"Jennifer Blake",rank:38},
    {name:"Nicole Matthews",rank:39},{name:"Serena Deeb",rank:40},
    {name:"Allison Danger",rank:41},{name:"Malia Hosaka",rank:42},{name:"Lexie Fyfe",rank:43},
    {name:"Jaime D.",rank:44},{name:"Amy Lee",rank:45},{name:"Annie Social",rank:46},
    {name:"April Hunter",rank:47},{name:"Cherry Bomb",rank:48},{name:"Jessie McKay",rank:49},
    {name:"Rosa Mendes",rank:50},
    // Men's rankings
    {name:"Triple H",rank:1},{name:"Chris Jericho",rank:2},{name:"John Cena",rank:3},
    {name:"Edge",rank:4},{name:"Randy Orton",rank:5},{name:"Nigel McGuinness",rank:6},
    {name:"Hiroshi Tanahashi",rank:7},{name:"CM Punk",rank:8},{name:"Sting",rank:9},
    {name:"Ultimo Guerrero",rank:10},{name:"The Undertaker",rank:11},{name:"Kurt Angle",rank:12},
    {name:"Jeff Hardy",rank:13},{name:"Shawn Michaels",rank:14},{name:"Keiji Mutoh",rank:15},
    {name:"Batista",rank:16},{name:"Tyler Black",rank:17},{name:"Jack Swagger",rank:18},
    {name:"AJ Styles",rank:19},{name:"Matt Hardy",rank:20},{name:"Jeff Jarrett",rank:21},
    {name:"Blue Demon Jr.",rank:22},{name:"Austin Aries",rank:23},{name:"Shinsuke Nakamura",rank:24},
    {name:"The Big Show",rank:25},{name:"Rey Mysterio",rank:26},{name:"Bryan Danielson",rank:27},
    {name:"Christian",rank:28},{name:"Samoa Joe",rank:29},{name:"Suicide",rank:30},
    {name:"Shelton Benjamin",rank:31},{name:"Alex Shelley",rank:32},{name:"MVP",rank:33},
    {name:"Mick Foley",rank:34},{name:"Kofi Kingston",rank:35},{name:"Mistico",rank:36},
    {name:"Kane",rank:37},{name:"Booker T",rank:38},{name:"El Mesias",rank:39},
    {name:"Jerry Lynn",rank:40},{name:"William Regal",rank:41},{name:"Jun Akiyama",rank:42},
    {name:"Brother Ray",rank:43},{name:"Ted DiBiase Jr.",rank:44},{name:"Mark Henry",rank:45},
    {name:"John Morrison",rank:46},{name:"Finlay",rank:47},{name:"Cody Rhodes",rank:48},
    {name:"Brother Devon",rank:49},{name:"Jimmy Jacobs",rank:50},{name:"Adam Pearce",rank:51},
    {name:"Chris Sabin",rank:52},{name:"Vladimir Kozlov",rank:53},{name:"Kensuke Sasaki",rank:54},
    {name:"Robert Roode",rank:55},{name:"The Miz",rank:56},{name:"Dr. Wagner Jr.",rank:57},
    {name:"Christopher Daniels",rank:58},{name:"James Storm",rank:59},{name:"Yoshihiro Takayama",rank:60},
    {name:"Roderick Strong",rank:61},{name:"Brian Kendrick",rank:62},{name:"Evan Bourne",rank:63},
    {name:"Carlito",rank:64},{name:"Yuji Nagata",rank:65},{name:"Hernandez",rank:66},
    {name:"Claudio Castagnoli",rank:67},{name:"Rhino",rank:68},{name:"Manabu Nakanishi",rank:69},
    {name:"Chris Hero",rank:70},{name:"Scott Steiner",rank:71},{name:"Eric Young",rank:72},
    {name:"Tyson Kidd",rank:73},{name:"KENTA",rank:74},{name:"Chessman",rank:75},
    {name:"Primo Colon",rank:76},{name:"Davey Richards",rank:77},{name:"Homicide",rank:79},
    {name:"R-Truth",rank:80},{name:"Jay Briscoe",rank:81},{name:"Hirooki Goto",rank:82},
    {name:"Jay Lethal",rank:83},{name:"Steve Corino",rank:84},{name:"Matt Morgan",rank:86},
    {name:"Mike Knox",rank:87},{name:"Dos Caras Jr.",rank:88},{name:"Brent Albright",rank:89},
    {name:"JTG",rank:90},{name:"Naomichi Marufuji",rank:91},{name:"Eddie Edwards",rank:92},
    {name:"Sheamus",rank:94},{name:"Shad Gaspard",rank:95},{name:"Abyss",rank:96},
    {name:"Santino Marella",rank:97},{name:"Tyson Dux",rank:98},{name:"Blue Panther",rank:99},
    {name:"Takeshi Morishima",rank:100},{name:"Umaga",rank:101},{name:"Petey Williams",rank:102},
    {name:"Tiger Mask IV",rank:103},{name:"Tommy Dreamer",rank:104},{name:"Kevin Nash",rank:105},
    {name:"Rhett Titus",rank:106},{name:"Mark Briscoe",rank:107},{name:"Negro Casas",rank:108},
    {name:"La Parka",rank:109},{name:"Averno",rank:110},{name:"Minoru Suzuki",rank:111},
    {name:"Kevin Steen",rank:112},{name:"Dolph Ziggler",rank:113},{name:"CIMA",rank:114},
    {name:"Chavo Guerrero",rank:116},{name:"Necro Butcher",rank:117},{name:"Go Shiozaki",rank:120},
    {name:"Charlie Haas",rank:122},{name:"Marco Corleone",rank:124},{name:"Drew McIntyre",rank:125},
    {name:"Jamie Noble",rank:126},{name:"Naruki Doi",rank:128},{name:"D.H. Smith",rank:130},
    {name:"Delirious",rank:131},{name:"Suwama",rank:132},{name:"Joe Doering",rank:133},
    {name:"Doug Williams",rank:134},{name:"Perro Aguayo Jr.",rank:136},{name:"PAC",rank:137},
    {name:"Hiroyoshi Tenzan",rank:139},{name:"Rocky Romero",rank:141},{name:"Ezekiel Jackson",rank:142},
    {name:"Shingo Takagi",rank:146},{name:"Hector Garza",rank:148},{name:"Sonjay Dutt",rank:149},
    {name:"The Amazing Red",rank:153},{name:"Giant Bernard",rank:154},{name:"Volador Jr.",rank:160},
    {name:"Tetsuya Naito",rank:161},{name:"El Generico",rank:163},{name:"Jack Evans",rank:167},
    {name:"Kenta Kobashi",rank:171},{name:"Juventud Guerrera",rank:172},{name:"Brutus Magnus",rank:173},
    {name:"Joey Ryan",rank:175},{name:"Matt Cross",rank:177},{name:"Drake Younger",rank:178},
    {name:"Goldust",rank:180},{name:"Atlantis",rank:183},{name:"Chuck Taylor",rank:186},
    {name:"Shannon Moore",rank:188},{name:"Curt Hawkins",rank:190},{name:"La Sombra",rank:191},
    {name:"Hurricane Helms",rank:193},{name:"Sami Callihan",rank:194},{name:"Lance Archer",rank:195},
    {name:"Teddy Hart",rank:197},{name:"Zack Ryder",rank:199},{name:"Shawn Spears",rank:200},
    {name:"D-Lo Brown",rank:201},{name:"Kenny King",rank:202},{name:"Vampiro",rank:213},
    {name:"Karl Anderson",rank:214},{name:"Nick Gage",rank:217},{name:"Brodie Lee",rank:218},
    {name:"Yoshi Tatsu",rank:219},{name:"Super Crazy",rank:220},{name:"Joe Hennig",rank:221},
    {name:"Matt Jackson",rank:229},{name:"Nick Jackson",rank:235},{name:"Daisuke Sekimoto",rank:234},
    {name:"Stevie Richards",rank:237},{name:"Colt Cabana",rank:238},{name:"Kid Kash",rank:240},
    {name:"Mike Quackenbush",rank:247},{name:"Lince Dorado",rank:249},{name:"Eddie Kingston",rank:257},
    {name:"Hallowicked",rank:265},{name:"Texano Jr.",rank:268},{name:"Bobby Fish",rank:280},
    {name:"Michael Elgin",rank:346},{name:"Ethan Page",rank:350},{name:"BxB Hulk",rank:341},
    {name:"Kenny Omega",rank:318},{name:"Jushin Liger",rank:315},{name:"Arik Cannon",rank:331},
    {name:"T.J. Perkins",rank:356},{name:"Madman Pondo",rank:364},{name:"Val Venis",rank:365},
    {name:"La Mascara",rank:362},{name:"Jim Duggan",rank:388},{name:"Sabu",rank:396},
    {name:"Jerry Lawler",rank:399},{name:"Colin Delaney",rank:410},{name:"Trent Beretta",rank:451},
    {name:"Silas Young",rank:427},{name:"Jon Davis",rank:432},{name:"Jon Moxley",rank:471},
    {name:"Crazzy Steve",rank:496},
  ],
  1997: [
    {name:"Dean Malenko",rank:1},{name:"Mitsuharu Misawa",rank:2},{name:"Steve Austin",rank:3},
    {name:"Diamond Dallas Page",rank:4},{name:"Lex Luger",rank:5},{name:"The Undertaker",rank:6},
    {name:"Shinya Hashimoto",rank:7},{name:"The Giant",rank:8},{name:"Jushin Liger",rank:9},
    {name:"Chris Benoit",rank:10},{name:"Taz",rank:11},{name:"Ultimo Dragon",rank:12},
    {name:"Kevin Nash",rank:13},{name:"Toshiaki Kawada",rank:14},{name:"Kenta Kobashi",rank:15},
    {name:"Owen Hart",rank:16},{name:"Jeff Jarrett",rank:17},{name:"Shawn Michaels",rank:18},
    {name:"Randy Savage",rank:19},{name:"Bret Hart",rank:20},{name:"Syxx",rank:21},
    {name:"Davey Boy Smith",rank:22},{name:"Eddy Guerrero",rank:24},{name:"Scott Hall",rank:25},
    {name:"Chris Jericho",rank:26},{name:"Rick Steiner",rank:27},{name:"Rey Misterio Jr.",rank:29},
    {name:"Scott Steiner",rank:30},{name:"Hunter Hearst Helmsley",rank:31},{name:"Rob Van Dam",rank:32},
    {name:"Sabu",rank:34},{name:"Ric Flair",rank:35},{name:"Kensuke Sasaki",rank:36},
    {name:"Keiji Mutoh",rank:37},{name:"Ken Shamrock",rank:38},{name:"Raven",rank:39},
    {name:"Juventud Guerrera",rank:40},{name:"Goldust",rank:41},{name:"Shane Douglas",rank:42},
    {name:"Faarooq",rank:45},{name:"Big Van Vader",rank:46},{name:"Negro Casas",rank:47},
    {name:"Tommy Dreamer",rank:48},{name:"Jerry Lawler",rank:49},{name:"Sid Vicious",rank:50},
    {name:"Mankind",rank:51},{name:"Psicosis",rank:52},{name:"Hulk Hogan",rank:55},
    {name:"Terry Funk",rank:60},{name:"Booker T",rank:84},{name:"Konnan",rank:100},
    {name:"New Jack",rank:101},{name:"Rocky Maivia",rank:103},{name:"Headbanger Mosh",rank:104},
    {name:"Satoshi Kojima",rank:111},{name:"Road Warrior Hawk",rank:112},
    {name:"Disco Inferno",rank:113},{name:"Bam Bam Bigelow",rank:126},{name:"Alex Wright",rank:127},
    {name:"Lance Storm",rank:132},{name:"Bob Holly",rank:134},{name:"Road Warrior Animal",rank:135},
    {name:"Chavo Guerrero Jr.",rank:139},{name:"Leif Cassidy",rank:140},
    {name:"D-Lo Brown",rank:144},{name:"Glacier",rank:146},{name:"Jesse James",rank:153},
    {name:"Hugh Morrus",rank:155},{name:"Kama Mustafa",rank:156},{name:"Johnny Grunge",rank:157},
    {name:"Jim Neidhart",rank:159},{name:"Yuji Nagata",rank:164},{name:"Dick Togo",rank:172},
    {name:"Blackjack Bradshaw",rank:173},{name:"Mortis",rank:174},{name:"Jake Roberts",rank:178},
    {name:"Masato Tanaka",rank:194},{name:"Hayabusa",rank:196},{name:"Antonio Inoki",rank:197},
    {name:"Mikey Whipwreck",rank:201},{name:"Billy Kidman",rank:202},{name:"Balls Mahoney",rank:213},
    {name:"Yoshihiro Tajiri",rank:280},{name:"Tiger Mask IV",rank:274},
    {name:"Spike Dudley",rank:277},{name:"Nigel McGuinness",rank:291},
    {name:"Chris Hero",rank:359},{name:"Steve Corino",rank:348},{name:"Mike Quackenbush",rank:350},
    {name:"Christian Cage",rank:268},{name:"Joey Matthews",rank:425},
    {name:"Christian York",rank:439},{name:"CW Anderson",rank:401},
    {name:"Rick Martel",rank:363},{name:"Jim Duggan",rank:316},{name:"Ernest Miller",rank:373},
    {name:"Greg Valentine",rank:256},{name:"Typhoon",rank:252},
    {name:"Perro Aguayo Jr.",rank:250},{name:"Gran Hamada",rank:205},
    {name:"Little Guido",rank:232},{name:"The Blue Meanie",rank:234},
    {name:"Tito Santana",rank:200},{name:"Gran Naniwa",rank:276},
  ],
  1998: [
    {name:"Steve Austin",rank:1},{name:"Goldberg",rank:2},{name:"Mitsuharu Misawa",rank:3},
    {name:"Diamond Dallas Page",rank:4},{name:"The Undertaker",rank:5},{name:"Kenta Kobashi",rank:6},
    {name:"Booker T",rank:7},{name:"Ken Shamrock",rank:8},{name:"Jushin Liger",rank:9},
    {name:"Chris Jericho",rank:10},{name:"Rocky Maivia",rank:11},{name:"Sting",rank:12},
    {name:"Rob Van Dam",rank:14},{name:"Owen Hart",rank:15},{name:"Randy Savage",rank:16},
    {name:"El Hijo del Santo",rank:18},{name:"Chris Benoit",rank:19},{name:"Ultimo Dragon",rank:20},
    {name:"Kane",rank:21},{name:"Hunter Hearst Helmsley",rank:24},{name:"Juventud Guerrera",rank:25},
    {name:"Mick Foley",rank:26},{name:"Eddy Guerrero",rank:28},{name:"Bret Hart",rank:40},
    {name:"Dean Malenko",rank:35},{name:"Taz",rank:36},{name:"Kevin Nash",rank:39},
    {name:"Jeff Jarrett",rank:43},{name:"Chris Candido",rank:45},{name:"Hollywood Hogan",rank:53},
    {name:"Ric Flair",rank:55},{name:"Scott Hall",rank:57},{name:"Keiji Mutoh",rank:58},
    {name:"Perry Saturn",rank:59},{name:"Terry Funk",rank:60},{name:"Raven",rank:61},
    {name:"Billy Gunn",rank:62},{name:"Chavo Guerrero Jr.",rank:64},{name:"Vader",rank:65},
    {name:"Rick Steiner",rank:66},{name:"Edge",rank:67},{name:"Al Snow",rank:70},
    {name:"Goldust",rank:72},{name:"Jesse James",rank:73},{name:"Buh Buh Ray Dudley",rank:74},
    {name:"Lance Storm",rank:78},{name:"Christian Cage",rank:80},{name:"Yuji Nagata",rank:83},
    {name:"Justin Credible",rank:85},{name:"X-Pac",rank:133},{name:"Super Crazy",rank:157},
    {name:"D-Lo Brown",rank:120},{name:"Spike Dudley",rank:121},
    {name:"Yoshihiro Tajiri",rank:155},{name:"Tiger Mask IV",rank:140},
    {name:"Davey Boy Smith",rank:141},{name:"New Jack",rank:154},
    {name:"Bob Holly",rank:164},{name:"Mark Henry",rank:191},{name:"Jeff Hardy",rank:239},
    {name:"Balls Mahoney",rank:162},{name:"Mike Quackenbush",rank:250},
    {name:"Matt Hardy",rank:208},{name:"Perro Aguayo Jr.",rank:249},
    {name:"Masato Tanaka",rank:95},{name:"Val Venis",rank:105},
    {name:"D-Von Dudley",rank:111},{name:"Jerry Lynn",rank:114},
    {name:"Fit Finlay",rank:42},{name:"The Sandman",rank:96},
    {name:"Shane Douglas",rank:30},{name:"The Giant",rank:31},
    {name:"Atlantis",rank:93},{name:"Samoa Joe",rank:155},
  ],
  1999: [
    {name:"Steve Austin",rank:1},{name:"Rob Van Dam",rank:2},{name:"Mitsuharu Misawa",rank:3},
    {name:"Rey Misterio Jr.",rank:4},{name:"The Rock",rank:5},{name:"Diamond Dallas Page",rank:6},
    {name:"Keiji Mutoh",rank:7},{name:"The Undertaker",rank:8},{name:"Goldberg",rank:9},
    {name:"Taz",rank:10},{name:"Sting",rank:12},{name:"Kane",rank:13},
    {name:"Kevin Nash",rank:14},{name:"Jushin Liger",rank:15},{name:"Dr. Wagner Jr.",rank:16},
    {name:"Scott Steiner",rank:17},{name:"Mankind",rank:19},{name:"Chris Benoit",rank:20},
    {name:"Dean Malenko",rank:21},{name:"El Hijo del Santo",rank:22},{name:"Ken Shamrock",rank:23},
    {name:"Kenta Kobashi",rank:24},{name:"Val Venis",rank:25},{name:"Hunter Hearst Helmsley",rank:26},
    {name:"Bam Bam Bigelow",rank:27},{name:"Chris Jericho",rank:29},{name:"X-Pac",rank:30},
    {name:"Billy Kidman",rank:31},{name:"Sabu",rank:32},{name:"Paul Wight",rank:34},
    {name:"Jeff Jarrett",rank:36},{name:"Super Crazy",rank:37},{name:"Billy Gunn",rank:39},
    {name:"Psicosis",rank:40},{name:"Ric Flair",rank:42},{name:"Hulk Hogan",rank:44},
    {name:"Road Dogg",rank:46},{name:"Perry Saturn",rank:47},{name:"Jerry Lynn",rank:49},
    {name:"Yoshihiro Tajiri",rank:51},{name:"Al Snow",rank:52},{name:"Rick Steiner",rank:53},
    {name:"Booker T",rank:60},{name:"Juventud Guerrera",rank:62},{name:"Bret Hart",rank:56},
    {name:"Jeff Hardy",rank:76},{name:"Edge",rank:83},{name:"Spike Dudley",rank:84},
    {name:"Christian",rank:90},{name:"Matt Hardy",rank:100},{name:"Shane Helms",rank:234},
    {name:"Christopher Daniels",rank:114},{name:"Masato Tanaka",rank:86},
    {name:"D-Lo Brown",rank:65},{name:"X-Pac",rank:30},{name:"Mark Henry",rank:116},
    {name:"Tommy Dreamer",rank:162},{name:"Lance Storm",rank:69},
    {name:"Goldust",rank:70},{name:"Curt Hennig",rank:71},{name:"Raven",rank:75},
    {name:"D-Von Dudley",rank:79},{name:"Justin Credible",rank:81},
    {name:"Atlantis",rank:82},{name:"Chavo Guerrero Jr.",rank:105},
    {name:"New Jack",rank:157},{name:"Steve Corino",rank:203},
    {name:"Adam Pearce",rank:247},{name:"Shane McMahon",rank:245},
    {name:"Shannon Moore",rank:238},{name:"Balls Mahoney",rank:121},
    {name:"Tiger Mask IV",rank:135},{name:"Perro Aguayo Jr.",rank:249},
    {name:"Mike Quackenbush",rank:128},{name:"AJ Styles",rank:199},
  ],
  2000: [
    {name:"Triple H",rank:1},{name:"The Rock",rank:2},{name:"Chris Benoit",rank:3},
    {name:"Kenta Kobashi",rank:4},{name:"Jeff Jarrett",rank:5},{name:"Justin Credible",rank:6},
    {name:"Mike Awesome",rank:7},{name:"Jushin Liger",rank:8},{name:"Chris Jericho",rank:9},
    {name:"Kensuke Sasaki",rank:10},{name:"Vader",rank:11},{name:"Scott Steiner",rank:12},
    {name:"Kurt Angle",rank:13},{name:"Mitsuharu Misawa",rank:14},{name:"El Hijo del Santo",rank:15},
    {name:"The Big Show",rank:16},{name:"Diamond Dallas Page",rank:17},{name:"Sid Vicious",rank:18},
    {name:"Rhyno",rank:19},{name:"Eddie Guerrero",rank:20},{name:"Masato Tanaka",rank:21},
    {name:"Keiji Mutoh",rank:22},{name:"Yoshihiro Tajiri",rank:23},{name:"Rob Van Dam",rank:24},
    {name:"Dr. Wagner Jr.",rank:25},{name:"Sting",rank:26},{name:"Rikishi",rank:27},
    {name:"Tommy Dreamer",rank:28},{name:"Jeff Hardy",rank:30},{name:"Vampiro",rank:31},
    {name:"Scotty 2 Hotty",rank:33},{name:"Kane",rank:34},{name:"Crash Holly",rank:36},
    {name:"Sabu",rank:38},{name:"Super Crazy",rank:39},{name:"Lance Storm",rank:40},
    {name:"Bob Holly",rank:41},{name:"Ric Flair",rank:43},{name:"Matt Hardy",rank:45},
    {name:"Kevin Nash",rank:50},{name:"Edge",rank:51},{name:"Buh Buh Ray Dudley",rank:53},
    {name:"Jerry Lynn",rank:54},{name:"Tazz",rank:55},{name:"Christian",rank:57},
    {name:"Hulk Hogan",rank:59},{name:"D-Von Dudley",rank:60},{name:"Booker T",rank:61},
    {name:"Raven",rank:62},{name:"Perry Saturn",rank:63},{name:"X-Pac",rank:65},
    {name:"Billy Kidman",rank:72},{name:"Val Venis",rank:74},{name:"Christopher Daniels",rank:76},
    {name:"Road Dogg",rank:78},{name:"Grandmaster Sexay",rank:79},{name:"La Parka",rank:131},
    {name:"D-Lo Brown",rank:105},{name:"Al Snow",rank:97},{name:"Shane Helms",rank:144},
    {name:"Chris Candido",rank:129},{name:"The Sandman",rank:86},
    {name:"Shane Douglas",rank:58},{name:"Shannon Moore",rank:140},
    {name:"Low Ki",rank:170},{name:"Steve Corino",rank:155},{name:"Balls Mahoney",rank:99},
    {name:"Mike Quackenbush",rank:160},{name:"Adam Pearce",rank:204},
    {name:"Mark Henry",rank:205},{name:"Kid Kash",rank:68},{name:"Tiger Mask IV",rank:67},
    {name:"Atlantis",rank:49},{name:"New Jack",rank:113},{name:"Test",rank:103},
    {name:"Juventud Guerrera",rank:149},{name:"Albert",rank:112},
    {name:"Nick Dinsmore",rank:218},{name:"Chyna",rank:106},
  ],
  2001: [
    {name:"Kurt Angle",rank:1},{name:"Steve Austin",rank:2},{name:"Chris Benoit",rank:3},
    {name:"Keiji Mutoh",rank:4},{name:"Booker T",rank:5},{name:"Triple H",rank:6},
    {name:"Scott Steiner",rank:7},{name:"Mitsuharu Misawa",rank:8},{name:"Chris Jericho",rank:9},
    {name:"Rhyno",rank:10},{name:"The Undertaker",rank:11},{name:"Genichiro Tenryu",rank:12},
    {name:"Lance Storm",rank:13},{name:"The Rock",rank:14},{name:"El Hijo del Santo",rank:15},
    {name:"Kane",rank:16},{name:"Jeff Hardy",rank:17},{name:"Diamond Dallas Page",rank:19},
    {name:"Edge",rank:20},{name:"Dr. Wagner Jr.",rank:21},{name:"Matt Hardy",rank:22},
    {name:"Jeff Jarrett",rank:24},{name:"Jushin Liger",rank:25},{name:"Hector Garza",rank:26},
    {name:"Yoshihiro Tajiri",rank:27},{name:"Mike Awesome",rank:28},{name:"Christian",rank:29},
    {name:"Buh Buh Ray Dudley",rank:30},{name:"Hurricane Helms",rank:31},{name:"Albert",rank:32},
    {name:"Steve Corino",rank:35},{name:"D-Von Dudley",rank:36},{name:"Test",rank:37},
    {name:"Billy Kidman",rank:38},{name:"Jun Akiyama",rank:39},{name:"Hugh Morrus",rank:40},
    {name:"Chavo Guerrero",rank:42},{name:"Sean O'Haire",rank:43},
    {name:"Bradshaw",rank:45},{name:"Silver King",rank:46},{name:"Vader",rank:48},
    {name:"Jerry Lynn",rank:49},{name:"Eddie Guerrero",rank:50},{name:"Hardcore Holly",rank:51},
    {name:"Raven",rank:53},{name:"Juventud Guerrera",rank:54},{name:"Sabu",rank:57},
    {name:"Masato Tanaka",rank:58},{name:"Rob Van Dam",rank:59},{name:"Chuck Palumbo",rank:60},
    {name:"William Regal",rank:61},{name:"Spike Dudley",rank:62},{name:"X-Pac",rank:67},
    {name:"Steve Blackman",rank:70},{name:"The Big Show",rank:72},{name:"Crash Holly",rank:74},
    {name:"Tommy Dreamer",rank:78},{name:"Justin Credible",rank:79},
    {name:"Brock Lesnar",rank:87},{name:"Scotty 2 Hotty",rank:88},{name:"Atlantis",rank:89},
    {name:"Shannon Moore",rank:92},{name:"Super Crazy",rank:94},{name:"Rikishi",rank:97},
    {name:"Scott Hall",rank:98},{name:"Al Snow",rank:99},{name:"Dean Malenko",rank:111},
    {name:"C.W. Anderson",rank:112},{name:"Kid Kash",rank:114},{name:"Low Ki",rank:170},
    {name:"Mark Henry",rank:167},{name:"D-Lo Brown",rank:145},{name:"Billy Gunn",rank:125},
    {name:"Val Venis",rank:127},{name:"New Jack",rank:173},{name:"Shane Helms",rank:144},
    {name:"Rey Misterio Jr.",rank:198},{name:"AJ Styles",rank:199},
    {name:"American Dragon",rank:206},{name:"Spanky",rank:208},
    {name:"Naomichi Marufuji",rank:209},{name:"Randy Orton",rank:217},
    {name:"Tiger Mask IV",rank:76},{name:"La Parka",rank:104},
    {name:"Mike Quackenbush",rank:132},{name:"Nova",rank:147},
    {name:"Tommy Dreamer",rank:78},{name:"Balls Mahoney",rank:156},
    {name:"Little Guido",rank:141},{name:"Nick Dinsmore",rank:182},
    {name:"Jamie Noble",rank:212},{name:"Tazz",rank:140},
    {name:"Shelton Benjamin",rank:153},{name:"Charlie Haas",rank:121},
  ],
  2002: [
    {name:"Rob Van Dam",rank:1},{name:"The Undertaker",rank:2},{name:"Keiji Mutoh",rank:3},
    {name:"Chris Jericho",rank:4},{name:"Eddie Guerrero",rank:5},{name:"Kurt Angle",rank:6},
    {name:"Edge",rank:7},{name:"Yuji Nagata",rank:8},{name:"The Rock",rank:9},
    {name:"Triple H",rank:10},{name:"Steve Austin",rank:13},{name:"Booker T",rank:14},
    {name:"Brock Lesnar",rank:17},{name:"Hulk Hogan",rank:19},{name:"William Regal",rank:20},
    {name:"El Hijo del Santo",rank:21},{name:"Yoshihiro Tajiri",rank:23},
    {name:"Jeff Jarrett",rank:24},{name:"Matt Hardy",rank:25},{name:"Hurricane Helms",rank:26},
    {name:"Yoshihiro Takayama",rank:27},{name:"Deacon Batista",rank:28},
    {name:"Bubba Ray Dudley",rank:30},{name:"Satoshi Kojima",rank:31},
    {name:"Jeff Hardy",rank:32},{name:"Randy Orton",rank:33},{name:"Ric Flair",rank:34},
    {name:"Dr. Wagner Jr.",rank:35},{name:"Jamie Noble",rank:42},{name:"John Cena",rank:46},
    {name:"Christian",rank:47},{name:"Jun Akiyama",rank:48},{name:"The Big Show",rank:49},
    {name:"Kane",rank:55},{name:"Lance Storm",rank:56},{name:"Christopher Daniels",rank:57},
    {name:"Rey Mysterio",rank:58},{name:"Scott Hall",rank:59},{name:"Goldust",rank:64},
    {name:"Ken Shamrock",rank:65},{name:"AJ Styles",rank:70},{name:"Low Ki",rank:76},
    {name:"Atlantis",rank:77},{name:"Tommy Dreamer",rank:78},{name:"Tiger Mask IV",rank:79},
    {name:"Kensuke Sasaki",rank:81},{name:"American Dragon",rank:89},
    {name:"Hiroyoshi Tenzan",rank:90},{name:"Masato Tanaka",rank:91},
    {name:"Doug Williams",rank:92},{name:"Steve Corino",rank:104},
    {name:"Chavo Guerrero",rank:115},{name:"Lance Cade",rank:120},
    {name:"Mark Henry",rank:122},{name:"Albert",rank:125},{name:"Shelton Benjamin",rank:132},
    {name:"Sabu",rank:133},{name:"Ron Killings",rank:194},{name:"Bobby Roode",rank:199},
    {name:"Frankie Kazarian",rank:210},{name:"The Amazing Red",rank:217},
    {name:"Samoa Joe",rank:230},{name:"Masaaki Mochizuki",rank:231},
    {name:"CM Punk",rank:305},{name:"Nick Gage",rank:313},{name:"Nigel McGuinness",rank:291},
    {name:"Colt Cabana",rank:292},{name:"Balls Mahoney",rank:294},{name:"Homicide",rank:361},
    {name:"Chris Hero",rank:359},{name:"Chris Sabin",rank:435},
    {name:"Jimmy Jacobs",rank:479},{name:"Tyson Dux",rank:484},{name:"Mike Knox",rank:487},
    {name:"Aaron Stevens",rank:423},{name:"New Jack",rank:226},
  ],
  2003: [
    {name:"Brock Lesnar",rank:1},{name:"Triple H",rank:2},{name:"Kurt Angle",rank:3},
    {name:"Keiji Mutoh",rank:4},{name:"Chris Jericho",rank:5},{name:"The Big Show",rank:6},
    {name:"Booker T",rank:7},{name:"Kenta Kobashi",rank:8},{name:"Eddie Guerrero",rank:9},
    {name:"Rob Van Dam",rank:10},{name:"AJ Styles",rank:11},{name:"John Cena",rank:12},
    {name:"Chris Benoit",rank:13},{name:"El Hijo del Santo",rank:14},{name:"Jeff Jarrett",rank:15},
    {name:"Matt Hardy",rank:17},{name:"The Undertaker",rank:18},{name:"Rey Mysterio",rank:19},
    {name:"Christopher Daniels",rank:20},{name:"Kane",rank:23},{name:"Charlie Haas",rank:25},
    {name:"Low Ki",rank:26},{name:"Christian",rank:28},{name:"Jerry Lynn",rank:29},
    {name:"Shelton Benjamin",rank:30},{name:"Shawn Michaels",rank:32},
    {name:"Chavo Guerrero",rank:33},{name:"Edge",rank:34},{name:"Goldust",rank:35},
    {name:"Lance Storm",rank:37},{name:"Goldberg",rank:39},{name:"Scott Steiner",rank:40},
    {name:"The Amazing Red",rank:42},{name:"Paul London",rank:45},
    {name:"Último Dragon",rank:47},{name:"Ron Killings",rank:48},{name:"Jamie Noble",rank:50},
    {name:"Ric Flair",rank:53},{name:"Dr. Wagner Jr.",rank:55},
    {name:"Bubba Ray Dudley",rank:56},{name:"Hiroyoshi Tenzan",rank:57},
    {name:"Randy Orton",rank:63},{name:"Jeff Hardy",rank:64},{name:"William Regal",rank:67},
    {name:"D-Von Dudley",rank:69},{name:"Kid Kash",rank:71},
    {name:"James Storm",rank:77},{name:"Billy Kidman",rank:78},
    {name:"Tommy Dreamer",rank:86},{name:"Steve Corino",rank:87},
    {name:"Tiger Mask IV",rank:89},{name:"Juventud Guerrera",rank:90},
    {name:"Shannon Moore",rank:91},{name:"Chris Sabin",rank:146},
    {name:"Masato Tanaka",rank:147},{name:"Samoa Joe",rank:155},
    {name:"CM Punk",rank:171},{name:"Matt Morgan",rank:169},
    {name:"CIMA",rank:110},{name:"Doug Williams",rank:113},{name:"Bobby Roode",rank:198},
    {name:"Homicide",rank:235},{name:"Colt Cabana",rank:242},
    {name:"Nigel McGuinness",rank:299},{name:"Chris Hero",rank:358},
    {name:"Jimmy Jacobs",rank:483},{name:"Roderick Strong",rank:416},
    {name:"Austin Aries",rank:225},{name:"Kenny King",rank:439},
    {name:"Mike Knox",rank:476},{name:"Aaron Stevens",rank:241},
    {name:"Balls Mahoney",rank:275},{name:"New Jack",rank:227},
    {name:"Super Crazy",rank:278},{name:"Tyson Dux",rank:397},
  ],
  2004: [
    {name:"Chris Benoit",rank:1},{name:"Eddie Guerrero",rank:2},{name:"Triple H",rank:3},
    {name:"Kenta Kobashi",rank:4},{name:"Randy Orton",rank:5},{name:"John Cena",rank:7},
    {name:"AJ Styles",rank:8},{name:"Shawn Michaels",rank:9},{name:"Chris Jericho",rank:10},
    {name:"Jeff Jarrett",rank:12},{name:"Kane",rank:13},{name:"Batista",rank:20},
    {name:"Rey Mysterio",rank:22},{name:"The Undertaker",rank:23},{name:"Booker T",rank:24},
    {name:"Christopher Daniels",rank:25},{name:"Rob Van Dam",rank:28},
    {name:"Ric Flair",rank:30},{name:"Christian",rank:31},{name:"Chris Sabin",rank:32},
    {name:"Samoa Joe",rank:34},{name:"Kurt Angle",rank:36},
    {name:"Bubba Ray Dudley",rank:37},{name:"Matt Hardy",rank:39},
    {name:"Charlie Haas",rank:40},{name:"The Big Show",rank:41},{name:"Tajiri",rank:42},
    {name:"D-Von Dudley",rank:43},{name:"Chris Harris",rank:44},
    {name:"Paul London",rank:82},{name:"American Dragon",rank:77},
    {name:"CM Punk",rank:89},{name:"Edge",rank:59},
    {name:"Abyss",rank:56},{name:"Rhyno",rank:57},{name:"Hurricane Helms",rank:58},
    {name:"James Storm",rank:64},{name:"Naomichi Marufuji",rank:55},
    {name:"Randy Orton",rank:5},{name:"Billy Kidman",rank:92},
    {name:"Frankie Kazarian",rank:50},{name:"Jamie Noble",rank:75},
    {name:"Low Ki",rank:116},{name:"Homicide",rank:192},{name:"Rocky Romero",rank:189},
    {name:"Nigel McGuinness",rank:219},{name:"Austin Aries",rank:225},
    {name:"Shelton Benjamin",rank:16},{name:"Chavo Guerrero",rank:17},
    {name:"John Bradshaw Layfield",rank:15},{name:"Tommy Dreamer",rank:78},
    {name:"Steve Corino",rank:69},{name:"Tiger Mask IV",rank:84},
    {name:"Mark Henry",rank:122},{name:"Jack Evans",rank:214},
    {name:"Colt Cabana",rank:155},{name:"Juventud Guerrera",rank:52},
    {name:"Bobby Roode",rank:163},{name:"Eric Young",rank:181},
    {name:"Petey Williams",rank:178},{name:"Aaron Stevens",rank:168},
    {name:"Super Crazy",rank:278},{name:"B.J. Whitmer",rank:198},
    {name:"Roderick Strong",rank:416},{name:"Chris Masters",rank:185},
    {name:"Ultimo Dragon",rank:134},{name:"CIMA",rank:135},
  ],
  2005: [
    {name:"Batista",rank:1},{name:"John Cena",rank:2},{name:"Satoshi Kojima",rank:3},
    {name:"Triple H",rank:4},{name:"John Bradshaw Layfield",rank:5},{name:"Kurt Angle",rank:6},
    {name:"AJ Styles",rank:7},{name:"Edge",rank:8},{name:"Shelton Benjamin",rank:9},
    {name:"Jeff Jarrett",rank:11},{name:"Chris Benoit",rank:13},{name:"Rey Mysterio",rank:14},
    {name:"Eddie Guerrero",rank:15},{name:"Kenta Kobashi",rank:16},
    {name:"Christopher Daniels",rank:17},{name:"Samoa Joe",rank:22},
    {name:"Petey Williams",rank:23},{name:"El Hijo del Santo",rank:24},
    {name:"Chris Jericho",rank:25},{name:"The Undertaker",rank:26},
    {name:"CM Punk",rank:40},{name:"Carlito",rank:41},
    {name:"Randy Orton",rank:29},{name:"Christian",rank:30},{name:"The Big Show",rank:31},
    {name:"Naomichi Marufuji",rank:32},{name:"Shawn Michaels",rank:34},
    {name:"Paul London",rank:36},{name:"Abyss",rank:37},{name:"Bobby Roode",rank:55},
    {name:"Jeff Hardy",rank:58},{name:"Eric Young",rank:60},{name:"Austin Aries",rank:62},
    {name:"Chris Harris",rank:67},{name:"Charlie Haas",rank:68},{name:"Chris Sabin",rank:69},
    {name:"American Dragon",rank:76},{name:"Johnny Nitro",rank:80},
    {name:"Frankie Kazarian",rank:79},{name:"Hardcore Holly",rank:78},
    {name:"Nigel McGuinness",rank:124},{name:"Homicide",rank:158},
    {name:"Rocky Romero",rank:146},{name:"Low Ki",rank:173},
    {name:"Giant Bernard",rank:175},{name:"Roderick Strong",rank:416},
    {name:"Alex Shelley",rank:103},{name:"Colt Cabana",rank:95},
    {name:"Jimmy Jacobs",rank:176},{name:"Blaster Lashley",rank:155},
    {name:"Rhino",rank:157},{name:"Chris Masters",rank:116},
    {name:"Jack Evans",rank:193},{name:"CIMA",rank:191},
    {name:"KENTA",rank:65},{name:"Chavo Guerrero",rank:48},{name:"Ric Flair",rank:51},
    {name:"Kane",rank:19},{name:"Booker T",rank:20},{name:"Mark Henry",rank:130},
    {name:"Atlantis",rank:130},{name:"Juventud Guerrera",rank:126},
  ],
  2006: [
    {name:"John Cena",rank:1},{name:"Kurt Angle",rank:2},{name:"Edge",rank:3},
    {name:"Samoa Joe",rank:4},{name:"Rey Mysterio",rank:6},{name:"Brock Lesnar",rank:7},
    {name:"Kenta Kobashi",rank:8},{name:"Shawn Michaels",rank:9},{name:"Jeff Jarrett",rank:10},
    {name:"Christian Cage",rank:12},{name:"AJ Styles",rank:13},
    {name:"Christopher Daniels",rank:15},{name:"Bryan Danielson",rank:16},
    {name:"Rob Van Dam",rank:18},{name:"King Booker",rank:19},
    {name:"Triple H",rank:21},{name:"Batista",rank:23},{name:"Ric Flair",rank:24},
    {name:"Sting",rank:26},{name:"Carlito",rank:27},{name:"Dr. Wagner Jr.",rank:28},
    {name:"Chris Benoit",rank:29},{name:"Randy Orton",rank:30},
    {name:"CM Punk",rank:35},{name:"Shelton Benjamin",rank:37},{name:"Abyss",rank:38},
    {name:"Mark Henry",rank:41},{name:"Rhino",rank:42},{name:"Hiroshi Tanahashi",rank:43},
    {name:"The Big Show",rank:44},{name:"Chris Harris",rank:46},
    {name:"Nigel McGuinness",rank:47},{name:"Bobby Lashley",rank:51},
    {name:"James Storm",rank:53},{name:"Chris Sabin",rank:107},
    {name:"Roderick Strong",rank:63},{name:"Austin Aries",rank:61},
    {name:"Matt Hardy",rank:90},{name:"Sabu",rank:92},{name:"Umaga",rank:98},
    {name:"Matt Sydal",rank:101},{name:"Homicide",rank:159},
    {name:"Rocky Romero",rank:181},{name:"Jay Lethal",rank:170},
    {name:"Chavo Guerrero",rank:187},{name:"Tommy Dreamer",rank:175},
    {name:"Bobby Roode",rank:165},{name:"Shinsuke Nakamura",rank:130},
    {name:"Davey Richards",rank:145},{name:"The Great Khali",rank:144},
    {name:"Finlay",rank:111},{name:"William Regal",rank:123},
    {name:"Juventud Guerrera",rank:139},{name:"Brian Kendrick",rank:148},
    {name:"Mike Knox",rank:140},{name:"Eric Young",rank:172},{name:"The Miz",rank:174},
    {name:"Chris Hero",rank:127},{name:"Jack Evans",rank:113},
    {name:"La Mascara",rank:133},{name:"Super Crazy",rank:119},
    {name:"Paul London",rank:87},{name:"Volador Jr.",rank:192},
    {name:"Taiji Ishimori",rank:188},
  ],
  2007: [
    {name:"John Cena",rank:1},{name:"Edge",rank:2},{name:"Kurt Angle",rank:4},
    {name:"The Undertaker",rank:5},{name:"Shawn Michaels",rank:6},
    {name:"Christian Cage",rank:7},{name:"Bobby Lashley",rank:9},
    {name:"Samoa Joe",rank:12},{name:"Batista",rank:13},{name:"Minoru Suzuki",rank:14},
    {name:"Randy Orton",rank:15},{name:"Bryan Danielson",rank:17},
    {name:"King Booker",rank:18},{name:"Sting",rank:19},{name:"Umaga",rank:22},
    {name:"Abyss",rank:23},{name:"Rob Van Dam",rank:24},{name:"Nigel McGuinness",rank:25},
    {name:"Naomichi Marufuji",rank:27},{name:"Chris Sabin",rank:28},
    {name:"Jeff Hardy",rank:29},{name:"Christopher Daniels",rank:30},
    {name:"AJ Styles",rank:32},{name:"Finlay",rank:33},{name:"Jushin Liger",rank:34},
    {name:"The Big Show",rank:35},{name:"Matt Hardy",rank:36},{name:"Rocky Romero",rank:37},
    {name:"Rhino",rank:39},{name:"Hiroshi Tanahashi",rank:40},{name:"Carlito",rank:41},
    {name:"CM Punk",rank:42},{name:"Chavo Guerrero",rank:46},
    {name:"MVP",rank:47},{name:"Dr. Wagner Jr.",rank:48},{name:"Chris Hero",rank:49},
    {name:"Triple H",rank:51},{name:"CIMA",rank:52},{name:"Homicide",rank:54},
    {name:"Roderick Strong",rank:55},{name:"John Morrison",rank:56},
    {name:"Alex Shelley",rank:75},{name:"Davey Richards",rank:76},
    {name:"William Regal",rank:77},{name:"Jay Briscoe",rank:78},{name:"Atlantis",rank:79},
    {name:"Mark Briscoe",rank:83},{name:"Doug Williams",rank:84},
    {name:"Elijah Burke",rank:87},{name:"Chris Masters",rank:89},
    {name:"Shelton Benjamin",rank:91},{name:"Jay Lethal",rank:95},
    {name:"Shinsuke Nakamura",rank:96},{name:"Paul London",rank:97},
    {name:"Brian Kendrick",rank:98},{name:"Austin Aries",rank:102},
    {name:"Giant Bernard",rank:105},{name:"Colt Cabana",rank:108},
    {name:"Dragon Kid",rank:111},{name:"Taiji Ishimori",rank:174},
    {name:"Super Crazy",rank:124},{name:"La Mascara",rank:161},
    {name:"Bobby Roode",rank:71},{name:"Ric Flair",rank:70},{name:"Kane",rank:65},
    {name:"Mark Henry",rank:184},{name:"Santino Marella",rank:179},
    {name:"Kevin Steen",rank:180},{name:"PAC",rank:183},{name:"Eric Young",rank:120},
    {name:"B.J. Whitmer",rank:118},{name:"Katsuhiko Nakajima",rank:181},
    {name:"Cody Rhodes",rank:172},{name:"The Miz",rank:148},{name:"Shawn Spears",rank:160},
    {name:"Matt Sydal",rank:128},{name:"Jack Evans",rank:149},{name:"Jeff Jarrett",rank:117},
  ],
  1995: [
    {name:"Shane Douglas",rank:28},{name:"The 1-2-3 Kid",rank:29},{name:"Bam Bam Bigelow",rank:30},
    {name:"Cactus Jack",rank:31},{name:"Yokozuna",rank:32},{name:"2 Cold Scorpio",rank:33},
    {name:"Sid Vicious",rank:34},{name:"Dan Severn",rank:35},{name:"Bob Holly",rank:76},
    {name:"Waylon Mercy",rank:80},{name:"Hunter Hearst Helmsley",rank:84},{name:"Greg Valentine",rank:85},
    {name:"Scott Norton",rank:86},{name:"Booker T",rank:89},{name:"Steve Williams",rank:91},
    {name:"Meng",rank:92},{name:"Rick Martel",rank:93},{name:"Johnny Grunge",rank:94},
    {name:"Masa Chono",rank:95},{name:"Fatu",rank:98},{name:"Ultimo Dragon",rank:99},
    {name:"Brian Lee",rank:100},{name:"Shark",rank:101},{name:"Johnny Ace",rank:108},
    {name:"Bobby Blaze",rank:109},{name:"New Jack",rank:126},{name:"Dick Slater",rank:131},
    {name:"Ricky Morton",rank:135},{name:"Johnny Gunn",rank:138},{name:"Jimmy Snuka",rank:149},
    {name:"Tommy Rich",rank:161},{name:"Typhoon",rank:162},{name:"Axl Rotten",rank:166},
    {name:"Bobby Fulton",rank:192},{name:"Headbanger Mosh",rank:201},{name:"Jimmy Deo",rank:202},
    {name:"Headbanger Thrasher",rank:203},{name:"Invader Jose Gonzales",rank:210},
    {name:"Vampire Warrior",rank:211},{name:"The Hater",rank:216},{name:"Paul Roma",rank:222},
    {name:"Killer Kyle",rank:223},{name:"Nikolai Volkoff",rank:226},{name:"Tony Atlas",rank:230},
    {name:"Firefighter Adrian",rank:231},{name:"Eddie Golden",rank:232},{name:"Brad Armstrong",rank:238},
    {name:"Steve Lombardi",rank:239},{name:"Tommy Rogers",rank:240},{name:"Scott D'Amore",rank:241},
    {name:"Erik Watts",rank:242},{name:"Jim McPherson",rank:254},{name:"Terry Austin",rank:257},
    {name:"Bushwhacker Luke",rank:258},{name:"The Warlord",rank:260},{name:"Jimmy Valiant",rank:261},
    {name:"Butch Reed",rank:268},{name:"Wahoo Daniel",rank:269},{name:"Headhunter A",rank:270},
    {name:"Johnny Graham",rank:271},{name:"Bob Armstrong",rank:272},{name:"Robbie Royce",rank:273},
    {name:"Rock Stevens",rank:279},{name:"Headhunter B",rank:280},{name:"Mike Enos",rank:283},
    {name:"Kendo Nagasaki",rank:284},{name:"King Kahlua",rank:285},{name:"Tony Roy",rank:287},
    {name:"Mike Samson",rank:289},{name:"Ryuma Go",rank:290},{name:"Stone Cold Kid",rank:291},
    {name:"Moondog Spot",rank:299},{name:"Tyrone Knox",rank:300},{name:"Ice Man",rank:312},
    {name:"Chaz Taylor",rank:313},{name:"Moondog Spike",rank:319},{name:"Killer Brooks",rank:323},
    {name:"Frank Blues",rank:336},{name:"Hack Meyers",rank:337},{name:"Jim Steele",rank:338},
    {name:"Chi Chi Cruz",rank:339},{name:"Scotty Summers",rank:340},{name:"Keith Hart",rank:341},
    {name:"Mr. Ooh La La",rank:358},{name:"Inferno Kid",rank:359},{name:"Jerry Grey",rank:360},
    {name:"Chris Carter",rank:361},{name:"Bobby Rogers",rank:370},{name:"The Nomad",rank:379},
    {name:"Gary Royal",rank:391},{name:"Jimmy Sharpe",rank:392},{name:"Black Night",rank:396},
    {name:"Boris Dragoff",rank:397},{name:"The Ultimate Warrior",rank:420},{name:"The Crow",rank:429},
    {name:"Troy Mest",rank:445},{name:"Bob The Butcher",rank:449},{name:"Sean Casey",rank:483},
    {name:"Adam Flash",rank:484},{name:"Kevin Kirby",rank:500},
  ],
  1996: [
    {name:"The Giant",rank:2},{name:"Sabu",rank:9},{name:"Dean Malenko",rank:13},
    {name:"Big Van Vader",rank:14},{name:"Lex Luger",rank:17},{name:"Rick Steiner",rank:30},
    {name:"The Great Muta",rank:32},{name:"Jushin Liger",rank:38},{name:"Psicosis",rank:39},
    {name:"Savio Vega",rank:49},{name:"Yokozuna",rank:50},{name:"Antonio Inoki",rank:52},
    {name:"Mabel",rank:53},{name:"Diamond Dallas Page",rank:54},{name:"Faarooq",rank:55},
    {name:"Lord Steven Regal",rank:56},{name:"Bam Bam Bigelow",rank:71},
    {name:"Road Warrior Hawk",rank:91},{name:"Abdullah The Butcher",rank:92},
    {name:"Stevie Richards",rank:97},{name:"Scott Norton",rank:100},{name:"Alex Wright",rank:101},
    {name:"Carlos Colon",rank:104},{name:"New Jack",rank:129},{name:"Axl Rotten",rank:132},
    {name:"Bart Gunn",rank:133},{name:"Bob Holly",rank:135},{name:"Jim Neidhart",rank:171},
    {name:"Greg Valentine",rank:173},{name:"Scott Armstrong",rank:176},{name:"Duke Droese",rank:181},
    {name:"Heavy Metal",rank:201},{name:"Virgil",rank:214},{name:"Road Warrior Animal",rank:224},
    {name:"Tony Atlas",rank:225},{name:"Moondog Spot",rank:292},{name:"Bob Backlund",rank:301},
    {name:"El Mascarado",rank:302},{name:"Silver King",rank:303},{name:"The Hater",rank:304},
    {name:"Vampiro Canadiense",rank:305},{name:"Wahoo McDaniel",rank:306},
    {name:"Frank Blues",rank:308},{name:"Big Dick Dudley",rank:310},{name:"Rex King",rank:311},
    {name:"Bob Orton Jr.",rank:312},{name:"Timber The Lumberjack",rank:314},
    {name:"Paul Zine",rank:315},{name:"Hack Meyers",rank:316},{name:"Jesse Barr",rank:317},
    {name:"Phil Belanger",rank:318},{name:"Charlie Norris",rank:319},{name:"Super Nova",rank:320},
    {name:"Masked Maniac",rank:321},{name:"Gorgeous George III",rank:322},
    {name:"Geza Kalman Jr.",rank:323},{name:"Irish Bobby Clancy",rank:324},
    {name:"James Stone",rank:325},{name:"Russian Assassin #2",rank:329},
    {name:"Nikolai Volkoff",rank:330},{name:"Benson Lee",rank:331},
    {name:"Bam Bam Coalson",rank:332},{name:"Johnny Lightning",rank:333},
    {name:"Dave Keller",rank:338},{name:"New One Man Gang",rank:339},
    {name:"Thunder Morgan",rank:340},{name:"Keith Hart",rank:341},{name:"Bruiser Mastino",rank:342},
    {name:"Tony Rumble",rank:343},{name:"Black Bear",rank:344},{name:"Kid Collins",rank:345},
    {name:"Spellbinders",rank:346},{name:"Scotty Summers",rank:347},{name:"Bo Dascious",rank:349},
    {name:"Golem The Giant",rank:350},{name:"Guido Falcone",rank:351},{name:"Lenny Lane",rank:352},
    {name:"Tim Blaze",rank:353},{name:"Major DeBeers",rank:354},{name:"Carolina Dreamer",rank:355},
    {name:"David Jericho",rank:356},{name:"Mark Mest",rank:357},{name:"Knight Rider",rank:358},
    {name:"Jimmy Deo",rank:359},{name:"Primo Camera III",rank:360},{name:"Jerry Grey",rank:361},
    {name:"Gino Caruso",rank:362},{name:"Reckless Youth",rank:363},{name:"Jeff Lindberg",rank:364},
    {name:"Jackie Fulton",rank:365},{name:"Metal Maniac",rank:366},{name:"Tony DeVito",rank:369},
    {name:"Johnny Paradise",rank:370},{name:"Turbo Eric Freedom",rank:371},
    {name:"Manny Fernandez",rank:372},{name:"Otis Apollo",rank:373},
    {name:"Corporal Punishment",rank:374},{name:"Mr. Excellent",rank:375},
    {name:"Troy Mest",rank:376},{name:"The Iron Sheik",rank:382},{name:"Madman Pondo",rank:383},
    {name:"Johnny Swinger",rank:384},{name:"Killer Kanareck",rank:385},
    {name:"Jimmy Torture",rank:386},{name:"Charlie Parker",rank:387},
    {name:"Johnny Handsome",rank:388},{name:"Chameleon",rank:389},
    {name:"Morgus The Maniac",rank:390},{name:"Jimmy Sharpe",rank:391},{name:"Sunny",rank:392},
    {name:"Vinnie Biondo",rank:393},{name:"Adam Flash",rank:399},
    {name:"Brian Danzig",rank:400},{name:"Mass Transit",rank:499},
  ],
  2015: [
    {name:"Nikki Bella",rank:1},{name:"Paige",rank:2},{name:"Sasha Banks",rank:3},
    {name:"Santana Garrett",rank:4},{name:"Gail Kim",rank:5},{name:"Charlotte",rank:6},
    {name:"Naomi",rank:7},{name:"Cherry Bomb",rank:8},{name:"Courtney Rush",rank:9},
    {name:"Taryn Terrell",rank:10},{name:"Bayley",rank:11},{name:"Brie Bella",rank:12},
    {name:"Sexy Star",rank:13},{name:"Cheerleader Melissa",rank:14},{name:"LuFisto",rank:15},
    {name:"Nicole Matthews",rank:16},{name:"Becky Lynch",rank:17},{name:"Kimber Lee",rank:18},
    {name:"Natalya",rank:19},{name:"Jessicka Havok",rank:20},{name:"Awesome Kong",rank:21},
    {name:"Candice LeRae",rank:22},{name:"Brooke",rank:23},{name:"Athena",rank:24},
    {name:"Ivelisse",rank:25},{name:"Jade",rank:26},{name:"Madison Rayne",rank:27},
    {name:"Blue Pants",rank:28},{name:"Barbi Hayden",rank:29},{name:"Angelina Love",rank:30},
    {name:"Emma",rank:31},{name:"Saraya Knight",rank:32},{name:"Veda Scott",rank:33},
    {name:"Velvet Sky",rank:34},{name:"Madison Eagles",rank:35},{name:"Kay Lee Ray",rank:36},
    {name:"Marti Belle",rank:37},{name:"Kellie Skater",rank:38},{name:"Nikki Storm",rank:39},
    {name:"Evie",rank:40},{name:"Heidi Lovelace",rank:41},{name:"Tessa Blanchard",rank:42},
    {name:"Portia Perez",rank:43},{name:"Alicia Fox",rank:44},{name:"Cat Power",rank:45},
    {name:"Crazy Mary Dobson",rank:46},{name:"Xandra Bale",rank:47},
    {name:"La Rosa Negra",rank:48},{name:"Malia Hosaka",rank:49},{name:"Vanessa Kraven",rank:50},
    // Men's rankings 2015
    {name:"Seth Rollins",rank:1},{name:"John Cena",rank:2},{name:"AJ Styles",rank:3},
    {name:"Roman Reigns",rank:4},{name:"Shinsuke Nakamura",rank:5},{name:"Randy Orton",rank:6},
    {name:"Jay Briscoe",rank:7},{name:"Rusev",rank:8},{name:"Alberto El Patron",rank:9},
    {name:"Kevin Owens",rank:10},{name:"Hiroshi Tanahashi",rank:11},{name:"Dolph Ziggler",rank:12},
    {name:"Dean Ambrose",rank:13},{name:"Daniel Bryan",rank:14},{name:"Neville",rank:15},
    {name:"Prince Puma",rank:16},{name:"Jay Lethal",rank:17},{name:"Bobby Lashley",rank:18},
    {name:"Minoru Suzuki",rank:19},{name:"King Barrett",rank:20},{name:"Bray Wyatt",rank:21},
    {name:"Bobby Roode",rank:22},{name:"Sami Zayn",rank:23},{name:"Luke Harper",rank:24},
    {name:"Kurt Angle",rank:25},{name:"Mil Muertes",rank:26},{name:"Kazuchika Okada",rank:27},
    {name:"Finn Balor",rank:28},{name:"Ryback",rank:29},{name:"Ethan Carter III",rank:30},
    {name:"Go Shiozaki",rank:31},{name:"Johnny Mundo",rank:32},{name:"Eric Young",rank:33},
    {name:"KUSHIDA",rank:34},{name:"Kyle O'Reilly",rank:35},{name:"The Big Show",rank:36},
    {name:"Drew Galloway",rank:37},{name:"Hideo Itami",rank:38},{name:"Adam Cole",rank:39},
    {name:"Kota Ibushi",rank:40},{name:"Cesaro",rank:41},{name:"Sheamus",rank:42},
    {name:"Michael Elgin",rank:43},{name:"Big E",rank:44},{name:"Bobby Fish",rank:45},
    {name:"Samoa Joe",rank:46},{name:"Jeff Hardy",rank:47},{name:"Naomichi Marufuji",rank:48},
    {name:"Jimmy Uso",rank:49},{name:"Austin Aries",rank:50},{name:"Kane",rank:51},
    {name:"Kofi Kingston",rank:52},{name:"Tyson Kidd",rank:53},{name:"Kenny Omega",rank:54},
    {name:"Davey Richards",rank:55},{name:"James Storm",rank:56},{name:"The Miz",rank:60},
    {name:"Tyler Breeze",rank:61},{name:"Roderick Strong",rank:62},{name:"Stardust",rank:65},
    {name:"Matt Jackson",rank:66},{name:"Nick Jackson",rank:67},{name:"Frankie Kazarian",rank:69},
    {name:"Mark Briscoe",rank:70},{name:"Magnus",rank:71},{name:"Jey Uso",rank:72},
    {name:"Doc Gallows",rank:73},{name:"Matt Hardy",rank:74},{name:"Eddie Edwards",rank:75},
    {name:"Hirooki Goto",rank:76},{name:"Xavier Woods",rank:77},{name:"Brian Cage",rank:78},
    {name:"Karl Anderson",rank:79},{name:"Tetsuya Naito",rank:80},{name:"Davey Boy Smith Jr.",rank:81},
    {name:"Michael Bennett",rank:82},{name:"Chris Jericho",rank:84},{name:"Cedric Alexander",rank:85},
    {name:"Baron Corbin",rank:86},{name:"Goldust",rank:89},{name:"Bad Luck Fale",rank:90},
    {name:"MVP",rank:91},{name:"Lance Archer",rank:92},{name:"Damien Sandow",rank:93},
    {name:"R-Truth",rank:94},{name:"Pentagon Jr.",rank:95},{name:"Matt Taven",rank:96},
    {name:"Low Ki",rank:97},{name:"A.R. Fox",rank:99},{name:"Suwama",rank:101},
    {name:"Ryusuke Taguchi",rank:102},{name:"Rocky Romero",rank:103},{name:"Chris Hero",rank:104},
    {name:"Trent Beretta",rank:105},{name:"Kenny King",rank:106},{name:"Johnny Gargano",rank:109},
    {name:"Tomohiro Ishii",rank:110},{name:"Abyss",rank:112},{name:"Rockstar Spud",rank:113},
    {name:"Buddy Murphy",rank:116},{name:"Angelico",rank:117},{name:"Rich Swann",rank:119},
    {name:"Kalisto",rank:120},{name:"Katsuyori Shibata",rank:123},{name:"Bully Ray",rank:129},
    {name:"Mark Henry",rank:130},{name:"Drew Gulak",rank:132},{name:"Tommaso Ciampa",rank:133},
    {name:"Seiya Sanada",rank:136},{name:"Fenix",rank:162},{name:"Tommy End",rank:163},
    {name:"Zack Sabre Jr.",rank:165},{name:"Fandango",rank:183},{name:"Adam Page",rank:190},
    {name:"Eli Drake",rank:196},{name:"Uhaa Nation",rank:197},{name:"HARASHIMA",rank:201},
    {name:"Colin Cassady",rank:206},{name:"Dalton Castle",rank:221},{name:"Chase Owens",rank:222},
    {name:"Joey Ryan",rank:223},{name:"Jushin Thunder Liger",rank:230},{name:"Scorpio Sky",rank:257},
    {name:"Timothy Thatcher",rank:300},{name:"Ethan Page",rank:305},{name:"Psycho Clown",rank:323},
    {name:"Mike Bailey",rank:324},{name:"Tye Dillinger",rank:328},{name:"Shane Strickland",rank:340},
    {name:"Willie Mack",rank:346},{name:"Trevor Lee",rank:350},{name:"Andrew Everett",rank:368},
    {name:"Eddie Kingston",rank:386},{name:"Alex Reynolds",rank:430},{name:"John Silver",rank:441},
    {name:"David Finlay",rank:447},{name:"Jack Evans",rank:454},{name:"Chris Dickinson",rank:463},
    {name:"Peter Avalon",rank:464},{name:"Jaxon Jarvis",rank:465},{name:"Cheeseburger",rank:496},
    {name:"The Space Monkey",rank:500},
  ],
  2016: [
    {name:"Roman Reigns",rank:1},{name:"Kazuchika Okada",rank:2},{name:"Finn Balor",rank:3},
    {name:"AJ Styles",rank:4},{name:"Jay Lethal",rank:5},{name:"Kevin Owens",rank:6},
    {name:"Shinsuke Nakamura",rank:7},{name:"Seth Rollins",rank:8},{name:"Dean Ambrose",rank:9},
    {name:"John Cena",rank:10},{name:"Drew Galloway",rank:11},{name:"Tetsuya Naito",rank:12},
    {name:"Roderick Strong",rank:13},{name:"Samoa Joe",rank:14},{name:"Ricochet",rank:15},
    {name:"Will Ospreay",rank:16},{name:"Sheamus",rank:17},{name:"Michael Elgin",rank:18},
    {name:"Brock Lesnar",rank:19},{name:"Ethan Carter III",rank:20},{name:"Chris Jericho",rank:21},
    {name:"The Miz",rank:22},{name:"Kenny Omega",rank:23},{name:"Bobby Lashley",rank:24},
    {name:"Kalisto",rank:25},{name:"Bobby Fish",rank:26},{name:"Hiroshi Tanahashi",rank:27},
    {name:"Zack Sabre Jr.",rank:28},{name:"Alberto Del Rio",rank:29},{name:"Jay Briscoe",rank:30},
    {name:"Ryback",rank:31},{name:"Kyle O'Reilly",rank:32},{name:"Matt Hardy",rank:33},
    {name:"Rusev",rank:34},{name:"Katsuyori Shibata",rank:35},{name:"Dolph Ziggler",rank:36},
    {name:"Tomohiro Ishii",rank:37},{name:"Big E",rank:38},{name:"Kento Miyahara",rank:39},
    {name:"Sami Zayn",rank:40},{name:"Go Shiozaki",rank:41},{name:"Kofi Kingston",rank:42},
    {name:"Shingo Takagi",rank:43},{name:"Takashi Sugiura",rank:44},{name:"Adam Cole",rank:45},
    {name:"Matt Jackson",rank:46},{name:"Hirooki Goto",rank:47},{name:"KUSHIDA",rank:48},
    {name:"Nick Jackson",rank:49},{name:"The Monster Matanza Cueto",rank:50},
    {name:"Mike Bennett",rank:51},{name:"Kane",rank:52},{name:"Baron Corbin",rank:53},
    {name:"Austin Aries",rank:54},{name:"Cesaro",rank:55},{name:"Bray Wyatt",rank:56},
    {name:"El Texano Jr.",rank:57},{name:"Xavier Woods",rank:58},{name:"Randy Orton",rank:59},
    {name:"Yuji Okabayashi",rank:60},{name:"Trevor Lee",rank:61},{name:"Johnny Mundo",rank:62},
    {name:"Daisuke Sekimoto",rank:63},{name:"Maximo Sexy",rank:64},{name:"Luke Gallows",rank:65},
    {name:"Adrian Neville",rank:66},{name:"Jeff Hardy",rank:67},{name:"Pentagon Jr.",rank:68},
    {name:"Karl Anderson",rank:69},{name:"Bobby Roode",rank:70},{name:"Timothy Thatcher",rank:71},
    {name:"Apollo Crews",rank:72},{name:"Kota Ibushi",rank:73},{name:"ACH",rank:74},
    {name:"Togi Makabe",rank:75},{name:"Rey Mysterio Jr.",rank:76},{name:"Mil Muertes",rank:77},
    {name:"Jax Dane",rank:78},{name:"James Storm",rank:79},{name:"Naomichi Marufuji",rank:80},
    {name:"Eddie Edwards",rank:81},{name:"BUSHI",rank:82},{name:"Mark Briscoe",rank:83},
    {name:"Minoru Suzuki",rank:84},{name:"Luke Harper",rank:85},{name:"Christopher Daniels",rank:86},
    {name:"Abyss",rank:87},{name:"Eric Young",rank:88},{name:"Fenix",rank:89},
    {name:"Jey Uso",rank:90},{name:"Isami Kodaka",rank:91},{name:"Frankie Kazarian",rank:92},
    {name:"Crazzy Steve",rank:93},{name:"Eli Drake",rank:94},{name:"Cage",rank:95},
    {name:"Nick Aldis",rank:96},{name:"Raymond Rowe",rank:97},{name:"Davey Boy Smith Jr.",rank:98},
    {name:"Jimmy Uso",rank:99},{name:"Rockstar Spud",rank:100},{name:"Lance Archer",rank:101},
    {name:"The Big Show",rank:102},{name:"Rocky Romero",rank:103},{name:"Moose",rank:104},
    {name:"Tommaso Ciampa",rank:105},{name:"Noam Dar",rank:106},{name:"Trent Beretta",rank:107},
    {name:"Hanson",rank:108},{name:"Zack Ryder",rank:109},{name:"Shuji Ishikawa",rank:110},
    {name:"Cody Rhodes",rank:111},{name:"Rey Bucanero",rank:112},{name:"Ryusuke Taguchi",rank:113},
    {name:"Johnny Gargano",rank:114},{name:"Bram",rank:115},{name:"Cedric Alexander",rank:116},
    {name:"King Cuerno",rank:117},{name:"Drew Gulak",rank:118},{name:"Jason Jordan",rank:119},
    {name:"Big Cass",rank:120},{name:"Rob Conway",rank:121},{name:"Enzo Amore",rank:122},
    {name:"Chad Gable",rank:123},{name:"Angelico",rank:124},{name:"Chris Hero",rank:125},
    {name:"Tigre Uno",rank:126},{name:"Davey Richards",rank:127},{name:"Drago",rank:128},
    {name:"Matt Sydal",rank:129},{name:"Tyson Dux",rank:130},
    {name:"Andrade 'Cien' Almas",rank:131},{name:"Dash Wilder",rank:132},
    {name:"Sin Cara",rank:133},{name:"Tyrus",rank:134},{name:"Scott Dawson",rank:135},
    {name:"Rich Swann",rank:136},{name:"Tony Nese",rank:137},{name:"Matt Cross",rank:138},
    {name:"Robbie E.",rank:139},{name:"Alex Shelley",rank:140},{name:"P.J. Black",rank:141},
    {name:"Wade Barrett",rank:142},{name:"Jessie Godderz",rank:143},{name:"SANADA",rank:144},
    {name:"Mike Bailey",rank:145},{name:"Matt Riviera",rank:146},{name:"Shane Thorne",rank:147},
    {name:"Kenny King",rank:148},{name:"Bubba Ray Dudley",rank:149},{name:"Kohei Sato",rank:150},
    {name:"Erick Rowan",rank:151},{name:"Atsushi Aoki",rank:152},{name:"D-Von Dudley",rank:153},
    {name:"Nick Miller",rank:154},{name:"Chris Sabin",rank:155},{name:"Andrew Everett",rank:156},
    {name:"Colt Cabana",rank:157},{name:"Joey Ryan",rank:158},{name:"Braxton Sutter",rank:159},
    {name:"Rhett Titus",rank:160},{name:"Titus O'Neil",rank:161},{name:"Oney Lorcan",rank:162},
    {name:"Braun Strowman",rank:163},{name:"Jack Swagger",rank:164},{name:"Mark Andrews",rank:165},
    {name:"Epico",rank:166},{name:"Atlantis",rank:167},{name:"Brian Kendrick",rank:168},
    {name:"DJ Z",rank:169},{name:"Primo",rank:170},{name:"Aiden English",rank:171},
    {name:"Sami Callihan",rank:172},{name:"R-Truth",rank:173},{name:"Tommy End",rank:174},
    {name:"Simon Gotch",rank:175},{name:"Dalton Castle",rank:176},{name:"Akira Tozawa",rank:177},
    {name:"HARASHIMA",rank:178},{name:"Goldust",rank:179},{name:"Lio Rush",rank:180},
    {name:"YAMATO",rank:181},{name:"Curtis Axel",rank:182},{name:"Matt Taven",rank:183},
    {name:"El Hijo del Fantasma",rank:185},{name:"Shelton Benjamin",rank:186},
    {name:"Darren Young",rank:189},{name:"Adam Page",rank:191},{name:"Zeus",rank:192},
    {name:"Mojo Rawley",rank:193},{name:"Mark Henry",rank:197},{name:"Bo Dallas",rank:199},
    {name:"Elias Samson",rank:203},{name:"Marty Scurll",rank:204},{name:"Tye Dillinger",rank:206},
    {name:"Jack Evans",rank:207},{name:"Tyler Breeze",rank:209},{name:"Heath Slater",rank:212},
    {name:"Fandango",rank:224},{name:"Buddy Murphy",rank:227},{name:"EVIL",rank:229},
    {name:"Carlito",rank:231},{name:"A.R. Fox",rank:233},{name:"T.J. Perkins",rank:234},
    {name:"Chuck Taylor",rank:235},{name:"Caristico",rank:236},{name:"Dragon Lee",rank:251},
    {name:"Bad Luck Fale",rank:252},{name:"Jushin Thunder Liger",rank:261},
    {name:"Jack Gallagher",rank:273},{name:"Stevie Richards",rank:275},
    {name:"Ariya Daivari",rank:280},{name:"Matt Riddle",rank:281},
    {name:"Tama Tonga",rank:299},{name:"Ethan Page",rank:307},
    {name:"Big Daddy Walter",rank:315},{name:"Jay White",rank:363},
    {name:"Pete Dunne",rank:396},{name:"Evil Uno",rank:397},{name:"Tracy Williams",rank:398},
    {name:"Sammy Guevara",rank:422},{name:"Scorpio Sky",rank:423},
    {name:"Negro Casas",rank:429},{name:"David Finlay",rank:431},
    {name:"Punisher Martinez",rank:447},{name:"D.J. Hyde",rank:449},
    {name:"Alessandro Del Bruno",rank:450},{name:"Sasa Keel",rank:451},
    {name:"Conor Claxton",rank:452},{name:"Colby Corino",rank:453},
    {name:"Alex Reynolds",rank:454},{name:"Tyler Bateman",rank:455},
    {name:"Hammerstone",rank:456},{name:"Luster The Legend",rank:457},
    {name:"John Silver",rank:458},{name:"Josef Von Schmidt",rank:459},
    {name:"Ron Falco",rank:460},{name:"Colin Cutler",rank:461},
    {name:"Danny Duggan",rank:462},{name:"Jody Kristofferson",rank:463},
    {name:"Sean Carr",rank:464},{name:"Levi Shapiro",rank:465},
    {name:"Tyler Colton",rank:466},{name:"Greg Excellent",rank:467},
    {name:"Buddy Royal",rank:468},{name:"Slim J",rank:469},
    {name:"Shaheem Ali",rank:470},{name:"Mike Posey",rank:471},
    {name:"Bob Evans",rank:472},{name:"John Skyler",rank:473},
    {name:"Jaxon Jarvis",rank:474},{name:"Shane Sabre",rank:475},
    {name:"Brandon Scott",rank:476},{name:"Jake O'Reilly",rank:477},
    {name:"George Gatton",rank:478},{name:"Cory Kastle",rank:479},
    {name:"Leon St. Giovanni",rank:480},{name:"N8 Mattson",rank:481},
    {name:"Mr. Juicy",rank:482},{name:"Artemis Spencer",rank:483},
    {name:"Anthony Henry",rank:484},{name:"The Space Monkey",rank:485},
    {name:"Anthony Darko",rank:486},{name:"Will Calrissian",rank:487},
    {name:"John Campbell",rank:488},{name:"Chrisifix",rank:489},
    {name:"Raphael King",rank:490},{name:"Coconut Jones",rank:491},
    {name:"Brandon Thurston",rank:492},{name:"Jonny Puma",rank:493},
    {name:"Mattick",rank:494},{name:"Chris Perish",rank:495},
    {name:"Frankie Feathers",rank:496},{name:"Thomas Brewington",rank:497},
    {name:"Wolfgang Danger",rank:498},{name:"Eric Emanon",rank:499},
        // Women's rankings 2016
    {name:"Charlotte",rank:1},{name:"Sasha Banks",rank:2},{name:"Asuka",rank:3},
    {name:"Becky Lynch",rank:4},{name:"Bayley",rank:5},{name:"Jade",rank:6},
    {name:"Natalya",rank:7},{name:"Gail Kim",rank:8},{name:"Sexy Star",rank:9},
    {name:"Sienna",rank:10},{name:"Ivelisse",rank:11},{name:"Madison Eagles",rank:12},
    {name:"Nicole Savoy",rank:13},{name:"Rosemary",rank:14},{name:"Allie",rank:15},
    {name:"Nicole Matthews",rank:16},{name:"Kimber Lee",rank:17},{name:"Candice LeRae",rank:18},
    {name:"Paige",rank:19},{name:"Heidi Lovelace",rank:20},{name:"Evie",rank:21},
    {name:"Mariposa",rank:22},{name:"Nia Jax",rank:23},{name:"Santana Garrett",rank:24},
    {name:"Naomi",rank:25},{name:"Dana Brooke",rank:26},{name:"Madison Rayne",rank:27},
    {name:"Kay Lee Ray",rank:28},{name:"Alexa Bliss",rank:29},{name:"LuFisto",rank:30},
    {name:"Ember Moon",rank:37},{name:"Tessa Blanchard",rank:38},
    {name:"Jessicka Havok",rank:39},{name:"Shayna Baszler",rank:40},
    {name:"Carmella",rank:44},{name:"K. C. Spinelli",rank:45},{name:"Veda Scott",rank:46},
    {name:"Eva Marie",rank:50},
    {name:"Timmy Lou Retton",rank:500},
  ],
  2018: [
    {name:"Kenny Omega",rank:1},{name:"AJ Styles",rank:2},{name:"Kazuchika Okada",rank:3},
    {name:"Brock Lesnar",rank:4},{name:"Seth Rollins",rank:5},{name:"Braun Strowman",rank:6},
    {name:"Roman Reigns",rank:7},{name:"Cody Rhodes",rank:8},{name:"Tetsuya Naito",rank:9},
    {name:"The Miz",rank:10},{name:"Shinsuke Nakamura",rank:11},{name:"Will Ospreay",rank:12},
    {name:"Andrade 'Cien' Almas",rank:13},{name:"Jinder Mahal",rank:14},
    {name:"Dalton Castle",rank:15},{name:"Finn Balor",rank:16},{name:"Kevin Owens",rank:17},
    {name:"Randy Orton",rank:18},{name:"Minoru Suzuki",rank:19},{name:"John Cena",rank:20},
    {name:"Adam Cole",rank:21},{name:"Bobby Roode",rank:22},{name:"Samoa Joe",rank:23},
    {name:"Zack Sabre Jr.",rank:24},{name:"Austin Aries",rank:25},{name:"Sami Zayn",rank:26},
    {name:"Hiromu Takahashi",rank:27},{name:"Cedric Alexander",rank:28},{name:"Kota Ibushi",rank:29},
    {name:"Pentagon Jr.",rank:30},{name:"Hiroshi Tanahashi",rank:31},{name:"Eli Drake",rank:32},
    {name:"Pete Dunne",rank:33},{name:"Johnny Gargano",rank:34},{name:"Ricochet",rank:35},
    {name:"Roderick Strong",rank:36},{name:"Cesaro",rank:37},{name:"Nick Jackson",rank:38},
    {name:"Marty Scurll",rank:39},{name:"Matt Jackson",rank:40},{name:"Aleister Black",rank:41},
    {name:"Sheamus",rank:42},{name:"Matt Hardy",rank:43},{name:"Jay White",rank:44},
    {name:"KUSHIDA",rank:45},{name:"Matt Riddle",rank:46},{name:"Johnny Mundo",rank:47},
    {name:"Jay Lethal",rank:48},{name:"Kento Miyahara",rank:49},{name:"Dolph Ziggler",rank:50},
    {name:"Bobby Lashley",rank:51},{name:"Nick Aldis",rank:52},{name:"Jeff Hardy",rank:53},
    {name:"Rusev",rank:54},{name:"Eddie Edwards",rank:55},{name:"Baron Corbin",rank:56},
    {name:"Bray Wyatt",rank:57},{name:"Naomichi Marufuji",rank:58},{name:"Keith Lee",rank:59},
    {name:"Jimmy Uso",rank:60},{name:"Fenix",rank:61},{name:"SANADA",rank:62},
    {name:"Hangman Page",rank:63},{name:"Joe Doering",rank:64},{name:"Jey Uso",rank:65},
    {name:"Matt Sydal",rank:66},{name:"Travis Banks",rank:67},{name:"Hirooki Goto",rank:68},
    {name:"Elias",rank:69},{name:"Big E",rank:70},{name:"EVIL",rank:71},
    {name:"Drew McIntyre",rank:72},{name:"Silas Young",rank:73},{name:"Kyle O'Reilly",rank:75},
    {name:"Tomohiro Ishii",rank:76},{name:"WALTER",rank:77},{name:"The Velveteen Dream",rank:79},
    {name:"Jay Briscoe",rank:80},{name:"Luke Harper",rank:81},{name:"Kofi Kingston",rank:82},
    {name:"EC3",rank:83},{name:"Jeff Cobb",rank:85},{name:"Jason Jordan",rank:87},
    {name:"Xavier Woods",rank:89},{name:"Kenny King",rank:90},{name:"Daniel Bryan",rank:91},
    {name:"Akira Tozawa",rank:92},{name:"Chad Gable",rank:93},{name:"Bobby Fish",rank:94},
    {name:"Drew Gulak",rank:95},{name:"Christopher Daniels",rank:96},{name:"Tommaso Ciampa",rank:97},
    {name:"Tyler Bate",rank:98},{name:"Bad Luck Fale",rank:99},{name:"Mark Briscoe",rank:100},
    {name:"Karl Anderson",rank:102},{name:"Kalisto",rank:103},{name:"Dean Ambrose",rank:106},
    {name:"Luke Gallows",rank:107},{name:"Moose",rank:108},{name:"Shelton Benjamin",rank:109},
    {name:"Eric Young",rank:111},{name:"Mustafa Ali",rank:112},{name:"Ilja Dragunov",rank:113},
    {name:"Frankie Kazarian",rank:114},{name:"Scorpio Sky",rank:116},{name:"Brian Cage",rank:118},
    {name:"Killian Dain",rank:119},{name:"Joey Ryan",rank:120},{name:"Sami Callihan",rank:121},
    {name:"Gran Metalik",rank:130},{name:"Rich Swann",rank:132},{name:"Hideo Itami",rank:133},
    {name:"Flip Gordon",rank:144},{name:"Rey Mysterio Jr.",rank:145},{name:"Neville",rank:154},
    {name:"Chris Sabin",rank:157},{name:"Apollo Crews",rank:160},{name:"Juice Robinson",rank:167},
    {name:"Trent Seven",rank:168},{name:"Lio Rush",rank:178},{name:"Willie Mack",rank:179},
    {name:"TJP",rank:184},{name:"Chuck Taylor",rank:186},{name:"Punishment Martinez",rank:187},
    {name:"Colt Cabana",rank:189},{name:"Petey Williams",rank:194},{name:"Curtis Axel",rank:196},
    {name:"Psycho Clown",rank:197},{name:"Joey Janela",rank:199},{name:"No Way Jose",rank:200},
    {name:"Caristico",rank:202},{name:"Akam",rank:204},{name:"Big Cass",rank:205},
    {name:"Fandango",rank:210},{name:"Rezar",rank:211},{name:"Zack Ryder",rank:212},
    {name:"Goldust",rank:215},{name:"Mojo Rawley",rank:217},{name:"Shane Strickland",rank:221},
    {name:"Jack Gallagher",rank:227},{name:"Ariya Daivari",rank:231},
    {name:"Buddy Murphy",rank:234},{name:"A.R. Fox",rank:240},{name:"Mark Andrews",rank:242},
    {name:"Lance Archer",rank:246},{name:"David Starr",rank:247},{name:"Otis Dozovic",rank:255},
    {name:"James Storm",rank:256},{name:"Angelico",rank:257},{name:"Toru Yano",rank:258},
    {name:"Ethan Page",rank:260},{name:"Noam Dar",rank:262},{name:"Mike Bailey",rank:263},
    {name:"Jushin Thunder Liger",rank:264},{name:"Eddie Kingston",rank:279},
    {name:"Ultimo Dragon",rank:298},{name:"Flash Morgan Webster",rank:300},
    {name:"Matt Angel",rank:301},{name:"MJF",rank:352},{name:"Killer Kross",rank:356},
    {name:"R-Truth",rank:369},{name:"Danny Burch",rank:370},{name:"Oney Lorcan",rank:380},
    {name:"Josh Alexander",rank:381},{name:"Tommy Dreamer",rank:382},{name:"Nick Gage",rank:388},
    {name:"Jonathan Gresham",rank:392},{name:"Joe Hendry",rank:399},
    {name:"Tracy Williams",rank:431},{name:"Darby Allin",rank:433},
    {name:"Richard Holliday",rank:438},{name:"Peter Avalon",rank:440},
    {name:"Raul Mendoza",rank:442},{name:"Fallah Bahh",rank:446},
    {name:"Facade",rank:449},{name:"Jordan Devlin",rank:453},
    {name:"John Silver",rank:458},{name:"Shane Taylor",rank:458},
    {name:"Brody King",rank:461},{name:"Sammy Guevara",rank:463},
    {name:"Sonny Kiss",rank:470},{name:"Daniel Garcia",rank:488},
    {name:"Greg Excellent",rank:452},{name:"Puf",rank:500},
    // Women's rankings 2018
    {name:"Ronda Rousey",rank:1},{name:"Alexa Bliss",rank:2},{name:"Charlotte Flair",rank:3},
    {name:"Io Shirai",rank:4},{name:"Asuka",rank:5},{name:"Shayna Baszler",rank:6},
    {name:"Carmella",rank:7},{name:"Nia Jax",rank:8},{name:"Mayu Iwatani",rank:9},
    {name:"Kairi Sane",rank:10},{name:"Becky Lynch",rank:11},{name:"Sumie Sakai",rank:12},
    {name:"Su Yung",rank:13},{name:"Sasha Banks",rank:14},{name:"Tessa Blanchard",rank:15},
    {name:"Allie",rank:16},{name:"Bayley",rank:17},{name:"Toni Storm",rank:19},
    {name:"Natalya",rank:20},{name:"Ember Moon",rank:21},{name:"Rosemary",rank:22},
    {name:"LuFisto",rank:23},{name:"Nikki Cross",rank:24},{name:"Naomi",rank:25},
    {name:"Nicole Savoy",rank:26},{name:"Mercedes Martinez",rank:29},{name:"Dakota Kai",rank:30},
    {name:"Ruby Riott",rank:31},{name:"Sarah Logan",rank:33},{name:"Taya Valkyrie",rank:36},
    {name:"Mia Yim",rank:38},{name:"Kelly Klein",rank:39},{name:"Shazza McKenzie",rank:40},
    {name:"Mickie James",rank:42},{name:"Meiko Satomura",rank:46},{name:"Jordynne Grace",rank:48},
    {name:"Deonna Purrazzo",rank:49},{name:"Kimber Lee",rank:50},{name:"Chelsea Green",rank:52},
    {name:"Liv Morgan",rank:53},{name:"Santana Garrett",rank:55},{name:"Hana Kimura",rank:60},
    {name:"Candice LeRae",rank:62},{name:"Rhea Ripley",rank:63},{name:"Mandy Rose",rank:69},
    {name:"Britt Baker",rank:71},{name:"Sonya Deville",rank:72},{name:"Brandi Rhodes",rank:84},
    {name:"Bianca Belair",rank:85},{name:"Chihiro Hashimoto",rank:37},
  ],
  2019: [
    {name:"Seth Rollins",rank:1},{name:"Daniel Bryan",rank:2},{name:"AJ Styles",rank:3},
    {name:"Kofi Kingston",rank:4},{name:"Kazuchika Okada",rank:5},{name:"Johnny Gargano",rank:6},
    {name:"Roman Reigns",rank:7},{name:"Kenny Omega",rank:8},{name:"Hiroshi Tanahashi",rank:9},
    {name:"Will Ospreay",rank:10},{name:"Samoa Joe",rank:11},{name:"Jay White",rank:12},
    {name:"Tommaso Ciampa",rank:13},{name:"WALTER",rank:14},{name:"Cody Rhodes",rank:15},
    {name:"Jay Lethal",rank:16},{name:"Kota Ibushi",rank:17},{name:"Adam Cole",rank:18},
    {name:"Finn Balor",rank:19},{name:"Jon Moxley",rank:20},{name:"Ricochet",rank:21},
    {name:"Fenix",rank:22},{name:"Jeff Cobb",rank:23},{name:"Kento Miyahara",rank:24},
    {name:"Tetsuya Naito",rank:25},{name:"The Velveteen Dream",rank:26},
    {name:"Braun Strowman",rank:27},{name:"Pentagon Jr.",rank:28},{name:"Johnny Impact",rank:29},
    {name:"Bobby Lashley",rank:30},{name:"Shinsuke Nakamura",rank:31},
    {name:"Juice Robinson",rank:32},{name:"Buddy Murphy",rank:33},{name:"Aleister Black",rank:34},
    {name:"The Miz",rank:35},{name:"Drew McIntyre",rank:36},{name:"Matt Taven",rank:37},
    {name:"Randy Orton",rank:38},{name:"Baron Corbin",rank:39},{name:"Kevin Owens",rank:40},
    {name:"Nick Aldis",rank:41},{name:"SANADA",rank:42},{name:"Zack Sabre Jr.",rank:43},
    {name:"Adam Page",rank:44},{name:"Tony Nese",rank:45},{name:"Dolph Ziggler",rank:46},
    {name:"Minoru Suzuki",rank:47},{name:"Brian Cage",rank:48},{name:"Rusev",rank:49},
    {name:"Hirooki Goto",rank:50},{name:"Robert Roode",rank:51},{name:"Marty Scurll",rank:52},
    {name:"Rey Mysterio",rank:53},{name:"Pete Dunne",rank:54},{name:"Mustafa Ali",rank:55},
    {name:"R-Truth",rank:56},{name:"Dragon Lee",rank:57},{name:"Jordan Devlin",rank:58},
    {name:"Cedric Alexander",rank:59},{name:"Jeff Hardy",rank:60},{name:"EVIL",rank:61},
    {name:"Jey Uso",rank:62},{name:"Jimmy Uso",rank:63},{name:"Kaito Kiyomiya",rank:64},
    {name:"Low Ki",rank:65},{name:"PAC",rank:66},{name:"Shingo Takagi",rank:67},
    {name:"Andrade",rank:68},{name:"Matt Riddle",rank:69},{name:"Sami Zayn",rank:70},
    {name:"PCO",rank:71},{name:"Big E",rank:72},{name:"Tomohiro Ishii",rank:73},
    {name:"Cesaro",rank:74},{name:"Matt Jackson",rank:75},{name:"Nick Jackson",rank:76},
    {name:"KUSHIDA",rank:77},{name:"Naomichi Marufuji",rank:78},{name:"Brody King",rank:79},
    {name:"Austin Theory",rank:80},{name:"Bandido",rank:81},{name:"Roderick Strong",rank:82},
    {name:"Chad Gable",rank:83},{name:"Kyle O'Reilly",rank:84},{name:"Sheamus",rank:85},
    {name:"Xavier Woods",rank:86},{name:"Drew Gulak",rank:87},{name:"Rich Swann",rank:88},
    {name:"Taichi",rank:89},{name:"Suwama",rank:90},{name:"Zeus",rank:91},
    {name:"Rowan",rank:92},{name:"Bobby Fish",rank:93},{name:"Tama Tonga",rank:94},
    {name:"Eddie Edwards",rank:95},{name:"Minoru Tanaka",rank:96},{name:"Tanga Loa",rank:97},
    {name:"Dash Wilder",rank:98},{name:"David Starr",rank:99},{name:"Zack Ryder",rank:100},
    {name:"Konosuke Takeshita",rank:101},{name:"Akira Tozawa",rank:102},
    {name:"Scott Dawson",rank:103},{name:"Taiji Ishimori",rank:104},
    {name:"Christopher Daniels",rank:105},{name:"Shuji Ishikawa",rank:106},
    {name:"Tyler Bate",rank:107},{name:"Jay Briscoe",rank:108},{name:"Kalisto",rank:109},
    {name:"Elias",rank:110},{name:"Trent Seven",rank:111},{name:"Mark Briscoe",rank:112},
    {name:"Frankie Kazarian",rank:113},{name:"Flip Gordon",rank:114},{name:"Ortiz",rank:115},
    {name:"Scorpio Sky",rank:116},{name:"Kenny King",rank:117},{name:"Volador Jr.",rank:118},
    {name:"Santana",rank:119},{name:"Colt Cabana",rank:120},{name:"Killer Kross",rank:121},
    {name:"Ryusuke Taguchi",rank:122},{name:"Ivar",rank:123},{name:"Tetsuya Endo",rank:124},
    {name:"Michael Elgin",rank:125},{name:"Moose",rank:126},{name:"Erik",rank:127},
    {name:"Curt Hawkins",rank:128},{name:"Daisuke Sekimoto",rank:129},
    {name:"Apollo Crews",rank:130},{name:"Austin Aries",rank:131},
    {name:"Yuji Okabayashi",rank:132},{name:"Ilja Dragunov",rank:133},
    {name:"Takashi Sugiura",rank:134},{name:"MJF",rank:135},{name:"Willie Mack",rank:136},
    {name:"Rush",rank:137},{name:"Travis Banks",rank:138},{name:"Bad Luck Fale",rank:139},
    {name:"P.J. Black",rank:140},{name:"HARASHIMA",rank:141},{name:"Sami Callihan",rank:142},
    {name:"Jinder Mahal",rank:143},{name:"Matt Hardy",rank:144},
    {name:"Vinny Marseglia",rank:145},{name:"El Barbaro Cavernario",rank:146},
    {name:"Primo Colon",rank:147},{name:"T.K. O'Ryan",rank:148},{name:"Eli Drake",rank:149},
    {name:"Hideki Suzuki",rank:150},{name:"Epico",rank:151},{name:"Tom Lawlor",rank:152},
    {name:"Anthony Henry",rank:153},{name:"Tracy Williams",rank:154},
    {name:"Mark Haskins",rank:155},{name:"Go Shiozaki",rank:156},{name:"Keith Lee",rank:157},
    {name:"Jake Crist",rank:158},{name:"Bobby Gunns",rank:159},{name:"Joey Janela",rank:160},
    {name:"Dalton Castle",rank:161},{name:"Dave Crist",rank:162},{name:"Bully Ray",rank:163},
    {name:"T-Hawk",rank:164},{name:"Joey Ryan",rank:165},{name:"Damian Priest",rank:166},
    {name:"Katsuhiko Nakajima",rank:167},{name:"Gran Metalik",rank:168},
    {name:"Bray Wyatt",rank:169},{name:"Lars Sullivan",rank:170},{name:"Joe Coffey",rank:171},
    {name:"Curtis Axel",rank:172},{name:"Madman Fulton",rank:173},
    {name:"Lince Dorado",rank:174},{name:"Eita",rank:175},{name:"Bo Dallas",rank:176},
    {name:"Luke Gallows",rank:177},{name:"Mark Coffey",rank:178},{name:"Otis",rank:179},
    {name:"L.A. Park",rank:180},{name:"Karl Anderson",rank:181},{name:"Mistico II",rank:182},
    {name:"Heath Slater",rank:183},{name:"Montez Ford",rank:184},{name:"Tucker",rank:185},
    {name:"Angelo Dawkins",rank:186},{name:"Oney Lorcan",rank:187},{name:"Aero Star",rank:188},
    {name:"Shane Thorne",rank:189},{name:"Mance Warner",rank:190},{name:"J.D. Drake",rank:191},
    {name:"Matt Sydal",rank:192},{name:"Danny Burch",rank:193},
    {name:"Shelton Benjamin",rank:194},{name:"Joe Doering",rank:195},
    {name:"Killian Dain",rank:196},{name:"SHO",rank:197},{name:"Noam Dar",rank:198},
    {name:"Laredo Kid",rank:199},{name:"Sin Cara",rank:200},{name:"Eric Young",rank:201},
    {name:"Luke Harper",rank:202},{name:"Wolfgang",rank:203},{name:"YOH",rank:204},
    {name:"James Drake",rank:205},{name:"Naoya Nomura",rank:206},{name:"Zack Gibson",rank:207},
    {name:"Cameron Grimes",rank:208},{name:"Masato Yoshino",rank:209},
    {name:"Josh Alexander",rank:210},{name:"Rezar",rank:211},{name:"Jax Dane",rank:212},
    {name:"Eddie Dennis",rank:213},{name:"Mike Bailey",rank:214},
    {name:"Alexander Wolfe",rank:215},{name:"Silas Young",rank:216},
    {name:"Ethan Page",rank:217},{name:"Mark Andrews",rank:218},{name:"Yuji Nagata",rank:219},
    {name:"Angelico",rank:220},{name:"Crimson",rank:221},{name:"Kzy",rank:222},
    {name:"Akam",rank:223},{name:"Orange Cassidy",rank:224},{name:"EC3",rank:225},
    {name:"R.J. City",rank:226},{name:"TJP",rank:227},{name:"Timothy Thatcher",rank:230},
    {name:"Trent Barreta",rank:231},{name:"Tyler Breeze",rank:232},
    {name:"Shawn Spears",rank:233},{name:"Daisuke Harada",rank:234},
    {name:"Fred Yehi",rank:237},{name:"Rocky Romero",rank:238},{name:"Jack Evans",rank:239},
    {name:"Chuck Taylor",rank:241},{name:"Drago",rank:242},{name:"Ace Austin",rank:243},
    {name:"Chase Owens",rank:244},{name:"Markus Burke",rank:245},
    {name:"Isaiah 'Swerve' Scott",rank:246},{name:"Kip Sabian",rank:247},
    {name:"Jack Gallagher",rank:249},{name:"YAMATO",rank:250},
    {name:"Jimmy Jacobs",rank:251},{name:"Shane Taylor",rank:253},
    {name:"Petey Williams",rank:254},{name:"Mojo Rawley",rank:256},{name:"CIMA",rank:257},
    {name:"Angel Garza",rank:258},{name:"Stu Grayson",rank:259},{name:"Lio Rush",rank:260},
    {name:"Rohit Raju",rank:261},{name:"Bronson Reed",rank:266},
    {name:"Robbie Eagles",rank:267},{name:"Evil Uno",rank:268},
    {name:"Davey Boy Smith Jr.",rank:269},{name:"Brian Kendrick",rank:272},
    {name:"Ben-K",rank:273},{name:"YOSHI-HASHI",rank:274},{name:"Homicide",rank:276},
    {name:"Toru Yano",rank:277},{name:"Jungle Boy",rank:280},{name:"Lance Archer",rank:282},
    {name:"Ariya Daivari",rank:283},{name:"Eddie Kingston",rank:286},
    {name:"Matt Angel",rank:288},{name:"Dominik Dijakovic",rank:290},
    {name:"Dr. Wagner Jr.",rank:293},{name:"Kassius Ohno",rank:295},
    {name:"No Way Jose",rank:327},{name:"TAJIRI",rank:328},
    {name:"Jake Atlas",rank:331},{name:"Rey Horus",rank:333},
    {name:"Shota Umino",rank:334},{name:"Beer City Bruiser",rank:336},
    {name:"Jake Lee",rank:339},{name:"Flamita",rank:341},{name:"Psycho Clown",rank:342},
    {name:"Susumu Yokosuka",rank:345},{name:"Niebla Roja",rank:346},
    {name:"Mikey Nicholls",rank:348},{name:"Dragon Kid",rank:351},
    {name:"El Hijo del Fantasma",rank:352},{name:"Jake Something",rank:353},
    {name:"Chris Brookes",rank:354},{name:"Jushin Thunder Liger",rank:357},
    {name:"Sonny Kiss",rank:358},{name:"Humberto Carrillo",rank:359},
    {name:"El Cuatrero",rank:362},{name:"Cody Deaner",rank:363},
    {name:"Jonathan Gresham",rank:368},{name:"Arik Cannon",rank:369},
    {name:"Alexander Hammerstone",rank:376},{name:"Sammy Guevara",rank:381},
    {name:"John Silver",rank:390},{name:"Alex Reynolds",rank:393},
    {name:"Darby Allin",rank:394},{name:"David Finlay",rank:399},
    {name:"Fallah Bahh",rank:402},{name:"Tommy Dreamer",rank:409},
    {name:"Brian Pillman Jr.",rank:411},{name:"Carlito",rank:412},
    {name:"Josh Briggs",rank:416},{name:"Chris Bey",rank:425},
    {name:"Luchasaurus",rank:434},{name:"Mansoor",rank:441},
    {name:"Ray Rosas",rank:447},{name:"Eli Everfly",rank:449},
    {name:"David Arquette",rank:453},{name:"Lee Moriarty",rank:460},
    {name:"Daniel Garcia",rank:473},{name:"Shane Mercer",rank:491},
    {name:"Corey Storm",rank:500},
    // Women's rankings 2019
    {name:"Becky Lynch",rank:1},{name:"Charlotte Flair",rank:2},{name:"Ronda Rousey",rank:3},
    {name:"Shayna Baszler",rank:4},{name:"Tessa Blanchard",rank:5},{name:"Bayley",rank:6},
    {name:"Natalya",rank:7},{name:"Io Shirai",rank:8},{name:"Mercedes Martinez",rank:9},
    {name:"Asuka",rank:11},{name:"Alexa Bliss",rank:12},{name:"Toni Storm",rank:13},
    {name:"Sasha Banks",rank:14},{name:"Taya Valkyrie",rank:15},{name:"Mayu Iwatani",rank:16},
    {name:"Allie",rank:17},{name:"Nikki Cross",rank:18},{name:"Allysin Kay",rank:19},
    {name:"Bea Priestley",rank:20},{name:"Rosemary",rank:21},{name:"Lacey Evans",rank:23},
    {name:"Carmella",rank:24},{name:"Mia Yim",rank:25},{name:"Jordynne Grace",rank:26},
    {name:"Ember Moon",rank:27},{name:"Kelly Klein",rank:29},{name:"Jessicka Havok",rank:30},
    {name:"Su Yung",rank:31},{name:"Britt Baker",rank:33},{name:"LuFisto",rank:34},
    {name:"Rhea Ripley",rank:35},{name:"Bianca Belair",rank:36},{name:"Shazza McKenzie",rank:38},
    {name:"Naomi",rank:41},{name:"Ruby Riott",rank:42},{name:"Riho",rank:43},
    {name:"Candice LeRae",rank:65},{name:"Nyla Rose",rank:66},{name:"Mandy Rose",rank:67},
    {name:"Liv Morgan",rank:70},{name:"Tam Nakano",rank:76},{name:"Shotzi Blackheart",rank:78},
    {name:"Deonna Purrazzo",rank:85},{name:"Thunder Rosa",rank:97},{name:"Kris Statlander",rank:100},
  ],
  2020: [
    {name:"Jon Moxley",rank:1},{name:"Adam Cole",rank:2},{name:"Chris Jericho",rank:3},
    {name:"Drew McIntyre",rank:4},{name:"Tetsuya Naito",rank:5},{name:"Kazuchika Okada",rank:6},
    {name:"Cody Rhodes",rank:7},{name:"Seth Rollins",rank:8},{name:"Kofi Kingston",rank:9},
    {name:"AJ Styles",rank:10},{name:"Keith Lee",rank:11},{name:"Brock Lesnar",rank:12},
    {name:"Kenny Omega",rank:13},{name:"Roman Reigns",rank:14},{name:"Nick Aldis",rank:15},
    {name:"Bray Wyatt",rank:16},{name:"Kota Ibushi",rank:17},{name:"Rush",rank:18},
    {name:"Braun Strowman",rank:19},{name:"Jacob Fatu",rank:20},{name:"Will Ospreay",rank:21},
    {name:"MJF",rank:22},{name:"Aleister Black",rank:23},{name:"Kento Miyahara",rank:24},
    {name:"WALTER",rank:25},{name:"Shinsuke Nakamura",rank:26},{name:"Andrade",rank:27},
    {name:"Jay White",rank:28},{name:"Roderick Strong",rank:29},{name:"Tommaso Ciampa",rank:30},
    {name:"PCO",rank:31},{name:"Daniel Bryan",rank:32},{name:"Adam Page",rank:33},
    {name:"Bandido",rank:34},{name:"Finn Balor",rank:35},{name:"Kaito Kiyomiya",rank:36},
    {name:"Kevin Owens",rank:37},{name:"Hiroshi Tanahashi",rank:38},{name:"PAC",rank:39},
    {name:"Hiromu Takahashi",rank:40},{name:"Baron Corbin",rank:41},{name:"Suwama",rank:42},
    {name:"Rey Mysterio",rank:43},{name:"Bobby Lashley",rank:44},{name:"Matt Taven",rank:45},
    {name:"Johnny Gargano",rank:46},{name:"Go Shiozaki",rank:47},{name:"Randy Orton",rank:48},
    {name:"Jonathan Gresham",rank:49},{name:"Ultimo Guerrero",rank:50},
    {name:"Brian Cage",rank:51},{name:"Fenix",rank:52},{name:"Shingo Takagi",rank:53},
    {name:"Zack Sabre Jr.",rank:54},{name:"Darby Allin",rank:55},{name:"Ricochet",rank:56},
    {name:"Sami Callihan",rank:57},{name:"KENTA",rank:58},{name:"Lance Archer",rank:59},
    {name:"Drew Gulak",rank:60},{name:"Sammy Guevara",rank:61},{name:"Takashi Sugiura",rank:62},
    {name:"A.J. Gray",rank:63},{name:"James Storm",rank:64},{name:"Shane Taylor",rank:65},
    {name:"Nick Gage",rank:67},{name:"Willie Mack",rank:68},{name:"Otis",rank:69},
    {name:"Jeff Cobb",rank:70},{name:"Tomohiro Ishii",rank:71},{name:"Cara Noir",rank:72},
    {name:"Matt Jackson",rank:73},{name:"Pentagon Jr.",rank:74},{name:"Nick Jackson",rank:75},
    {name:"Ryu Lee",rank:76},{name:"Effy",rank:77},{name:"Matt Riddle",rank:80},
    {name:"Pete Dunne",rank:81},{name:"Apollo Crews",rank:82},{name:"Tessa Blanchard",rank:83},
    {name:"Orange Cassidy",rank:84},{name:"SANADA",rank:85},{name:"Jay Lethal",rank:86},
    {name:"The Miz",rank:87},{name:"Marty Scurll",rank:88},{name:"Davey Boy Smith Jr.",rank:89},
    {name:"The Velveteen Dream",rank:90},{name:"Humberto Carrillo",rank:91},
    {name:"Ricky Starks",rank:92},{name:"Jungle Boy",rank:93},{name:"Ace Austin",rank:94},
    {name:"Dolph Ziggler",rank:95},{name:"Karrion Kross",rank:96},{name:"Scorpio Sky",rank:97},
    {name:"Alexander Hammerstone",rank:98},{name:"Lio Rush",rank:99},
    {name:"John Morrison",rank:100},{name:"Big E",rank:101},{name:"Tetsuya Endo",rank:102},
    {name:"Myron Reed",rank:103},{name:"Dominik Dijakovic",rank:104},
    {name:"Luchasaurus",rank:105},{name:"Warhorse",rank:106},{name:"Hirooki Goto",rank:107},
    {name:"Damian Priest",rank:108},{name:"Angel Garza",rank:109},
    {name:"Tom Lawlor",rank:111},{name:"Christopher Daniels",rank:112},
    {name:"Frankie Kazarian",rank:113},{name:"Murphy",rank:114},
    {name:"Colt Cabana",rank:115},{name:"Timothy Thatcher",rank:116},
    {name:"Jordan Devlin",rank:117},{name:"Masato Tanaka",rank:118},{name:"Taichi",rank:119},
    {name:"Eli Drake",rank:120},{name:"Kyle O'Reilly",rank:121},{name:"Bobby Fish",rank:122},
    {name:"Shorty G",rank:123},{name:"Eddie Dennis",rank:124},{name:"Ilja Dragunov",rank:125},
    {name:"Santana",rank:126},{name:"Cesaro",rank:127},{name:"Ortiz",rank:128},
    {name:"Daga",rank:129},{name:"Konosuke Takeshita",rank:130},{name:"EVIL",rank:131},
    {name:"Eddie Edwards",rank:132},{name:"Jake Lee",rank:133},
    {name:"Cameron Grimes",rank:134},{name:"Shuji Ishikawa",rank:135},
    {name:"Dustin Rhodes",rank:137},{name:"Joey Janela",rank:138},{name:"Niebla Roja",rank:139},
    {name:"Brian Pillman Jr.",rank:140},{name:"BUSHI",rank:141},
    {name:"Yuji Okabayashi",rank:142},{name:"Shawn Spears",rank:144},
    {name:"Tyler Bate",rank:145},{name:"L.A. Park",rank:146},
    {name:"Daisuke Sekimoto",rank:147},{name:"Moose",rank:148},
    {name:"Tama Tonga",rank:150},{name:"Tanga Loa",rank:151},{name:"Austin Theory",rank:152},
    {name:"Minoru Suzuki",rank:153},{name:"Montez Ford",rank:154},{name:"Elias",rank:155},
    {name:"Sami Zayn",rank:156},{name:"Angelo Dawkins",rank:157},{name:"Danhausen",rank:158},
    {name:"Kip Sabian",rank:162},{name:"Flip Gordon",rank:163},{name:"Sonny Kiss",rank:164},
    {name:"Dax Harwood",rank:165},{name:"Cash Wheeler",rank:166},{name:"KUSHIDA",rank:167},
    {name:"Xavier Woods",rank:168},{name:"Jake Atlas",rank:169},{name:"El Phantasmo",rank:170},
    {name:"Mance Warner",rank:172},{name:"Trish Adora",rank:173},{name:"Jake Hager",rank:176},
    {name:"Trent Seven",rank:177},{name:"Bobby Gunns",rank:178},{name:"Erik",rank:180},
    {name:"Ivar",rank:181},{name:"Jey Uso",rank:183},{name:"Jimmy Uso",rank:184},
    {name:"Marq Quen",rank:185},{name:"Ethan Page",rank:186},{name:"Isiah Kassidy",rank:187},
    {name:"A.R. Fox",rank:189},{name:"Naomichi Marufuji",rank:190},
    {name:"Isaiah 'Swerve' Scott",rank:191},{name:"Rob Van Dam",rank:192},
    {name:"Chris Dickinson",rank:193},{name:"Flamita",rank:194},
    {name:"Josh Alexander",rank:195},{name:"Brody King",rank:197},
    {name:"Richard Holliday",rank:198},{name:"Joe Gacy",rank:199},
    {name:"Juice Robinson",rank:201},{name:"Chris Bey",rank:202},
    {name:"Luke Gallows",rank:203},{name:"Karl Anderson",rank:204},
    {name:"Dexter Lumis",rank:205},{name:"Samoa Joe",rank:207},{name:"ACH",rank:208},
    {name:"Anthony Greene",rank:209},{name:"Jordan Oliver",rank:210},
    {name:"Robert Roode",rank:212},{name:"Eddie Kingston",rank:217},
    {name:"Dr. Wagner Jr.",rank:218},{name:"Homicide",rank:219},
    {name:"Jay Briscoe",rank:220},{name:"Alex Shelley",rank:221},
    {name:"Trent",rank:222},{name:"Chuck Taylor",rank:223},{name:"Mark Briscoe",rank:225},
    {name:"T-Hawk",rank:226},{name:"Alex Zayne",rank:227},{name:"Stu Grayson",rank:228},
    {name:"SHO",rank:229},{name:"Rich Swann",rank:230},{name:"Evil Uno",rank:232},
    {name:"David Finlay",rank:233},{name:"Bronson Reed",rank:236},
    {name:"Fabian Aichner",rank:238},{name:"CIMA",rank:239},{name:"Marcel Barthel",rank:240},
    {name:"Kenny King",rank:241},{name:"R-Truth",rank:243},{name:"Volador Jr.",rank:244},
    {name:"Zack Gibson",rank:245},{name:"James Drake",rank:247},{name:"Akam",rank:248},
    {name:"Rezar",rank:249},{name:"Rhino",rank:250},{name:"Mustafa Ali",rank:251},
    {name:"Eita",rank:252},{name:"Caristico",rank:253},{name:"Max The Impaler",rank:254},
    {name:"Matt Angel",rank:255},{name:"Mark Andrews",rank:256},
    {name:"Chris Brookes",rank:257},{name:"Flash Morgan Webster",rank:258},
    {name:"Ben-K",rank:259},{name:"Toru Yano",rank:260},{name:"Rhett Titus",rank:261},
    {name:"Wolfgang",rank:262},{name:"Will Hobbs",rank:263},{name:"Zeus",rank:270},
    {name:"Madman Fulton",rank:271},{name:"Leon Ruff",rank:272},{name:"TJP",rank:275},
    {name:"Ken Shamrock",rank:280},{name:"Cedric Alexander",rank:285},
    {name:"Dalton Castle",rank:289},{name:"Anthony Henry",rank:290},
    {name:"Oney Lorcan",rank:291},{name:"Danny Burch",rank:294},{name:"Mike Bailey",rank:295},
    {name:"El Hijo Del Vikingo",rank:300},{name:"John Silver",rank:306},
    {name:"Tracy Williams",rank:307},{name:"Alex Reynolds",rank:312},
    {name:"The Blade",rank:313},{name:"The Butcher",rank:315},{name:"Angelico",rank:316},
    {name:"Titan",rank:317},{name:"Shane Mercer",rank:321},
    {name:"Matthew Justice",rank:325},{name:"Wardlow",rank:397},
    {name:"Ricky Morton",rank:399},{name:"Noam Dar",rank:400},
    {name:"Daniel Garcia",rank:450},{name:"Fred Yehi",rank:452},
    {name:"Raul Mendoza",rank:460},{name:"Preston Vance",rank:461},
    {name:"Anthony Bowens",rank:466},{name:"Q.T. Marshall",rank:468},
    {name:"Matt Sydal",rank:469},{name:"Logan Creed",rank:470},
    {name:"P.J. Black",rank:472},{name:"Akira Tozawa",rank:475},
    // Women's rankings 2020
    {name:"Bayley",rank:1},{name:"Becky Lynch",rank:2},{name:"Asuka",rank:3},
    {name:"Charlotte Flair",rank:4},{name:"Sasha Banks",rank:5},{name:"Hikaru Shida",rank:6},
    {name:"Tessa Blanchard",rank:7},{name:"Riho",rank:8},{name:"Io Shirai",rank:9},
    {name:"Mayu Iwatani",rank:10},{name:"Rhea Ripley",rank:11},{name:"Jordynne Grace",rank:12},
    {name:"Shayna Baszler",rank:13},{name:"Thunder Rosa",rank:14},{name:"Kimber Lee",rank:15},
    {name:"Nyla Rose",rank:16},{name:"Taya Valkyrie",rank:17},{name:"Kay Lee Ray",rank:18},
    {name:"Kylie Rae",rank:19},{name:"Nikki Cross",rank:20},{name:"Kairi Sane",rank:21},
    {name:"Britt Baker",rank:22},{name:"Bianca Belair",rank:23},{name:"Dakota Kai",rank:24},
    {name:"Allysin Kay",rank:25},{name:"Tegan Nox",rank:26},{name:"Alexa Bliss",rank:27},
    {name:"Mercedes Martinez",rank:29},{name:"Deonna Purrazzo",rank:30},
    {name:"Ivelisse",rank:31},{name:"Kris Statlander",rank:32},{name:"Jessicka Havok",rank:33},
    {name:"Candice LeRae",rank:34},{name:"LuFisto",rank:35},{name:"Mia Yim",rank:36},
    {name:"Big Swole",rank:39},{name:"Rosemary",rank:42},{name:"Lacey Evans",rank:43},
    {name:"Su Yung",rank:44},{name:"Toni Storm",rank:45},{name:"Shotzi Blackheart",rank:46},
    {name:"Jamie Hayter",rank:47},{name:"Penelope Ford",rank:48},{name:"Laynie Luck",rank:50},
    {name:"Giulia",rank:54},{name:"Sonya Deville",rank:56},{name:"Billie Kay",rank:59},
    {name:"Kiera Hogan",rank:60},{name:"Charli Evans",rank:61},{name:"Naomi",rank:63},
    {name:"Nia Jax",rank:69},{name:"Leyla Hirsch",rank:70},{name:"Hyan",rank:71},
    {name:"Trish Adora",rank:86},{name:"Dani Luna",rank:87},{name:"Killer Kelly",rank:89},
    {name:"Jessica Troy",rank:91},{name:"Willow Nightingale",rank:94},{name:"Heather Monroe",rank:97},
    {name:"Max The Impaler",rank:100},
    {name:"John Campbell",rank:498},{name:"Dan The Dad",rank:500},
  ],
  2017: [
    {name:"Aleister Black",rank:102},{name:"Heath Slater",rank:107},{name:"Noam Dar",rank:108},
    {name:"Kalisto",rank:113},{name:"Tye Dillinger",rank:114},{name:"Ryback",rank:128},
    {name:"Apollo Crews",rank:130},{name:"Akira Tozawa",rank:131},{name:"Tama Tonga",rank:132},
    {name:"Joey Ryan",rank:141},{name:"Jack Gallagher",rank:145},{name:"Mike Bennett",rank:154},
    {name:"Hideo Itami",rank:156},{name:"Zack Ryder",rank:173},{name:"Zeus",rank:174},
    {name:"Ariya Daivari",rank:201},{name:"Primo Colon",rank:205},{name:"Drew Gulak",rank:207},
    {name:"Erick Rowan",rank:218},{name:"Juice Robinson",rank:219},{name:"Akam",rank:220},
    {name:"Shane Strickland",rank:227},{name:"Lince Dorado",rank:233},{name:"Joe Gacy",rank:234},
    {name:"Frightmare",rank:294},{name:"Matt Angel",rank:295},{name:"Curtis Axel",rank:300},
    {name:"P.J. Black",rank:321},{name:"The Velveteen Dream",rank:324},
    {name:"No Way Jose",rank:330},{name:"Otis Dozovic",rank:395},{name:"Super Tiger",rank:400},
    // Women's rankings 2017
    {name:"Asuka",rank:1},{name:"Charlotte",rank:2},{name:"Alexa Bliss",rank:3},
    {name:"Sasha Banks",rank:4},{name:"Bayley",rank:5},{name:"Io Shirai",rank:6},
    {name:"Natalya",rank:7},{name:"Sienna",rank:8},{name:"Naomi",rank:9},
    {name:"Kairi Sane",rank:10},{name:"Mercedes Martinez",rank:11},{name:"Shayna Baszler",rank:12},
    {name:"Rosemary",rank:13},{name:"LuFisto",rank:14},{name:"Mayu Iwatani",rank:15},
    {name:"Mia Yim",rank:16},{name:"Allie",rank:17},{name:"Ember Moon",rank:18},
    {name:"Becky Lynch",rank:19},{name:"Nia Jax",rank:22},{name:"Candice LeRae",rank:23},
    {name:"Toni Storm",rank:24},{name:"Chelsea Green",rank:26},{name:"Kay Lee Ray",rank:29},
    {name:"Mickie James",rank:30},{name:"Dakota Kai",rank:31},{name:"Deonna Purrazzo",rank:34},
    {name:"Carmella",rank:38},{name:"Nikki Cross",rank:40},{name:"Tessa Blanchard",rank:43},
    {name:"Shotzi Blackheart",rank:46},{name:"Jazzy Gabert",rank:48},{name:"Marti Belle",rank:49},
  ],
  2022: [
    {name:"Roman Reigns",rank:1},{name:"Kazuchika Okada",rank:2},{name:"CM Punk",rank:3},
    {name:"Adam Page",rank:4},{name:"Bobby Lashley",rank:5},{name:"Cody Rhodes",rank:6},
    {name:"Bryan Danielson",rank:7},{name:"El Hijo Del Vikingo",rank:8},{name:"Big E",rank:9},
    {name:"Jonathan Gresham",rank:10},{name:"Shingo Takagi",rank:11},{name:"Jon Moxley",rank:12},
    {name:"Matt Cardona",rank:13},{name:"Josh Alexander",rank:14},{name:"Hiroshi Tanahashi",rank:15},
    {name:"MJF",rank:16},{name:"Seth Rollins",rank:17},{name:"Adam Cole",rank:18},
    {name:"Kenny Omega",rank:19},{name:"Drew McIntyre",rank:20},{name:"Moose",rank:21},
    {name:"Chris Jericho",rank:22},{name:"Jay White",rank:23},{name:"Alexander Hammerstone",rank:24},
    {name:"A.C. Mack",rank:25},{name:"Bron Breakker",rank:26},{name:"Will Ospreay",rank:27},
    {name:"Sammy Guevara",rank:28},{name:"Zack Sabre Jr.",rank:29},{name:"Mike Bailey",rank:30},
    {name:"Bandido",rank:31},{name:"Katsuhiko Nakajima",rank:32},{name:"Ace Austin",rank:33},
    {name:"Jake Lee",rank:34},{name:"Hechicero",rank:35},{name:"Kevin Owens",rank:36},
    {name:"Xavier Woods",rank:37},{name:"Scorpio Sky",rank:38},{name:"El Desperado",rank:39},
    {name:"Eddie Kingston",rank:40},{name:"Psycho Clown",rank:41},{name:"Jacob Fatu",rank:42},
    {name:"Wheeler YUTA",rank:43},{name:"Minoru Suzuki",rank:44},{name:"Darby Allin",rank:45},
    {name:"Shinsuke Nakamura",rank:46},{name:"Randy Orton",rank:47},{name:"Daniel Garcia",rank:48},
    {name:"Trey Miguel",rank:49},{name:"Trish Adora",rank:50},{name:"KAI",rank:51},
    {name:"Kento Miyahara",rank:52},{name:"Ricky Starks",rank:53},{name:"Ricochet",rank:54},
    {name:"Rey Fenix",rank:55},{name:"PAC",rank:56},{name:"Damian Priest",rank:57},
    {name:"Kota Ibushi",rank:58},{name:"Konosuke Takeshita",rank:59},{name:"Nick Aldis",rank:60},
    {name:"Go Shiozaki",rank:61},{name:"Tetsuya Naito",rank:62},{name:"Finn Balor",rank:63},
    {name:"Tommaso Ciampa",rank:64},{name:"Edge",rank:65},{name:"Laredo Kid",rank:66},
    {name:"Wardlow",rank:67},{name:"Mistico",rank:68},{name:"Tom Lawlor",rank:69},
    {name:"Alex Shelley",rank:70},{name:"Andrade El Idolo",rank:71},{name:"Ilja Dragunov",rank:72},
    {name:"Malakai Black",rank:73},{name:"AJ Styles",rank:74},{name:"Trevor Murdoch",rank:75},
    {name:"Tomohiro Ishii",rank:76},{name:"Carmelo Hayes",rank:77},{name:"Ultimo Guerrero",rank:78},
    {name:"Tetsuya Endo",rank:79},{name:"Keith Lee",rank:80},{name:"Christian Cage",rank:81},
    {name:"Swerve Strickland",rank:82},{name:"Taiji Ishimori",rank:83},{name:"Sami Zayn",rank:84},
    {name:"Kofi Kingston",rank:85},{name:"Alex Kane",rank:86},{name:"Axel Tischer",rank:87},
    {name:"Titan",rank:88},{name:"Riddle",rank:89},{name:"Jungle Boy",rank:90},
    {name:"Gunther",rank:91},{name:"Hiromu Takahashi",rank:92},{name:"Pentagon Jr.",rank:93},
    {name:"Yuma Aoyagi",rank:94},{name:"Effy",rank:95},{name:"Theory",rank:96},
    {name:"Jordynne Grace",rank:97},{name:"Satoshi Kojima",rank:98},{name:"Ninja Mack",rank:99},
    {name:"Kyle O'Reilly",rank:100},{name:"Dax Harwood",rank:101},{name:"Myron Reed",rank:102},
    {name:"Powerhouse Hobbs",rank:103},{name:"Adam Brooks",rank:104},{name:"Homicide",rank:105},
    {name:"Michael Oku",rank:106},{name:"YAMATO",rank:107},{name:"Richard Holliday",rank:108},
    {name:"Volador Jr.",rank:109},{name:"Masha Slamovich",rank:110},{name:"Allie Katch",rank:111},
    {name:"Nick Gage",rank:112},{name:"Angel de Oro",rank:113},{name:"Orange Cassidy",rank:114},
    {name:"EVIL",rank:115},{name:"Niebla Roja",rank:116},{name:"Kazuyuki Fujita",rank:117},
    {name:"Kenoh",rank:118},{name:"Yuji Okabayashi",rank:119},{name:"Omos",rank:120},
    {name:"Naomichi Marufuji",rank:121},{name:"Euforia",rank:122},{name:"Cameron Grimes",rank:123},
    {name:"HOOK",rank:124},{name:"Suwama",rank:125},{name:"Sheamus",rank:126},
    {name:"Dante Martin",rank:127},{name:"Eddie Edwards",rank:128},{name:"Takashi Sugiura",rank:129},
    {name:"Eita",rank:130},{name:"El Lindaman",rank:131},{name:"JONAH",rank:132},
    {name:"Chris Bey",rank:133},{name:"Happy Corbin",rank:134},{name:"Dragon Lee",rank:135},
    {name:"KENTA",rank:136},{name:"Santos Escobar",rank:137},{name:"Calvin Tankman",rank:138},
    {name:"Jey Uso",rank:139},{name:"TJP",rank:140},{name:"Mark Haskins",rank:141},
    {name:"Masato Tanaka",rank:142},{name:"Tony Deppen",rank:143},{name:"Davey Richards",rank:144},
    {name:"SB KENTo",rank:145},{name:"Rush",rank:146},{name:"Jimmy Uso",rank:147},
    {name:"Rich Swann",rank:148},{name:"Darius Carter",rank:149},{name:"The Miz",rank:150},
    {name:"Fred Rosser",rank:151},{name:"Hayato Tamura",rank:152},{name:"Roderick Strong",rank:153},
    {name:"Chris Brookes",rank:154},{name:"Jay Lethal",rank:155},{name:"Kzy",rank:156},
    {name:"Lance Archer",rank:157},{name:"Josh Woods",rank:158},{name:"Alec Price",rank:159},
    {name:"Jeff Hardy",rank:160},{name:"Killer Kross",rank:161},{name:"Mads Krugger",rank:162},
    {name:"Tristan Archer",rank:163},{name:"Black Taurus",rank:164},{name:"Atsushi Kotoge",rank:165},
    {name:"Cara Noir",rank:166},{name:"Ethan Page",rank:167},{name:"Yasufumi Nakanoue",rank:168},
    {name:"Jeff Cobb",rank:169},{name:"SHO",rank:170},{name:"Max Caster",rank:171},
    {name:"W. Morrissey",rank:172},{name:"Sting",rank:173},{name:"Rey Mysterio",rank:174},
    {name:"Noam Dar",rank:175},{name:"Keiji Muto",rank:176},{name:"YOH",rank:177},
    {name:"Tama Tonga",rank:178},{name:"Kaito Kiyomiya",rank:179},{name:"Matt Hardy",rank:180},
    {name:"Ricky Knight Jr.",rank:181},{name:"Tony D'Angelo",rank:182},{name:"Nick Jackson",rank:183},
    {name:"Matt Jackson",rank:184},{name:"John Hennigan",rank:185},{name:"Erica Leigh",rank:186},
    {name:"Robbie Eagles",rank:187},{name:"Anthony Bowens",rank:188},{name:"SANADA",rank:189},
    {name:"Brody King",rank:190},{name:"Cesaro",rank:191},{name:"Jordan Blade",rank:192},
    {name:"Shawn Spears",rank:193},{name:"Great O-Khan",rank:194},{name:"Dexter Lumis",rank:195},
    {name:"Mark Briscoe",rank:196},{name:"Jay Briscoe",rank:197},{name:"Kez Evans",rank:198},
    {name:"Pagano",rank:199},{name:"Bobby Fish",rank:200},{name:"T-Hawk",rank:201},
    {name:"Chris Sabin",rank:202},{name:"The Dark Sheik",rank:203},{name:"Luchasaurus",rank:204},
    {name:"Taichi",rank:205},{name:"Joe Gacy",rank:206},{name:"Jah-C",rank:207},
    {name:"Willow Nightingale",rank:208},{name:"Dragon Dia",rank:209},{name:"Hirooki Goto",rank:210},
    {name:"Alex Colon",rank:211},{name:"Nick Wayne",rank:212},{name:"Joel Bateman",rank:213},
    {name:"Shun Skywalker",rank:214},{name:"Drew Parker",rank:215},{name:"Buddy Matthews",rank:216},
    {name:"Juice Robinson",rank:217},{name:"Dralistico",rank:218},{name:"ACH",rank:219},
    {name:"Luke Jacobs",rank:220},{name:"YOSHI-HASHI",rank:221},{name:"Blake Christian",rank:222},
    {name:"Masakatsu Funaki",rank:223},{name:"Rick Boogs",rank:224},{name:"David Finlay",rank:225},
    {name:"Colby Corino",rank:226},{name:"Templario",rank:227},{name:"John Silver",rank:228},
    {name:"Max The Impaler",rank:229},{name:"Matt Angel",rank:230},{name:"King Muertes",rank:231},
    {name:"Izanagi",rank:232},{name:"Anthony Ogogo",rank:233},{name:"Eric Young",rank:234},
    {name:"Sam Adonis",rank:235},{name:"Parrow",rank:236},{name:"Matt Hayter",rank:237},
    {name:"Santana",rank:238},{name:"Rocky Romero",rank:239},{name:"Rohit Raju",rank:240},
    {name:"Chad Gable",rank:241},{name:"Miro",rank:242},{name:"El Phantasmo",rank:243},
    {name:"Madcap Moss",rank:244},{name:"PCO",rank:245},{name:"Soberano Jr.",rank:246},
    {name:"Otis",rank:247},{name:"Jun Kasai",rank:248},{name:"Ortiz",rank:249},
    {name:"Brian Cage",rank:250},{name:"Bryan Keith",rank:251},{name:"Jurn Simmons",rank:252},
    {name:"HAYATA",rank:253},{name:"Killian McMurphy",rank:254},{name:"Dan Moloney",rank:255},
    {name:"Gran Guerrero",rank:256},{name:"Willie Mack",rank:257},{name:"Masaaki Mochizuki",rank:258},
    {name:"Dalton Castle",rank:259},{name:"Joey Janela",rank:260},{name:"Clark Connors",rank:261},
    {name:"Senza Volto",rank:262},{name:"Billie Starkz",rank:263},{name:"L.A. Park",rank:265},
    {name:"Octagon Jr.",rank:266},{name:"Mysterious Q",rank:267},{name:"Steve Maclin",rank:268},
    {name:"Warhorse",rank:269},{name:"Trent",rank:270},{name:"Jake Something",rank:271},
    {name:"KUSHIDA",rank:272},{name:"Diamante",rank:273},{name:"K.C. Navarro",rank:274},
    {name:"Marko Estrada",rank:275},{name:"Sonny Kiss",rank:276},{name:"Alex Reynolds",rank:277},
    {name:"Flamita",rank:278},{name:"Atticus Cogar",rank:279},{name:"David Ali",rank:280},
    {name:"Shane Taylor",rank:281},{name:"Chris Adonis",rank:282},{name:"Shigehiro Irie",rank:283},
    {name:"Billy Dixon",rank:284},{name:"Dolph Ziggler",rank:285},{name:"Arik Royal",rank:286},
    {name:"Atlantis Jr.",rank:287},{name:"Butch",rank:288},{name:"Kevin Blackwood",rank:289},
    {name:"Kennedi Copeland",rank:290},{name:"Ridge Holland",rank:291},
    {name:"Dominik Mysterio",rank:292},{name:"Daisuke Harada",rank:293},{name:"Xavant",rank:294},
    {name:"Cinta de Oro",rank:295},{name:"Kevin Ku",rank:296},{name:"John Hawking",rank:297},
    {name:"Bhupinder Gujjar",rank:298},{name:"Keita Murray",rank:299},{name:"Alex Zayne",rank:300},
    {name:"Jake Hager",rank:301},{name:"DMT Azul",rank:302},{name:"Chris Ridgeway",rank:303},
    {name:"Joe Black",rank:304},{name:"Rey Escorpion",rank:305},{name:"Mike Bennett",rank:306},
    {name:"Manny Ferno",rank:307},{name:"Rey Horus",rank:308},{name:"MAO",rank:309},
    {name:"Max Dupri",rank:310},{name:"GPA",rank:311},{name:"Tanga Loa",rank:312},
    {name:"Rina Yamashita",rank:313},{name:"Brian Myers",rank:314},{name:"Royce Isaacs",rank:315},
    {name:"Dominic Garrini",rank:316},{name:"Hoodfoot",rank:317},{name:"Shawn Dean",rank:318},
    {name:"Karl Anderson",rank:319},{name:"Cole Radrick",rank:320},{name:"Kidd Bandit",rank:321},
    {name:"Karl Fredericks",rank:322},{name:"Grayson Waller",rank:323},{name:"Yuya Uemura",rank:324},
    {name:"Joe Doering",rank:325},{name:"Kenny King",rank:326},{name:"Joey Ace",rank:327},
    {name:"Deaner",rank:328},{name:"Alex Coughlin",rank:329},{name:"TAJIRI",rank:330},
    {name:"Danhausen",rank:331},{name:"Titus Alexander",rank:332},{name:"Omar Amir",rank:333},
    {name:"Jordan Oliver",rank:334},{name:"Jake Crist",rank:335},{name:"Shota Umino",rank:336},
    {name:"Jeremy Prophet",rank:337},{name:"Doc Gallows",rank:338},{name:"Chicano",rank:339},
    {name:"Charli Evans",rank:340},{name:"Eel O'Neal",rank:341},{name:"EC3",rank:342},
    {name:"Savio Vega",rank:343},{name:"Mike Outlaw",rank:344},{name:"Dr. Wagner Jr.",rank:345},
    {name:"SUGI",rank:346},{name:"Christopher Andino",rank:347},{name:"El Terrible",rank:348},
    {name:"Puma King",rank:349},{name:"HIKULEO",rank:350},{name:"Fred Yehi",rank:351},
    {name:"Tyrus",rank:352},{name:"Brian Pillman Jr.",rank:353},{name:"Charles Crowley",rank:354},
    {name:"Suge D.",rank:355},{name:"Davienne",rank:356},{name:"Session Moth Martina",rank:357},
    {name:"1 Called Manders",rank:358},{name:"Vinnie Massaro",rank:359},{name:"Kenzie Paige",rank:360},
    {name:"Anthony Henry",rank:361},{name:"Don't Die Miles",rank:362},{name:"Slade",rank:363},
    {name:"Edith Surreal",rank:364},{name:"Mance Warner",rank:365},{name:"Robert Dreissker",rank:366},
    {name:"Veny",rank:367},{name:"Angelo Parker",rank:368},{name:"Matt Menard",rank:369},
    {name:"Shuji Ishikawa",rank:370},{name:"Adam Priest",rank:371},{name:"Kasey Catal",rank:372},
    {name:"Peter Tihanyi",rank:373},{name:"Danny Limelight",rank:374},{name:"Matthew Justice",rank:375},
    {name:"Sami Callihan",rank:376},{name:"Aaron Henare",rank:377},{name:"J.D. Drake",rank:378},
    {name:"Rhio",rank:379},{name:"Rhett Titus",rank:380},{name:"Juicy Finau",rank:381},
    {name:"Brian Johnson",rank:382},{name:"Blue Demon Jr.",rank:383},{name:"Mickie Knuckles",rank:384},
    {name:"MV Young",rank:385},{name:"Laynie Luck",rank:386},{name:"P.J. Hawx",rank:387},
    {name:"Mahabali Shera",rank:388},{name:"Carlie Bravo",rank:389},{name:"LuFisto",rank:390},
    {name:"Vincent",rank:391},{name:"Eric Ryan",rank:392},{name:"Tracy Williams",rank:393},
    {name:"Saki Akai",rank:394},{name:"Daz Black",rank:395},{name:"Brandon Kirk",rank:396},
    {name:"Luke Hawx",rank:397},{name:"Tre Lamar",rank:398},{name:"Mitch Waterman",rank:399},
    {name:"Matt Taven",rank:400},{name:"Solo Sikoa",rank:401},{name:"Ricky Morton",rank:402},
    {name:"Travis Williams",rank:403},{name:"Carlos Zamora",rank:404},{name:"Mick Moretti",rank:405},
    {name:"Ashton Starr",rank:406},{name:"Ryusuke Taguchi",rank:407},{name:"Tiger Mask IV",rank:408},
    {name:"PB Smooth",rank:409},{name:"Man Like DeReiss",rank:410},{name:"Becca",rank:411},
    {name:"Yoshinari Ogawa",rank:412},{name:"Arez",rank:413},{name:"JTG",rank:414},
    {name:"Jimmy Lloyd",rank:415},{name:"El Cuatrero",rank:416},{name:"Jordan Cruz",rank:417},
    {name:"Kylie Rae",rank:418},{name:"Maggot",rank:419},{name:"Shotaro Ashino",rank:420},
    {name:"Jaden Newman",rank:421},{name:"Rebel Kel",rank:422},{name:"Apollo Crews",rank:423},
    {name:"Thomas Dubois",rank:424},{name:"Storm Grayson",rank:425},{name:"Kevin Blanchard",rank:426},
    {name:"Ju Dizz",rank:427},{name:"Mathieu St. Jacques",rank:428},{name:"AKIRA",rank:429},
    {name:"Baliyan Akki",rank:430},{name:"Matt Makowski",rank:431},{name:"Aero Boy",rank:432},
    {name:"Isaiah Broner",rank:433},{name:"Jessie Godderz",rank:434},{name:"Junior Benito",rank:435},
    {name:"Master Wato",rank:436},{name:"O'Shay Edwards",rank:437},{name:"Ziggy Haim",rank:438},
    {name:"Von Wagner",rank:439},{name:"Q.T. Marshall",rank:440},{name:"Zak Patterson",rank:441},
    {name:"Shazza McKenzie",rank:442},{name:"Doug Williams",rank:443},{name:"Gringo Loco",rank:444},
    {name:"Daniel Makabe",rank:445},{name:"Julian Ward",rank:446},{name:"Charles Mason",rank:447},
    {name:"Kerry Morton",rank:448},{name:"Super Crazy",rank:449},{name:"Derek Dillinger",rank:450},
    {name:"Fast Time Moodo",rank:451},{name:"Ken Dixon",rank:452},{name:"V.S.K.",rank:453},
    {name:"The Blade",rank:454},{name:"Jai Vidal",rank:455},{name:"Leyton Buzzard",rank:456},
    {name:"Dragon Rojo Jr.",rank:457},{name:"The Butcher",rank:458},{name:"Lyrebird Luchi",rank:459},
    {name:"Jack Cartwheel",rank:460},{name:"Marcus Mathers",rank:461},{name:"Darius Lockhart",rank:462},
    {name:"Victor Benjamin",rank:463},{name:"Matt Cross",rank:464},{name:"Ultimo Dragon",rank:465},
    {name:"Merrik Donovan",rank:466},{name:"Anthony Greene",rank:467},{name:"J.R. Kratos",rank:468},
    {name:"Heavy Metal",rank:469},{name:"Sawyer Wreck",rank:470},{name:"Ariya Daivari",rank:471},
    {name:"Toru Yano",rank:472},{name:"Kaun",rank:473},{name:"Nino Hamburguesa",rank:474},
    {name:"Tommy Vendetta",rank:475},{name:"Gene Munny",rank:476},{name:"Ron Hunt",rank:477},
    {name:"Angelo Dawkins",rank:478},{name:"Mr. Grim",rank:479},{name:"Mike Jackson",rank:480},
    {name:"Evil Uno",rank:481},{name:"Robert Martyr",rank:482},{name:"Aramis",rank:483},
    {name:"J-BOUJII",rank:485},{name:"Moses",rank:486},{name:"Jax Dane",rank:487},
    {name:"Aiden VE",rank:488},{name:"Isiah Kassidy",rank:489},{name:"Reggie",rank:490},
    {name:"Bear Bronson",rank:491},{name:"Joseline Navarro",rank:492},{name:"Sonico",rank:493},
    {name:"Baron Black",rank:494},{name:"Big Game Leroy",rank:495},{name:"Myles Millennium",rank:496},
    {name:"Josh Fuller",rank:497},{name:"Robb Radke",rank:498},{name:"Stan Stylez",rank:499},
    {name:"Dustin Wilson",rank:500},
  ],
  2021: [
    {name:"Kenny Omega",rank:1},{name:"Roman Reigns",rank:2},{name:"Bobby Lashley",rank:3},
    {name:"Drew McIntyre",rank:4},{name:"Kota Ibushi",rank:5},{name:"Jon Moxley",rank:6},
    {name:"Finn Balor",rank:8},{name:"Rich Swann",rank:10},{name:"Cody Rhodes",rank:11},
    {name:"Randy Orton",rank:12},{name:"Big E",rank:13},{name:"Darby Allin",rank:14},
    {name:"Karrion Kross",rank:16},{name:"Chris Jericho",rank:19},{name:"Jonathan Gresham",rank:20},
    {name:"Jacob Fatu",rank:21},{name:"Keith Lee",rank:24},{name:"MJF",rank:26},
    {name:"Cesaro",rank:32},{name:"PAC",rank:33},{name:"Adam Page",rank:34},
    {name:"Daniel Bryan",rank:36},{name:"Adam Cole",rank:37},{name:"Miro",rank:38},
    {name:"Jay White",rank:39},{name:"Moose",rank:40},{name:"Dragon Lee",rank:41},
    {name:"Johnny Gargano",rank:43},{name:"Trish Adora",rank:44},{name:"Jey Uso",rank:45},
    {name:"Jake Lee",rank:46},{name:"Lee Moriarty",rank:47},{name:"Seth Rollins",rank:48},
    {name:"Lio Rush",rank:53},{name:"Alexander Hammerstone",rank:54},{name:"Rey Fenix",rank:55},
    {name:"Sheamus",rank:56},{name:"Nick Gage",rank:61},{name:"Kevin Owens",rank:63},
    {name:"Apollo Crews",rank:65},{name:"Sammy Guevara",rank:66},{name:"Jungle Boy",rank:69},
    {name:"Kofi Kingston",rank:70},{name:"SANDA",rank:71},{name:"Brunson Reed",rank:73},
    {name:"Bray Wyatt",rank:74},{name:"Riddle",rank:76},{name:"Eric Young",rank:77},
    {name:"Sami Zayn",rank:80},{name:"Santos Escobar",rank:81},{name:"Shinsuke Nakamura",rank:82},
    {name:"Brian Cage",rank:83},{name:"Myron Reed",rank:84},{name:"Damian Priest",rank:85},
    {name:"Eddie Edwards",rank:86},{name:"Minoru Suzuki",rank:87},{name:"Aron Stevens",rank:88},
    {name:"The Miz",rank:89},{name:"Tracy Williams",rank:90},{name:"TJP",rank:91},
    {name:"Powerhouse Hobbs",rank:93},{name:"Chris Bey",rank:94},{name:"Effy",rank:95},
    {name:"Wheeler YUTA",rank:96},{name:"Warhorse",rank:97},{name:"Da Pope",rank:98},
    {name:"Black Taurus",rank:99},{name:"Pete Dunne",rank:100},{name:"Zack Sabre Jr.",rank:101},
    {name:"Rey Mysterio",rank:103},{name:"Lance Archer",rank:104},{name:"Jeff Hardy",rank:105},
    {name:"Joey Janela",rank:106},{name:"Josh Alexander",rank:107},{name:"Brody King",rank:108},
    {name:"Jay Lethal",rank:110},{name:"Allie Katch",rank:111},{name:"Richard Holliday",rank:112},
    {name:"Scorpio Sky",rank:113},{name:"Sami Callihan",rank:114},{name:"Pentagon Jr.",rank:115},
    {name:"Matt Jackson",rank:116},{name:"Nick Jackson",rank:117},{name:"A-Kid",rank:118},
    {name:"Josh Woods",rank:121},{name:"Ricky Starks",rank:122},{name:"Ethan Page",rank:123},
    {name:"Tommaso Ciampa",rank:126},{name:"Bandido",rank:127},{name:"Mustafa Ali",rank:128},
    {name:"Q.T. Marshall",rank:129},{name:"Kyz",rank:130},{name:"Jay Briscoe",rank:131},
    {name:"KUSHIDA",rank:132},{name:"Xavier Woods",rank:133},{name:"Brian Pillman Jr.",rank:135},
    {name:"Shane Taylor",rank:138},{name:"Jeff Cobb",rank:139},{name:"Montez Ford",rank:140},
    {name:"EC3",rank:141},{name:"Dexter Lumis",rank:142},{name:"Cara Noir",rank:144},
    {name:"Ricochet",rank:145},{name:"Mance Warner",rank:146},{name:"Dominik Mysterio",rank:147},
    {name:"Tetsuya Endo",rank:148},{name:"Jake Something",rank:149},{name:"Cameron Grimes",rank:150},
    {name:"Otis",rank:151},{name:"Angelo Dawkins",rank:152},{name:"Cedric Alexander",rank:153},
    {name:"Karl Anderson",rank:159},{name:"Logan Creed",rank:167},{name:"Willie Mack",rank:168},
    {name:"Frankie Kazarian",rank:169},{name:"Shelton Benjamin",rank:170},
    {name:"Danhausen",rank:171},{name:"Ilja Dragunov",rank:175},{name:"Andrade El Idolo",rank:176},
    {name:"Flamita",rank:177},{name:"Doc Gallows",rank:178},{name:"Jordynne Grace",rank:179},
    {name:"Mansoor",rank:181},{name:"Luke Jacobs",rank:182},{name:"Ortiz",rank:186},
    {name:"Santana",rank:187},{name:"Evil Uno",rank:188},{name:"Billy Dixon",rank:189},
    {name:"Chessman",rank:190},{name:"Sanson",rank:200},{name:"Timothy Thatcher",rank:202},
    {name:"R-Truth",rank:203},{name:"Ethan Allen",rank:206},{name:"T-BAR",rank:207},
    {name:"Adam Brooks",rank:210},{name:"MACE",rank:211},{name:"Psycho Clown",rank:212},
    {name:"Alex Colon",rank:214},{name:"Elias",rank:217},{name:"Wardlow",rank:218},
    {name:"Bobby Gunns",rank:223},{name:"Chris Brooks",rank:224},{name:"El Cuatrero",rank:225},
    {name:"Brian Johnson",rank:226},{name:"Chase Holliday",rank:227},{name:"Yuma Aoyagi",rank:228},
    {name:"Laynie Luck",rank:230},{name:"El Phantasmo",rank:232},{name:"Daniel Garcia",rank:233},
    {name:"Killian McMurphy",rank:235},{name:"Fred Rosser",rank:236},{name:"Matt Hardy",rank:238},
    {name:"Mil Muertes",rank:239},{name:"Flip Gordon",rank:246},{name:"Dax Hardwood",rank:254},
    {name:"Sonny Kiss",rank:261},{name:"Shawn Spears",rank:270},{name:"LA Knight",rank:271},
    {name:"Dolph Ziggler",rank:276},{name:"2 Cold Scorpio",rank:277},{name:"Tanga Loa",rank:281},
    {name:"John Morrison",rank:284},{name:"Juice Robinson",rank:285},{name:"Karl Fredericks",rank:287},
    {name:"Bobby Roode",rank:293},{name:"Chad Gable",rank:294},{name:"Max Caster",rank:295},
    {name:"Matt Cardona",rank:297},{name:"MVP",rank:298},{name:"Mike Bennett",rank:300},
    {name:"JTG",rank:313},{name:"Crazzy Steve",rank:320},{name:"Eric Ryan",rank:323},
    {name:"James Storm",rank:329},{name:"Nash Carter",rank:331},{name:"Wes Lee",rank:332},
    {name:"Kevin Ku",rank:333},{name:"Rhino",rank:340},{name:"Jon Davis",rank:341},
    {name:"Angel Garza",rank:342},{name:"Darius Martin",rank:343},{name:"Flyer",rank:344},
    {name:"Cody Deaner",rank:345},{name:"Jody Himself",rank:346},{name:"Caveman Ugg",rank:348},
    {name:"Jordan Clearwater",rank:349},{name:"Ashton Starr",rank:350},
    {name:"Clark Connors",rank:353},{name:"Atlantis Jr.",rank:354},{name:"T-Hawk",rank:355},
    {name:"Chris Adonis",rank:361},{name:"Drew Gulak",rank:363},{name:"Arik Cannon",rank:365},
    {name:"Dalton Castle",rank:367},{name:"Ray Rosas",rank:368},{name:"Slice Boogie",rank:370},
    {name:"Frontman Jah",rank:371},{name:"Tyler Bate",rank:372},{name:"Akira Tozawa",rank:373},
    {name:"Jordan Cruz",rank:374},{name:"Mike Outlaw",rank:375},{name:"Rhett Titus",rank:376},
    {name:"SLAPJACK",rank:378},{name:"Joey Ace",rank:379},{name:"Kenny King",rank:380},
    {name:"Damo",rank:386},{name:"Tommy Dreamer",rank:394},{name:"Matt Taven",rank:396},
    {name:"Jordan Blade",rank:398},{name:"The Dark Sheik",rank:399},
    {name:"Eel O'Neal",rank:400},{name:"Murphy",rank:401},{name:"Drew Parker",rank:402},
    {name:"Ziggy Haim",rank:403},{name:"Bateman",rank:410},{name:"Jessica Troy",rank:411},
    {name:"Alex Kane",rank:414},{name:"Jessie Godderz",rank:415},{name:"Matt Yater",rank:416},
    {name:"Brandon Kirk",rank:421},{name:"Shea McCoy",rank:422},
    {name:"Humberto Carrillo",rank:433},{name:"Ari Sterling",rank:434},
    {name:"Suge D",rank:437},{name:"Grayson Waller",rank:439},{name:"Billie Starkz",rank:441},
    {name:"Royce Isaacs",rank:442},{name:"Sydney Steele",rank:443},{name:"Zicky Dice",rank:450},
    {name:"Madman Fulton",rank:451},{name:"Teoman",rank:454},{name:"JDX",rank:455},
    {name:"Mr. Grim",rank:457},{name:"Ariya Daivari",rank:458},{name:"Oney Lorcan",rank:459},
    {name:"Ryan Davidson",rank:460},{name:"Doc Simmons",rank:465},{name:"Yoya",rank:466},
    {name:"SHO",rank:467},{name:"Zombie Dragon",rank:474},{name:"Vinny Pacifico",rank:475},
    {name:"Cole Radrick",rank:476},{name:"Bad Luck Fale",rank:477},{name:"Big Callux",rank:478},
    {name:"Gino Medina",rank:479},{name:"Don't Die Miles",rank:480},
    {name:"Petey Williams",rank:481},{name:"The Boar",rank:488},{name:"Jon West",rank:490},
    {name:"Ryan Nemeth",rank:491},{name:"Mr. Iguana",rank:497},{name:"Robert Martyr",rank:498},
    {name:"Kaia McKenna",rank:499},{name:"Lulu Pencil",rank:500},
  ],
  2024: [
    {name:"Cody Rhodes",rank:1},{name:"Swerve Strickland",rank:2},{name:"Will Ospreay",rank:3},
    {name:"Seth Rollins",rank:4},{name:"Tetsuya Naito",rank:5},{name:"Damian Priest",rank:6},
    {name:"MJF",rank:7},{name:"Jon Moxley",rank:8},{name:"Gunther",rank:9},
    {name:"Mistico",rank:10},{name:"Samoa Joe",rank:11},{name:"Sami Zayn",rank:12},
    {name:"Drew McIntyre",rank:13},{name:"Bryan Danielson",rank:14},{name:"Moose",rank:15},
    {name:"SANADA",rank:16},{name:"Jey Uso",rank:17},{name:"El Hijo Del Vikingo",rank:18},
    {name:"Mustafa Ali",rank:19},{name:"Eddie Kingston",rank:20},{name:"Kazuchika Okada",rank:21},
    {name:"Nic Nemeth",rank:22},{name:"Alex Shelley",rank:23},{name:"Orange Cassidy",rank:24},
    {name:"Alex Kane",rank:25},{name:"Adam Copeland",rank:26},{name:"LA Knight",rank:27},
    {name:"Trick Williams",rank:28},{name:"Christian Cage",rank:29},{name:"Ilja Dragunov",rank:30},
    {name:"Mark Briscoe",rank:31},{name:"Katsuhiko Nakajima",rank:32},{name:"Zack Sabre Jr.",rank:33},
    {name:"Mike Bailey",rank:34},{name:"Kenoh",rank:35},{name:"Mascara Dorada 2.0",rank:36},
    {name:"Logan Paul",rank:37},{name:"Michael Oku",rank:38},{name:"Krule",rank:39},
    {name:"EC3",rank:40},{name:"Yuma Anzai",rank:41},{name:"Adam Page",rank:42},
    {name:"Josh Alexander",rank:43},{name:"Satoshi Kojima",rank:44},{name:"Rey Mysterio",rank:45},
    {name:"Hiromu Takahashi",rank:46},{name:"Kaito Kiyomiya",rank:47},{name:"Carmelo Hayes",rank:48},
    {name:"David Finlay",rank:49},{name:"El Hijo del Dr. Wagner Jr.",rank:50},
    {name:"Joe Hendry",rank:51},{name:"Bron Breakker",rank:52},{name:"Oba Femi",rank:53},
    {name:"Max The Impaler",rank:54},{name:"Randy Orton",rank:55},{name:"AJ Styles",rank:56},
    {name:"Claudio Castagnoli",rank:57},{name:"Kevin Owens",rank:58},{name:"Jack Perry",rank:59},
    {name:"El Desperado",rank:60},{name:"Atlantis Jr.",rank:61},{name:"Rocky Romero",rank:62},
    {name:"Ricochet",rank:63},{name:"Blake Christian",rank:64},{name:"Kyle Fletcher",rank:65},
    {name:"Solo Sikoa",rank:66},{name:"Konosuke Takeshita",rank:67},{name:"Finn Balor",rank:68},
    {name:"Dominik Mysterio",rank:69},{name:"Chris Sabin",rank:70},{name:"Yota Tsuji",rank:71},
    {name:"Santos Escobar",rank:72},{name:"Suge D.",rank:73},{name:"Luis Mante",rank:74},
    {name:"Ethan Page",rank:75},{name:"Octagon Jr.",rank:76},{name:"Matt Cardona",rank:77},
    {name:"Jake Lee",rank:78},{name:"Mance Warner",rank:79},{name:"Roderick Strong",rank:80},
    {name:"Hiroshi Tanahashi",rank:81},{name:"Go Shiozaki",rank:82},{name:"HOOK",rank:83},
    {name:"Yuki Ueno",rank:84},{name:"Shingo Takagi",rank:85},{name:"Wheeler YUTA",rank:86},
    {name:"Daniel Garcia",rank:87},{name:"MAO",rank:88},{name:"Chad Gable",rank:89},
    {name:"Chris Jericho",rank:90},{name:"YAMATO",rank:91},{name:"Alec Price",rank:92},
    {name:"Chris Brookes",rank:93},{name:"Jacob Fatu",rank:94},{name:"Je'Von Evans",rank:95},
    {name:"Matt Riddle",rank:96},{name:"Darby Allin",rank:97},{name:"Shota Umino",rank:98},
    {name:"Jessica Troy",rank:99},{name:"HAYATA",rank:100},
    {name:"Steve Maclin",rank:101},{name:"Kento Miyahara",rank:102},{name:"SHO",rank:103},
    {name:"Daga",rank:104},{name:"Colby Corino",rank:105},{name:"Rina Yamashita",rank:106},
    {name:"Shun Skywalker",rank:107},{name:"Hechicero",rank:108},{name:"Shinsuke Nakamura",rank:109},
    {name:"Jay White",rank:110},{name:"Kid Lykos",rank:111},{name:"PAC",rank:112},
    {name:"Laurance Roman",rank:113},{name:"Ace Austin",rank:114},{name:"1 Called Manders",rank:115},
    {name:"Bryan Keith",rank:116},{name:"Lee Moriarty",rank:117},{name:"Masha Slamovich",rank:118},
    {name:"Rickey Shane Page",rank:119},{name:"Ben-K",rank:120},{name:"Jeff Cobb",rank:121},
    {name:"Effy",rank:122},{name:"Luke Jacobs",rank:123},{name:"Adam Priest",rank:124},
    {name:"Hirooki Goto",rank:125},{name:"AJ Francis",rank:126},{name:"Titan",rank:127},
    {name:"Calvin Tankman",rank:128},{name:"Laredo Kid",rank:129},{name:"Frankie Kazarian",rank:130},
    {name:"Minoru Suzuki",rank:131},{name:"Jake Parnell",rank:132},{name:"Jordan Oliver",rank:133},
    {name:"Noam Dar",rank:134},{name:"Rey Fenix",rank:135},{name:"Ricky Knight Jr.",rank:136},
    {name:"Yuma Aoyagi",rank:137},{name:"AKIRA",rank:138},{name:"Megan Bayne",rank:139},
    {name:"Marcus Mathers",rank:140},{name:"Myron Reed",rank:141},{name:"Templario",rank:142},
    {name:"Yuya Uemura",rank:143},{name:"Bronson Reed",rank:144},{name:"Aigle Blanc",rank:145},
    {name:"Mike Santana",rank:146},{name:"Jake Something",rank:147},{name:"Chris Bey",rank:148},
    {name:"Marko Estrada",rank:149},{name:"Billie Starkz",rank:150},{name:"Kevin Blackwood",rank:151},
    {name:"Darius Carter",rank:152},{name:"Lee Johnson",rank:153},{name:"Alexander Hammerstone",rank:154},
    {name:"KENTA",rank:155},{name:"Jun Saito",rank:156},{name:"DELTA",rank:157},
    {name:"Robert Dreissker",rank:158},{name:"Yuya Aoki",rank:159},{name:"Rush",rank:160},
    {name:"Adam Brooks",rank:161},{name:"Rising HAYATO",rank:162},{name:"Alan Angels",rank:163},
    {name:"Hoodfoot",rank:164},{name:"Joey Janela",rank:165},{name:"Joe Alonzo",rank:166},
    {name:"Charlie Dempsey",rank:167},{name:"Hyo",rank:168},{name:"Robbie Eagles",rank:169},
    {name:"Titus Alexander",rank:170},{name:"Dalton Castle",rank:171},{name:"Sheamus",rank:172},
    {name:"Starboy Charlie",rank:173},{name:"Shane Taylor",rank:174},{name:"Spike Trivet",rank:175},
    {name:"DOUKI",rank:176},{name:"Star Jr.",rank:177},{name:"Tomohiro Ishii",rank:178},
    {name:"Benjamin Tull",rank:179},{name:"Leon Slater",rank:180},{name:"Dijak",rank:181},
    {name:"Ren Narita",rank:182},{name:"Royce Isaacs",rank:183},{name:"Madoka Kikuta",rank:184},
    {name:"Jake Crist",rank:185},{name:"Powerhouse Hobbs",rank:186},{name:"John Wayne Murdoch",rank:187},
    {name:"Angel de Oro",rank:188},{name:"El Phantasmo",rank:189},{name:"Nick Wayne",rank:190},
    {name:"Stephen Wolf",rank:191},{name:"Kevin Ku",rank:192},{name:"Gringo Loco",rank:193},
    {name:"Gabe Kidd",rank:194},{name:"Pete Dunne",rank:195},{name:"Andrade",rank:196},
    {name:"Bobby Lashley",rank:197},{name:"PCO",rank:198},{name:"Peter Tihanyi",rank:199},
    {name:"Shigehiro Irie",rank:200},
    {name:"Matt Tremont",rank:201},{name:"Tony D'Angelo",rank:202},{name:"Danhausen",rank:203},
    {name:"Trey Miguel",rank:204},{name:"Davey Vega",rank:205},{name:"Q.T. Marshall",rank:206},
    {name:"Volador Jr.",rank:207},{name:"Wes Lee",rank:208},{name:"Jack Jester",rank:209},
    {name:"Naruki Doi",rank:210},{name:"Thom Latimer",rank:211},{name:"Tyler Bate",rank:212},
    {name:"Timothy Thatcher",rank:213},{name:"Tate Mayfairs",rank:214},{name:"Richard Holliday",rank:215},
    {name:"Ludwig Kaiser",rank:216},{name:"Joseph Fenech Jr.",rank:217},{name:"Ultimo Guerrero",rank:218},
    {name:"Dragon Lee",rank:219},{name:"Henare",rank:220},{name:"Katsuyori Shibata",rank:221},
    {name:"Charli Evans",rank:222},{name:"K.C. Navarro",rank:223},{name:"The Beast Mortos",rank:224},
    {name:"Rei Saito",rank:225},{name:"Man Like DeReiss",rank:226},{name:"Eric Young",rank:227},
    {name:"Dan Tamura",rank:228},{name:"Tama Tonga",rank:229},{name:"Hayato Tamura",rank:230},
    {name:"Ichiban",rank:231},{name:"Slex",rank:232},{name:"Omos",rank:233},{name:"YOH",rank:234},
    {name:"Stu Grayson",rank:235},{name:"Pentagon Jr.",rank:236},{name:"Psycho Clown",rank:237},
    {name:"El Lindaman",rank:238},{name:"Kyle O'Reilly",rank:239},{name:"ISHIN",rank:240},
    {name:"Suwama",rank:241},{name:"Drilla Moloney",rank:242},{name:"Brian Cage",rank:243},
    {name:"Andino",rank:244},{name:"Allie Katch",rank:245},{name:"Wardlow",rank:246},
    {name:"Hologram",rank:247},{name:"Jordan Cruz",rank:248},{name:"DMT Azul",rank:249},
    {name:"KUSHIDA",rank:250},{name:"Darian Bengston",rank:251},{name:"Matt Makowski",rank:252},
    {name:"El Barbaro Cavernario",rank:253},{name:"EVIL",rank:254},{name:"Ricky South",rank:255},
    {name:"Eddie Edwards",rank:256},{name:"Austin Theory",rank:257},{name:"Brandon Kirk",rank:258},
    {name:"Johnny Gargano",rank:259},{name:"Eel O'Neal",rank:260},{name:"Grayson Waller",rank:261},
    {name:"Rich Swann",rank:262},{name:"Masato Tanaka",rank:263},{name:"Lio Rush",rank:264},
    {name:"Tommaso Ciampa",rank:265},{name:"Eddie Dennis",rank:266},{name:"Taiji Ishimori",rank:267},
    {name:"Sammy D",rank:268},{name:"Junior Benito",rank:269},{name:"Jordan Blade",rank:270},
    {name:"Gnarls Garvin",rank:271},{name:"Great O-Khan",rank:272},{name:"Connor Mills",rank:273},
    {name:"Kevin Knight",rank:274},{name:"Lance Archer",rank:275},{name:"Jonathan Gresham",rank:276},
    {name:"Strong Machine J",rank:277},{name:"Cole Radrick",rank:278},{name:"Levaniel",rank:279},
    {name:"Komander",rank:280},{name:"The Miz",rank:281},{name:"Kofi Kingston",rank:282},
    {name:"Zachary Wentz",rank:283},{name:"Bad Dude Tito",rank:284},{name:"Sami Callihan",rank:285},
    {name:"Danny Limelight",rank:286},{name:"HIKULEO",rank:287},{name:"Potro De Oro",rank:288},
    {name:"Pagano",rank:289},{name:"TJP",rank:290},{name:"Jason Hotch",rank:291},
    {name:"Axel Tischer",rank:292},{name:"Guerrero Maya Jr.",rank:293},{name:"Mike D Vecchio",rank:294},
    {name:"Tom Lawlor",rank:295},{name:"Seigo Tachibana",rank:296},{name:"Aliss Ink",rank:297},
    {name:"Trent Seven",rank:298},{name:"Xavier Woods",rank:299},{name:"Jack Vaughn",rank:300},
    {name:"Dezmond Cole",rank:301},{name:"Intelecto Cinco Estrellas",rank:302},{name:"Isaiah Broner",rank:303},
    {name:"Neon",rank:304},{name:"Hikaru Sato",rank:305},{name:"Duke Hudson",rank:306},
    {name:"Rhino",rank:307},{name:"Storm Grayson",rank:308},{name:"Slice Boogie",rank:309},
    {name:"Malcolm Monroe III",rank:310},{name:"Shuji Ishikawa",rank:311},{name:"Karrion Kross",rank:312},
    {name:"Flip Gordon",rank:313},{name:"Kota Sekifuda",rank:314},{name:"Cody Chhun",rank:315},
    {name:"Channing Thomas",rank:316},{name:"Killswitch",rank:317},{name:"Shelton Benjamin",rank:318},
    {name:"Jimmy Lloyd",rank:319},{name:"Mims",rank:320},{name:"Sam Adonis",rank:321},
    {name:"Euforia",rank:322},{name:"The Tuckman",rank:323},{name:"Lance Anoa'i",rank:324},
    {name:"The Dark Sheik",rank:325},{name:"Francesco Akira",rank:326},{name:"Jack Cartwheel",rank:327},
    {name:"Paris De Silva",rank:328},{name:"Galeno del Mal",rank:329},{name:"Esfinge",rank:330},
    {name:"Trent Beretta",rank:331},{name:"Evan Rivers",rank:332},{name:"Emman Azman",rank:333},
    {name:"El Texano Jr.",rank:334},{name:"Sonico",rank:335},{name:"TARIK",rank:336},
    {name:"Will Allday",rank:337},{name:"Myung-Jae Lee",rank:338},{name:"Zilla Fatu",rank:339},
    {name:"Jimmy Townsend",rank:340},{name:"Jack Morris",rank:341},{name:"Ben Braxton",rank:342},
    {name:"Jiah Jewell",rank:343},{name:"Dirty Dango",rank:344},{name:"John Hawking",rank:345},
    {name:"Ninja Mack",rank:346},{name:"Kenny K",rank:347},{name:"Chris Adonis",rank:348},
    {name:"Arez",rank:349},{name:"Mad Dog Connelly",rank:350},{name:"Raj Dhesi",rank:351},
    {name:"Ricky Starks",rank:352},{name:"Dralistico",rank:353},{name:"Kerry Morton",rank:354},
    {name:"Cha Cha Charlie",rank:355},{name:"Caveman Ugg",rank:356},{name:"Oleg Boltin",rank:357},
    {name:"Eddy Thorpe",rank:358},{name:"Devon Monroe",rank:359},{name:"Shane Mercer",rank:360},
    {name:"Mylo",rank:361},{name:"Pretty Boy Smooth",rank:362},{name:"Psycho Mike",rank:363},
    {name:"Manny Ferno",rank:364},{name:"Joshua Bishop",rank:365},{name:"Dominic Garrini",rank:366},
    {name:"Fuminori Abe",rank:367},{name:"Lexis King",rank:368},{name:"Clark Connors",rank:369},
    {name:"Masa Kitamiya",rank:370},{name:"Derek Dillinger",rank:371},{name:"Sonny Kiss",rank:372},
    {name:"Callum Newman",rank:373},{name:"Manabu Soya",rank:374},{name:"Bobby Beverly",rank:375},
    {name:"Vinnie Massaro",rank:376},{name:"Dante Chen",rank:377},{name:"J-BOUJII",rank:378},
    {name:"Vito Fratelli",rank:379},{name:"Landon Hale",rank:380},{name:"Evil Uno",rank:381},
    {name:"Rico Gonzalez",rank:382},{name:"Zoe Sager",rank:383},{name:"Alex Colon",rank:384},
    {name:"Jamesen Shook",rank:385},{name:"El Hijo de Pirata Morgan",rank:386},{name:"Angelico",rank:387},
    {name:"Xavant",rank:388},{name:"Travis Williams",rank:389},{name:"Ryan Clancy",rank:390},
    {name:"Silas Mason",rank:391},{name:"Clint Margera",rank:392},{name:"Dustin Rhodes",rank:393},
    {name:"Chris Basso",rank:394},{name:"Barrett Brown",rank:395},{name:"Microman",rank:396},
    {name:"Matthew Justice",rank:397},{name:"Judas Icarus",rank:398},{name:"YOICHI",rank:399},
    {name:"Sawyer Wreck",rank:400},
    {name:"Ray Gonzalez",rank:401},{name:"Big Fudge",rank:402},{name:"Sam Holloway",rank:403},
    {name:"Travis Toxic",rank:404},{name:"Alpha Zo",rank:405},{name:"Sidney Akeem",rank:406},
    {name:"Zak Patterson",rank:407},{name:"Cheeseburger",rank:408},{name:"Neil Diamond Cutter",rank:409},
    {name:"Vinny Pacifico",rank:410},{name:"Hyan",rank:411},{name:"Journey Fatu",rank:412},
    {name:"Will Kiedis",rank:413},{name:"Madman Fulton",rank:414},{name:"Tre Lamar",rank:415},
    {name:"Shawn Spears",rank:416},{name:"Robb Radke",rank:417},{name:"O'Shay Edwards",rank:418},
    {name:"Luke Kurtis",rank:419},{name:"Danny Demanto",rank:420},{name:"Goldy",rank:421},
    {name:"Robbie X",rank:422},{name:"Jaden Newman",rank:423},{name:"Ivar",rank:424},
    {name:"Willie Mack",rank:425},{name:"MV Young",rank:426},{name:"Exodus Prime",rank:427},
    {name:"Billy Dixon",rank:428},{name:"Facade",rank:429},{name:"GPA",rank:430},
    {name:"Jody Threat",rank:431},{name:"Aaron Rourke",rank:432},{name:"Sandra Moone",rank:433},
    {name:"Rhio",rank:434},{name:"Fuego Del Sol",rank:435},{name:"Frontman Jah",rank:436},
    {name:"Valiente",rank:437},{name:"Peter Olisander",rank:438},{name:"Brian Johnson",rank:439},
    {name:"Quiet Storm",rank:440},{name:"Tristan Archer",rank:441},{name:"Kaun",rank:442},
    {name:"Bam Sullivan",rank:443},{name:"Ashton Starr",rank:444},{name:"Hartenbower",rank:445},
    {name:"Gary Jay",rank:446},{name:"Aaron Solo",rank:447},{name:"Mikey Montgomery",rank:448},
    {name:"Killian McMurphy",rank:449},{name:"Renzo Rose",rank:450},
    {name:"Austin Luke",rank:451},{name:"Tony Deppen",rank:452},{name:"Baron Corbin",rank:453},
    {name:"Laynie Luck",rank:454},{name:"Eli Everfly",rank:455},{name:"Maki Itoh",rank:456},
    {name:"Charles Mason",rank:457},{name:"Robert Anthony",rank:458},{name:"Ulka Sasaki",rank:459},
    {name:"Grimm",rank:460},{name:"Dimitri Alexandrov",rank:461},{name:"Vipress",rank:462},
    {name:"Steve Pena",rank:463},{name:"Logan Knight",rank:464},{name:"LSG",rank:465},
    {name:"Kristian Ross",rank:466},{name:"Flash Morgan Webster",rank:467},{name:"Griffin McCoy",rank:468},
    {name:"Solomon Tupu",rank:469},{name:"Amira Lukens",rank:470},{name:"Dani Luna",rank:471},
    {name:"Johnny TV",rank:472},{name:"Rohit Raju",rank:473},{name:"Dragon Dia",rank:474},
    {name:"Emersyn Jayne",rank:475},{name:"Jordon Breaks",rank:476},{name:"Sierra",rank:477},
    {name:"Rip Byson",rank:478},{name:"Tony Nese",rank:479},{name:"Vaughn Vertigo",rank:480},
    {name:"Epydemius Jr.",rank:481},{name:"Joey Avalon",rank:482},{name:"Aiden Prince",rank:483},
    {name:"Anton Voorhees",rank:484},{name:"Mike Skyros",rank:485},{name:"Alexia Nicole",rank:486},
    {name:"Slim J",rank:487},{name:"Myles Millennium",rank:488},{name:"Kody Manhorn",rank:489},
    {name:"Noah Veil",rank:490},{name:"Lucas DiSangro",rank:491},{name:"Isaiah Wolf",rank:492},
    {name:"Rohan Raja",rank:493},{name:"Kristara",rank:494},{name:"Tjay Sykes",rank:495},
    {name:"Smiley",rank:496},{name:"Anakin Murphy",rank:497},
  ],
  2023: [
    {name:"Bobby Lashley",rank:19},{name:"Kenny Omega",rank:25},{name:"Drew McIntyre",rank:26},
    {name:"Zack Sabre Jr.",rank:27},{name:"Adam Page",rank:28},{name:"PAC",rank:30},
    {name:"Ricky Starks",rank:43},{name:"Jacob Fatu",rank:56},{name:"Nick Aldis",rank:57},
    {name:"Tyrus",rank:58},{name:"Powerhouse Hobbs",rank:59},{name:"Finn Balor",rank:61},
    {name:"Damian Priest",rank:71},{name:"Jack Perry",rank:73},{name:"David Finlay",rank:74},
    {name:"Eddie Kingston",rank:77},{name:"AJ Styles",rank:99},{name:"Jay Lethal",rank:101},
    {name:"HOOK",rank:103},{name:"Mustafa Ali",rank:108},{name:"Chris Sabin",rank:110},
    {name:"Swerve Strickland",rank:112},{name:"The Miz",rank:141},{name:"Juice Robinson",rank:142},
    {name:"Buddy Matthews",rank:143},{name:"Ricochet",rank:149},{name:"Bronson Reed",rank:150},
    {name:"Ilja Dragunov",rank:151},{name:"Lio Rush",rank:158},{name:"Yota Tsuji",rank:159},
    {name:"Ethan Page",rank:170},{name:"Omos",rank:174},{name:"Nick Gage",rank:175},
    {name:"Omari",rank:180},{name:"Brandon Kirk",rank:197},{name:"Kasey Kirk",rank:198},
    {name:"Myron Reed",rank:199},{name:"EC3",rank:209},{name:"Axiom",rank:210},
    {name:"Trick Williams",rank:213},{name:"Christopher Daniels",rank:214},{name:"Moose",rank:220},
    {name:"Johnny Gargano",rank:227},{name:"Brogan Finlay",rank:232},{name:"Rich Swann",rank:234},
    {name:"Connor Mills",rank:239},{name:"Dragon Lee",rank:253},{name:"Dalton Castle",rank:279},
    {name:"Robbie X",rank:280},{name:"Tommy Knight",rank:283},{name:"Carlito",rank:285},
    {name:"Corndog",rank:287},{name:"TJP",rank:291},{name:"Kofi Kingston",rank:294},
    {name:"Jake Something",rank:297},{name:"Luchasaurus",rank:298},{name:"Baron Corbin",rank:299},
    {name:"EVIL",rank:304},{name:"Matt Hayter",rank:309},{name:"Kid Lykos",rank:317},
    {name:"Stu Grayson",rank:326},{name:"Evil Uno",rank:336},{name:"John Hawking",rank:337},
    {name:"Chad Gable",rank:338},{name:"Matt Taven",rank:339},{name:"Trent Seven",rank:355},
    {name:"BEEF",rank:359},{name:"Hirooki Goto",rank:363},{name:"Max The Impaler",rank:364},
    {name:"Bad Dude Tito",rank:373},{name:"Sandra Moone",rank:376},{name:"Bobby Beverly",rank:380},
    {name:"Alex Colon",rank:388},{name:"Arez",rank:391},{name:"Joel Bateman",rank:392},
    {name:"Dolph Ziggler",rank:393},{name:"Josh Woods",rank:400},{name:"Jessie Godderz",rank:405},
    {name:"Dirty Dango",rank:406},{name:"Sonny Kiss",rank:431},{name:"Maggot",rank:433},
    {name:"Ashton Starr",rank:434},{name:"Karrion Kross",rank:440},{name:"Ricky Marvin",rank:450},
    {name:"Ben-K",rank:452},{name:"Danhausen",rank:453},{name:"Love Doug",rank:488},
    {name:"Big Dust",rank:499},{name:"Andre Chase",rank:500},
  ],
  2025: [
    {name:"Jey Uso",rank:6},{name:"Swerve Strickland",rank:7},{name:"Rhea Ripley",rank:8},{name:"Will Ospreay",rank:10},
    {name:"Joe Hendry",rank:12},{name:"Kyle Fletcher",rank:14},{name:"Becky Lynch",rank:16},{name:"Ricochet",rank:22},
    {name:"Effy",rank:30},{name:"Ethan Page",rank:38},{name:"Penta",rank:46},
    {name:"Drew McIntyre",rank:54},{name:"Je'Von Evans",rank:62},{name:"Dominik Mysterio",rank:68},
    {name:"Matt Riddle",rank:74},{name:"Shinsuke Nakamura",rank:80},{name:"Jack Perry",rank:86},
    {name:"Carmelo Hayes",rank:93},{name:"Orange Cassidy",rank:101},{name:"Lio Rush",rank:110},
    {name:"Sammy Guevara",rank:120},{name:"JC Mateo",rank:130},{name:"Chad Gable",rank:140},
    {name:"The Beast Mortos",rank:150},{name:"Sheamus",rank:158},{name:"Powerhouse Hobbs",rank:165},
    {name:"Mustafa Ali",rank:172},{name:"Brody King",rank:180},{name:"Big Damo",rank:188},
    {name:"Zilla Fatu",rank:195},{name:"Ludwig Kaiser",rank:201},
    {name:"Channing 'Stacks' Lorenzo",rank:210},{name:"Psycho Clown",rank:225},
    {name:"Jay Lethal",rank:242},{name:"EC3",rank:258},{name:"Eric Young",rank:274},
    {name:"A.R. Fox",rank:288},{name:"Paul London",rank:298},{name:"Braun Strowman",rank:311},
    {name:"Danhausen",rank:325},{name:"Maki Itoh",rank:345},{name:"Matt Taven",rank:365},
    {name:"Enzo Amore",rank:385},{name:"Cappuccino Jones",rank:400},
  ],
};

// Gender coverage per curated year (for display only)
const SEED_GENDER = {
  1995:"Men", 1996:"Men", 1997:"Men", 1998:"Men", 1999:"Men", 2000:"Men", 2001:"Men", 2002:"Men", 2003:"Men", 2004:"Men", 2005:"Men", 2006:"Men", 2007:"Men",
  2008:"Mixed", 2009:"Mixed", 2010:"Mixed", 2011:"Mixed", 2012:"Mixed", 2013:"Mixed", 2014:"Mixed",
  2015:"Mixed", 2016:"Mixed", 2017:"Mixed", 2018:"Mixed", 2019:"Mixed",
  2020:"Mixed", 2021:"Mixed", 2022:"Mixed", 2023:"Mixed", 2024:"Mixed", 2025:"Mixed",
};

function getSeedPool(year) {
  const all = SEED_DATA[year];
  if (!all) return null;
  const shuf = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const used = new Set();
  const pick = (lo, hi, n) => {
    const c = shuf(all.filter(w => w.rank >= lo && w.rank <= hi && !used.has(w.name)));
    const r = c.slice(0, n); r.forEach(w => used.add(w.name)); return r;
  };
  const result = [...pick(1,30,3),...pick(31,100,4),...pick(101,300,4),...pick(301,999,5)];
  if (result.length < 16) {
    const fill = shuf(all.filter(w => !used.has(w.name)));
    result.push(...fill.slice(0, 16 - result.length));
  }
  return result.sort((a, b) => a.rank - b.rank);
}

function getFallback(year) {
  if (year <= 1994) return [
    {name:"Ric Flair",rank:1},{name:"Hulk Hogan",rank:2},{name:"Randy Savage",rank:3},
    {name:"Sting",rank:4},{name:"Undertaker",rank:9},{name:"British Bulldog",rank:8},
    {name:"Bret Hart",rank:11},{name:"Rick Rude",rank:22},{name:"Jake Roberts",rank:29},
    {name:"Ted DiBiase",rank:18},{name:"Shawn Michaels",rank:35},{name:"Brian Pillman",rank:67},
    {name:"Scott Steiner",rank:44},{name:"Bob Holly",rank:189},{name:"Papa Shango",rank:287},
    {name:"Barry Horowitz",rank:445},
  ];
  if (year <= 1997) return [
    {name:"Bret Hart",rank:1},{name:"Diesel",rank:2},{name:"Shawn Michaels",rank:3},
    {name:"Undertaker",rank:5},{name:"Steve Austin",rank:8},{name:"Razor Ramon",rank:15},
    {name:"Owen Hart",rank:18},{name:"British Bulldog",rank:22},{name:"Vader",rank:35},
    {name:"Mankind",rank:44},{name:"Goldust",rank:55},{name:"Triple H",rank:112},
    {name:"Marc Mero",rank:89},{name:"Leif Cassidy",rank:278},{name:"Salvatore Sincere",rank:412},
    {name:"The Goon",rank:478},
  ];
  if (year <= 2001) return [
    {name:"The Rock",rank:1},{name:"Steve Austin",rank:2},{name:"Triple H",rank:3},
    {name:"Kurt Angle",rank:5},{name:"Undertaker",rank:8},{name:"Chris Jericho",rank:12},
    {name:"Edge",rank:19},{name:"Rob Van Dam",rank:33},{name:"Chris Benoit",rank:24},
    {name:"Rey Mysterio",rank:48},{name:"Christian",rank:67},{name:"Rikishi",rank:121},
    {name:"Tazz",rank:189},{name:"Test",rank:145},{name:"Albert",rank:312},{name:"Funaki",rank:445},
  ];
  if (year <= 2015) return [
    {name:"John Cena",rank:1},{name:"Batista",rank:2},{name:"Randy Orton",rank:4},
    {name:"Triple H",rank:3},{name:"Edge",rank:6},{name:"Undertaker",rank:8},
    {name:"Rey Mysterio",rank:15},{name:"Shawn Michaels",rank:9},{name:"Chris Jericho",rank:22},
    {name:"CM Punk",rank:35},{name:"Jeff Hardy",rank:55},{name:"Carlito",rank:78},
    {name:"Shelton Benjamin",rank:112},{name:"Matt Hardy",rank:145},
    {name:"Hardcore Holly",rank:312},{name:"Eugene",rank:445},
  ];
  return [
    {name:"Roman Reigns",rank:1},{name:"Cody Rhodes",rank:3},{name:"Seth Rollins",rank:4},
    {name:"CM Punk",rank:2},{name:"Gunther",rank:7},{name:"Randy Orton",rank:9},
    {name:"Sami Zayn",rank:11},{name:"Kevin Owens",rank:15},{name:"Rhea Ripley",rank:18},
    {name:"AJ Styles",rank:22},{name:"LA Knight",rank:35},{name:"Becky Lynch",rank:44},
    {name:"Cesaro",rank:112},{name:"Dolph Ziggler",rank:189},{name:"R-Truth",rank:278},
    {name:"Mojo Rawley",rank:345},
  ];
}

// ─── Components ───────────────────────────────────────────────────────────────
function RankBadge({ rank, mode, size = 34 }) {
  if (mode === "hard") return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.14)" }} />;
  return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:rankColor(rank), boxShadow:`0 0 8px ${rankGlow(rank)}` }} />;
}

const GCSS = `
  @keyframes fadeIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
  @keyframes stampIn { 0%{transform:scale(1.8) rotate(-8deg);opacity:0} 85%{transform:scale(0.97) rotate(0.5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes goldGlow{ 0%,100%{text-shadow:0 0 18px rgba(255,215,0,0.5)} 50%{text-shadow:0 0 36px rgba(255,215,0,0.9)} }
  *{box-sizing:border-box;margin:0;padding:0} input{outline:none;color:#fff}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#111} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
`;
const ROOT   = { minHeight:"100vh", background:"linear-gradient(160deg,#0c0008 0%,#1e0510 45%,#08000e 100%)", color:"#fff", fontFamily:'"Impact","Arial Narrow",Arial,sans-serif' };
const TOPBAR = { background:"linear-gradient(90deg,#6e0000 0%,#cc0000 50%,#6e0000 100%)", padding:"5px 0", textAlign:"center", fontSize:11, letterSpacing:4, color:"#FFD700", borderBottom:"2px solid #FFD700", fontFamily:'"Impact",Arial' };
const mkBtn  = (p) => ({ padding:p?"13px 32px":"9px 20px", background:p?"linear-gradient(135deg,#8a0000 0%,#d40000 50%,#8a0000 100%)":"rgba(255,255,255,0.06)", border:p?"1px solid #ff3333":"1px solid rgba(255,255,255,0.1)", color:p?"#fff":"#888", fontSize:p?18:12, fontFamily:'"Impact",Arial', letterSpacing:2, cursor:"pointer", borderRadius:5, textTransform:"uppercase", boxShadow:p?"0 4px 18px rgba(160,0,0,0.4)":"none" });

function TeamPanel({ label, wrestlers, highlight, mode }) {
  return (
    <div style={{ background:"rgba(0,0,0,0.4)", border:`1px solid ${highlight?"rgba(255,215,0,0.28)":"rgba(255,255,255,0.07)"}`, borderRadius:9, padding:11 }}>
      <div style={{ fontSize:9, color:highlight?"#FFD700":"#444", fontFamily:"Arial", letterSpacing:3, marginBottom:7, textTransform:"uppercase" }}>{label}</div>
      {wrestlers.map((w,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
          <RankBadge rank={w.rank} mode={mode} size={22} />
          <span style={{ fontSize:12, fontFamily:"Arial", color:"#ccc", flex:1 }}>{w.name}</span>
          {w.female&&<span style={{fontSize:9,color:"#f472b6"}}>♀</span>}
        </div>
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,        setPhase]        = useState("menu");
  const [mode,         setMode]         = useState("easy");
  const [noDq,         setNoDq]         = useState(false);
  const [genderMode,   setGenderMode]   = useState("intergender");
  const [showEmojis,   setShowEmojis]   = useState(true);
  const [gameMode,     setGameMode]     = useState("wargames"); // "survivor"|"wargames"
  const [showStip,     setShowStip]     = useState(false);
  const [wgRound,      setWgRound]      = useState(0); // wargames round 1-5
  const [wgDrafted,    setWgDrafted]    = useState([]); // names drafted across all rounds
  const [wgYear,       setWgYear]       = useState(null);
  const [year,         setYear]         = useState(null);
  const [pool,         setPool]         = useState([]);
  const [team,         setTeam]         = useState([]);
  const [opp,          setOpp]          = useState([]);
  const [streak,       setStreak]       = useState(0);
  const [best,         setBest]         = useState(0);
  const [bestStars,    setBestStars]    = useState(0);
  const [result,       setResult]       = useState(null);
  const [log,          setLog]          = useState([]);
  const [poolNote,     setPoolNote]     = useState(null);
  const [custom,       setCustom]       = useState([]);
  const [form,         setForm]         = useState({ name:"", rank:"", yearMin:"", yearMax:"" });
  const [formErr,      setFormErr]      = useState(null);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    (async () => { try { const r = await window.storage.get("pwi-custom-roster"); if (r) setCustom(JSON.parse(r.value)); } catch {} })();
  }, []);

  async function addCustomWrestler() {
    const name = form.name.trim(), rank = parseInt(form.rank);
    if (!name)                           { setFormErr("Wrestler name is required."); return; }
    if (!rank || rank < 1 || rank > 500) { setFormErr("Rank must be 1–500.");       return; }
    setFormErr(null); setSaving(true);
    const w = { id:Date.now(), name, rank, yearMin:form.yearMin?parseInt(form.yearMin):null, yearMax:form.yearMax?parseInt(form.yearMax):null, custom:true };
    const updated = [...custom, w].sort((a,b)=>a.rank-b.rank);
    setCustom(updated);
    try { await window.storage.set("pwi-custom-roster", JSON.stringify(updated)); } catch {}
    setForm({ name:"", rank:"", yearMin:"", yearMax:"" }); setSaving(false);
  }
  async function removeCustom(id) {
    const updated = custom.filter(w=>w.id!==id); setCustom(updated);
    try { await window.storage.set("pwi-custom-roster", JSON.stringify(updated)); } catch {}
  }
  function customForYear(yr) {
    return custom.filter(w => {
      if (!w.yearMin && !w.yearMax) return true;
      if (w.yearMin && w.yearMax) return yr>=w.yearMin && yr<=w.yearMax;
      if (w.yearMin) return yr>=w.yearMin; if (w.yearMax) return yr<=w.yearMax; return true;
    });
  }

  // Shared pool-loading utility
  async function loadPoolForYear(yr, exclude=[]) {
    let base;
    if (SEED_DATA[yr]) { base = getSeedPool(yr); setPoolNote("seed"); }
    else {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1500,
            system:"You are a wrestling rankings historian. Return ONLY valid JSON — no markdown, no code fences.",
            messages:[{role:"user",content:`List 16 real wrestlers from the ${yr} wrestling annual rankings. Include 2-3 ranked 1-10, 3-4 ranked 11-100, 4-5 ranked 101-300, 3-4 ranked 301-500. Return ONLY: {"wrestlers":[{"name":"Full Name","rank":N},...16 total]}`}] }) });
        const d=await res.json(), txt=d.content?.find(c=>c.type==="text")?.text??"";
        base=JSON.parse(txt.replace(/```[\w]*\n?/g,"").replace(/`/g,"").trim()).wrestlers.slice(0,16);
        if(base.length<6) throw new Error(); setPoolNote("api");
      } catch { base=getFallback(yr); setPoolNote("sample"); }
    }
    const taken=new Set(base.map(w=>w.name.toLowerCase()));
    const extra=customForYear(yr).filter(w=>!taken.has(w.name.toLowerCase()));
    const eligibleSpecials = SPECIAL_POOL.filter(w => yr>=w.yearMin && yr<=w.yearMax && !taken.has(w.name.toLowerCase()));
    const specials = [...eligibleSpecials].sort(()=>Math.random()-0.5).slice(0, Math.random()<0.6?2:1);
    specials.forEach(w => taken.add(w.name.toLowerCase()));
    const all = [...base,...extra,...specials];
    const tagged = all.map(w=>({...w, female:FEMALE_WRESTLERS.has(w.name), persona:getPersona(w.name,yr)}));
    const filtered = genderMode==="intergender" ? tagged : genderMode==="women" ? tagged.filter(w=>w.female) : tagged.filter(w=>!w.female);
    // Filter out already-drafted wrestlers (wargames duplicate prevention)
    const isDrafted = (name) => exclude.some(d => d===name || areAliases(d, name));
    const deduped = (filtered.length>=10 ? filtered : tagged).filter(w => !isDrafted(w.name));
    const finalPool = deduped.length >= 4 ? deduped : (filtered.length>=10 ? filtered : tagged);
    setPool([...finalPool].sort(()=>Math.random()-0.5));
  }

  async function startDraft() {
    const yr = 1991 + Math.floor(Math.random()*35);
    setYear(yr); setWgYear(yr); setTeam([]); setOpp([]); setResult(null); setLog([]); setPoolNote(null);
    if (gameMode==="wargames") { setWgRound(1); setWgDrafted([]); }
    setPhase("loading");
    await loadPoolForYear(yr, []);
    setPhase("draft");
  }

  // Wargames: advance to next round
  async function nextWgRound(newTeam, newOpp, drafted) {
    const nextRound = wgRound + 1;
    setWgRound(nextRound);
    const yr = 1991 + Math.floor(Math.random()*35);
    setWgYear(yr); setYear(yr); setPoolNote(null);
    setPhase("loading");
    await loadPoolForYear(yr, drafted);
    setPhase("draft");
  }

  // Wargames: player picks exactly 1 per round; opposition auto-drafts the best remaining
  function pickWargames(w) {
    const newTeam = [...team, w];
    // Opposition auto-picks the highest-ranked available wrestler not already drafted
    const remaining = pool.filter(p =>
      !areAliases(p.name, w.name) && p.name !== w.name &&
      !opp.find(o => areAliases(o.name, p.name)) &&
      !wgDrafted.some(d => d===p.name || areAliases(d, p.name))
    );
    const bestForOpp = [...remaining].sort((a,b)=>pts(b.rank)-pts(a.rank))[0];
    const newOpp = bestForOpp ? [...opp, bestForOpp] : [...opp];
    // Track all drafted names (player pick + opp pick) for future round filtering
    const newDrafted = [...wgDrafted, w.name, ...(bestForOpp ? [bestForOpp.name] : [])];
    setWgDrafted(newDrafted);
    setTeam(newTeam);
    setOpp(newOpp);

    if (newTeam.length >= 5) {
      const { events, playerWins, starRating } = simulate([...newTeam],[...newOpp], noDq);
      setLog(events);
      const ms=teamScore(newTeam), os=teamScore(newOpp);
      const dispProb=Math.round(Math.min(88,Math.max(12,(ms/(ms+os))*100)));
      setBestStars(b=>Math.max(b,starRating));
      setResult({ won:playerWins, prob:dispProb, newStreak:0, starRating, noDqUsed:noDq, wargames:true });
      setPhase("result");
    } else {
      nextWgRound(newTeam, newOpp, newDrafted);
    }
  }

  function pick(w) {
    setTeam(t => {
      if (t.find(x=>x.name===w.name)) return t.filter(x=>x.name!==w.name);
      if (t.length>=5) return t; return [...t,w];
    });
  }

  function goToWar() {
    const remaining = pool.filter(w => !team.find(t => t.name===w.name || areAliases(t.name, w.name)));
    const opponent = [...remaining].sort(()=>Math.random()-0.5).slice(0,5);
    setOpp(opponent);
    const { events, playerWins, starRating } = simulate([...team],[...opponent], noDq);
    setLog(events);
    const ms=teamScore(team), os=teamScore(opponent);
    const dispProb=Math.round(Math.min(88,Math.max(12,(ms/(ms+os))*100)));
    const newStreak=playerWins?streak+1:0;
    if(playerWins){ setStreak(newStreak); setBest(b=>Math.max(b,newStreak)); }
    else          { setBest(b=>Math.max(b,streak)); setStreak(0); }
    setResult({ won:playerWins, prob:dispProb, newStreak, starRating, noDqUsed:noDq, wargames:false }); setPhase("result");
  }

  const SEED_YEAR_LABELS = Object.keys(SEED_DATA).sort().map(yr => {
    const g = SEED_GENDER[yr] || "Mixed";
    const icon = g === "Women" ? "♀" : g === "Men" ? "♂" : "⚡";
    return `${yr} (${icon} ${g})`;
  }).join("  ·  ");

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase==="menu") return (
    <div style={ROOT}><style>{GCSS}</style>
    <div style={TOPBAR}>5-STAR CHALLENGE</div>
    <div style={{textAlign:"center",padding:"36px 24px 20px"}}>
      <div style={{fontSize:10,letterSpacing:6,color:"#555",fontFamily:"Arial",marginBottom:4}}>WELCOME TO THE</div>
      <div style={{fontSize:44,lineHeight:1,letterSpacing:2,background:"linear-gradient(180deg,#FFD700 0%,#ff8800 60%,#cc4400 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        5-STAR CHALLENGE
      </div>
      <div style={{fontSize:13,color:"#666",letterSpacing:3,marginTop:6,fontFamily:"Arial"}}>How do you want to build your 5-man team?</div>

      {/* Easy / Hard mode toggle */}
      <div style={{display:"flex",justifyContent:"center",marginTop:18}}>
        <div style={{display:"flex",background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,overflow:"hidden"}}>
          {[["easy","🟢 EASY"],["hard","⬛ HARD"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>setMode(m)} style={{padding:"9px 18px",background:mode===m?(m==="easy"?"linear-gradient(135deg,#1a4a1a,#0a2a0a)":"linear-gradient(135deg,#4a0a0a,#2a0000)"):"transparent",border:"none",borderRight:m==="easy"?"1px solid rgba(255,255,255,0.1)":"none",color:mode===m?(m==="easy"?"#00e554":"#f54748"):"#444",fontSize:12,fontFamily:'"Impact",Arial',letterSpacing:2,cursor:"pointer",textTransform:"uppercase"}}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,color:"#3a3a3a",fontFamily:"Arial",marginTop:4,letterSpacing:1}}>
        {mode==="easy"?"Easy: colour-coded quality badges visible — make informed picks":"Hard: badges hidden — draft by name only and test your graps knowledge"}
      </div>

      {/* Stats */}
      <div style={{display:"flex",justifyContent:"center",margin:"16px auto 0",maxWidth:320,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,215,0,0.14)",borderRadius:10,overflow:"hidden"}}>
        {gameMode==="survivor"
          ? [{val:streak,label:"STREAK"},{val:best,label:"BEST STREAK"}].map((s,i)=>(
              <div key={i} style={{flex:1,padding:"14px 8px",textAlign:"center",borderLeft:i>0?"1px solid rgba(255,255,255,0.06)":"none"}}>
                <div style={{fontSize:40,color:"#FFD700",lineHeight:1,animation:"goldGlow 3s ease-in-out infinite"}}>{s.val}</div>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,fontFamily:"Arial",marginTop:3}}>{s.label}</div>
              </div>
            ))
          : [{val:formatStars(bestStars||0),label:"BEST MATCH"},{val:gameMode==="wargames"?"WARGAMES":"SURVIVOR",label:"MODE"}].map((s,i)=>(
              <div key={i} style={{flex:1,padding:"14px 8px",textAlign:"center",borderLeft:i>0?"1px solid rgba(255,255,255,0.06)":"none"}}>
                <div style={{fontSize:i===0?28:18,color:"#FFD700",lineHeight:1,animation:"goldGlow 3s ease-in-out infinite",fontFamily:i===1?'"Impact",Arial':"inherit"}}>{s.val||"—"}</div>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,fontFamily:"Arial",marginTop:3}}>{s.label}</div>
              </div>
            ))
        }
      </div>

      {/* Main action buttons */}
      <div style={{marginTop:18,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button style={mkBtn(true)} onClick={startDraft}>⚡ NEW DRAFT</button>
        <button onClick={()=>setShowStip(s=>!s)} style={{...mkBtn(false),color:showStip?"#FFD700":"#888",borderColor:showStip?"rgba(255,215,0,0.4)":"rgba(255,255,255,0.1)"}}>
          📋 STIPULATION {showStip?"▲":"▼"}
        </button>
        <button style={mkBtn(false)} onClick={()=>setPhase("manage")}>✏️ ROSTER</button>
      </div>

      {/* ── Stipulation Panel ──────────────────────────────────────────────── */}
      {showStip && (
        <div style={{margin:"14px auto 0",maxWidth:440,background:"rgba(0,0,0,0.55)",border:"1px solid rgba(255,215,0,0.22)",borderRadius:10,padding:"16px 18px",textAlign:"left"}}>
          <div style={{fontSize:13,color:"#FFD700",fontFamily:'"Impact",Arial',letterSpacing:3,marginBottom:12,textAlign:"center",fontWeight:"bold"}}>CHOOSE YOUR MODE</div>

          {/* Survivor / Wargames */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:"#555",fontFamily:"Arial",letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Match Type</div>
            <div style={{display:"flex",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,overflow:"hidden"}}>
              {[["survivor","⚔️ SURVIVOR"],["wargames","🌟 WARGAMES"]].map(([val,lbl])=>(
                <button key={val} onClick={()=>setGameMode(val)} style={{flex:1,padding:"9px 8px",background:gameMode===val?"linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,157,0,0.1))":"transparent",border:"none",borderRight:val==="survivor"?"1px solid rgba(255,255,255,0.1)":"none",color:gameMode===val?"#FFD700":"#444",fontSize:11,fontFamily:'"Impact",Arial',letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:"#3a3a3a",fontFamily:"Arial",marginTop:4}}>
              {gameMode==="survivor"
                ? "Pick 5 from 16 wrestlers. Build the longest undefeated streak you can."
                : "5 rounds. Draft 1 wrestler per round. Aim for the perfect 5-Star match!"}
            </div>
          </div>

          {/* No DQ */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:"#555",fontFamily:"Arial",letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Rules</div>
            <button onClick={()=>setNoDq(n=>!n)} style={{width:"100%",padding:"9px 14px",background:noDq?"linear-gradient(135deg,#4a3000,#8a5500)":"rgba(0,0,0,0.3)",border:`1px solid ${noDq?"#ff9d00":"rgba(255,255,255,0.1)"}`,color:noDq?"#ff9d00":"#555",fontSize:12,fontFamily:'"Impact",Arial',letterSpacing:2,cursor:"pointer",borderRadius:5,textTransform:"uppercase",textAlign:"left"}}>
              ⚡ NO DISQUALIFICATION: {noDq?"ON":"OFF"}
            </button>
          </div>

          {/* Gender */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:"#555",fontFamily:"Arial",letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Pool</div>
            <div style={{display:"flex",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,overflow:"hidden"}}>
              {[["intergender","⚡ INTERGENDER"],["men","♂ MEN"],["women","♀ WOMEN"]].map(([val,lbl])=>{
                const activeBg = "linear-gradient(135deg,rgba(100,100,255,0.2),rgba(60,60,200,0.1))";
                const activeC = val==="women"?"#f472b6":val==="men"?"#3da9fc":"#c084fc";
                return (
                  <button key={val} onClick={()=>setGenderMode(val)} style={{flex:1,padding:"9px 4px",background:genderMode===val?activeBg:"transparent",border:"none",borderRight:val!=="women"?"1px solid rgba(255,255,255,0.1)":"none",color:genderMode===val?activeC:"#444",fontSize:10,fontFamily:'"Impact",Arial',letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emojis */}
          <div>
            <button onClick={()=>setShowEmojis(e=>!e)} style={{width:"100%",padding:"9px 14px",background:showEmojis?"rgba(255,215,0,0.08)":"rgba(0,0,0,0.3)",border:`1px solid ${showEmojis?"rgba(255,215,0,0.3)":"rgba(255,255,255,0.1)"}`,color:showEmojis?"#FFD700":"#555",fontSize:12,fontFamily:'"Impact",Arial',letterSpacing:2,cursor:"pointer",borderRadius:5,textTransform:"uppercase",textAlign:"left"}}>
              {showEmojis?"😊 EMOJIS: ON":"😐 EMOJIS: OFF"}
            </button>
          </div>
        </div>
      )}

      {/* How to Play */}
      <div style={{margin:"20px auto 0",maxWidth:420,background:"rgba(255,215,0,0.03)",border:"1px solid rgba(255,215,0,0.1)",borderRadius:10,padding:"14px 18px",fontFamily:"Arial",fontSize:13,color:"#666",lineHeight:1.75,textAlign:"left"}}>
        <div style={{color:"#FFD700",fontSize:10,letterSpacing:3,marginBottom:7}}>HOW TO PLAY</div>
        {gameMode==="wargames"
          ? <>You're given 16 wrestlers from a random year (1991–2025). Pick 5 to form your team. The wrestlers you skip join the opposition. <strong style={{color:"#FFD700"}}>Build a 5-Star match.</strong></>
          : <>You're given 16 wrestlers from a random year (1991–2025). Pick 5 to form your team. The wrestlers you skip join the opposition. Build the longest undefeated streak you can.</>
        }
        
      </div>

      {/* Disclaimer */}
      <div style={{marginTop:18,maxWidth:420,margin:"14px auto 0",fontSize:9,color:"#2a2a2a",fontFamily:"Arial",lineHeight:1.5,textAlign:"center",padding:"0 8px"}}>
        5-Star Challenge is an independent project and is not affiliated with, endorsed by, or sponsored by any wrestling company or any individual named.
      </div>
    </div></div>
  );

  // ── MANAGE ROSTER ─────────────────────────────────────────────────────────
  // ── MANAGE ROSTER ─────────────────────────────────────────────────────────
  if (phase==="manage") {
    const INP={padding:"9px 12px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",borderRadius:5,fontSize:13,fontFamily:"Arial",width:"100%"};
    return (
      <div style={ROOT}><style>{GCSS}</style>
      <div style={TOPBAR}>5-STAR CHALLENGE</div>
      <div style={{padding:"18px",maxWidth:580,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:26,color:"#FFD700",letterSpacing:2}}>MANAGE ROSTER</div>
          <button style={mkBtn(false)} onClick={()=>setPhase("menu")}>← BACK</button>
        </div>
        <div style={{background:"rgba(0,0,0,0.42)",border:"1px solid rgba(255,215,0,0.18)",borderRadius:10,padding:"15px 16px",marginBottom:22}}>
          <div style={{fontSize:10,color:"#FFD700",letterSpacing:3,marginBottom:13}}>ADD WRESTLER</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 140px",gap:8,marginBottom:8}}>
            <input placeholder="Wrestler name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={INP}/>
            <input placeholder="Rank (1-500)" value={form.rank} onChange={e=>setForm(f=>({...f,rank:e.target.value}))} type="number" min="1" max="500" style={INP}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:11}}>
            <div><div style={{fontSize:9,color:"#444",fontFamily:"Arial",letterSpacing:1,marginBottom:4}}>ACTIVE FROM (optional)</div>
              <input placeholder="e.g. 1998" value={form.yearMin} onChange={e=>setForm(f=>({...f,yearMin:e.target.value}))} type="number" min="1991" max="2025" style={INP}/></div>
            <div><div style={{fontSize:9,color:"#444",fontFamily:"Arial",letterSpacing:1,marginBottom:4}}>ACTIVE TO (optional)</div>
              <input placeholder="e.g. 2004" value={form.yearMax} onChange={e=>setForm(f=>({...f,yearMax:e.target.value}))} type="number" min="1991" max="2025" style={INP}/></div>
          </div>
          {formErr&&<div style={{color:"#f54748",fontFamily:"Arial",fontSize:12,marginBottom:8}}>{formErr}</div>}
          <button style={{...mkBtn(true),fontSize:15}} onClick={addCustomWrestler} disabled={saving}>{saving?"SAVING...":"+ ADD TO ROSTER"}</button>
          <div style={{fontSize:10,color:"#3a3a3a",fontFamily:"Arial",marginTop:7}}>Leave year fields blank to include in every round.</div>
        </div>
        <div style={{fontSize:9,color:"#444",letterSpacing:3,marginBottom:9}}>CUSTOM WRESTLERS ({custom.length})</div>
        {custom.length===0
          ?<div style={{color:"#333",fontFamily:"Arial",fontSize:13,textAlign:"center",padding:"28px 0"}}>No custom wrestlers yet.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:5}}>
            {custom.map(w=>(
              <div key={w.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7,padding:"8px 11px"}}>
                <RankBadge rank={w.rank} mode="easy" size={28}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,color:"#ddd",fontFamily:'"Impact",Arial'}}>{w.name}</div>
                  <div style={{fontSize:9,color:"#444",fontFamily:"Arial",marginTop:1}}>{w.yearMin||w.yearMax?`Active: ${w.yearMin??"any"} – ${w.yearMax??"any"}`:"All years"}</div>
                </div>
                <button onClick={()=>removeCustom(w.id)} style={{background:"rgba(245,71,72,0.12)",border:"1px solid rgba(245,71,72,0.28)",color:"#f54748",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"Arial",letterSpacing:1}}>REMOVE</button>
              </div>
            ))}
          </div>}
      </div></div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (phase==="loading") return (
    <div style={{...ROOT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:14}}>
      <style>{GCSS}</style>
      <div style={{fontSize:44,animation:"spin 1.2s linear infinite"}}>🎤</div>
      <div style={{fontSize:26,color:"#FFD700",letterSpacing:3}}>{year} Rankings</div>
      <div style={{fontSize:11,color:"#444",fontFamily:"Arial",letterSpacing:2}}>LOADING ROSTER...</div>
    </div>
  );

  // ── DRAFT ────────────────────────────────────────────────────────────────
  if (phase==="draft") {
    const noteLabel=poolNote==="seed"?"★ CURATED":poolNote==="api"?"":"[sample]";
    const noteColor=poolNote==="seed"?"#FFD700":"#2a2a2a";
    const isWG = gameMode==="wargames";

    // ── WARGAMES DRAFT ──────────────────────────────────────────────────────
    if (isWG) return (
      <div style={{...ROOT,minHeight:"100vh"}}><style>{GCSS}</style>
      <div style={TOPBAR}>5-STAR CHALLENGE</div>
      <div style={{padding:"12px 13px"}}>
        {/* Round header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <span style={{fontSize:10,color:"#FFD700",fontFamily:"Arial",letterSpacing:3}}>ROUND {wgRound} / 5 </span>
            <span style={{fontSize:28,color:"#FFD700"}}>{wgYear}</span>
            <span style={{fontSize:10,color:"#444",fontFamily:"Arial",marginLeft:6}}>Rankings{noteLabel&&<span style={{color:noteColor,marginLeft:4}}>{noteLabel}</span>}</span>
          </div>
          <div style={{display:"flex",gap:5}}>
            {noDq&&<span style={{fontSize:9,color:"#ff9d00",fontFamily:"Arial",padding:"2px 6px",border:"1px solid rgba(255,157,0,0.4)",borderRadius:3}}>⚡ NO DQ</span>}
          </div>
        </div>

        {/* Round progress bar */}
        <div style={{display:"flex",gap:3,marginBottom:8}}>
          {Array.from({length:5}).map((_,i)=>(
            <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<wgRound-1?"#FFD700":i===wgRound-1?"rgba(255,215,0,0.5)":"rgba(255,255,255,0.08)"}}/>
          ))}
        </div>

        <div style={{fontSize:10,color:"#888",fontFamily:"Arial",letterSpacing:1,marginBottom:9}}>
          PICK 1 WRESTLER — THE OPPOSITION CLAIMS THE BEST AVAILABLE
        </div>

        {/* Pool grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:5,marginBottom:11}}>
          {pool.map((w,i)=>{
            const c=rankColor(w.rank), gl=rankGlow(w.rank);
            const bdr=mode==="easy"?c:"rgba(255,255,255,0.1)";
            return (
              <div key={i} onClick={()=>pickWargames(w)} style={{background:mode==="easy"?`linear-gradient(145deg,${c}10,${c}22)`:"rgba(255,255,255,0.05)",border:`2px solid ${bdr}`,borderRadius:7,padding:"8px 8px 6px",cursor:"pointer",minHeight:70,display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:mode==="easy"?`0 0 8px ${gl}`:"none",transition:"opacity 0.1s"}}>
                <div style={{display:"flex",justifyContent:"flex-end"}}>
                  <RankBadge rank={w.rank} mode={mode} size={26}/>
                </div>
                <div>
                  <div style={{fontSize:12,fontFamily:'"Impact","Arial Narrow",Arial',color:mode==="easy"?c:"#ccc",lineHeight:1.2,marginBottom:2}}>{w.name}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
                    {w.custom&&<span style={{fontSize:8,color:"#FFD70077",fontFamily:"Arial"}}>★</span>}
                    {showEmojis&&w.specialType==="guest"&&<span style={{fontSize:9}}>⭐</span>}
                    {showEmojis&&w.specialType==="manager"&&<span style={{fontSize:9}}>🎙️</span>}
                    {w.female&&<span style={{fontSize:9,background:"#f472b6",color:"#fff",borderRadius:3,padding:"0 3px",fontWeight:"bold",lineHeight:"1.4",fontFamily:"Arial"}}>♀</span>}
                    {showEmojis&&w.persona==="face"&&<span style={{fontSize:9}}>😇</span>}
                    {showEmojis&&w.persona==="heel"&&<span style={{fontSize:9}}>😈</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team progress */}
        {team.length > 0 && (
          <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,215,0,0.14)",borderRadius:7,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:"#444",fontFamily:"Arial",letterSpacing:2,marginBottom:5}}>YOUR TEAM ({team.length}/5)</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {team.map((w,i)=>(
                <div key={i} style={{padding:"3px 8px",background:mode==="easy"?`${rankColor(w.rank)}20`:"rgba(255,255,255,0.07)",border:`1px solid ${mode==="easy"?rankColor(w.rank)+"44":"rgba(255,255,255,0.15)"}`,borderRadius:4}}>
                  <span style={{fontSize:11,fontFamily:'"Impact",Arial',color:mode==="easy"?rankColor(w.rank):"#ccc"}}>{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div></div>
    );

    // ── SURVIVOR DRAFT ──────────────────────────────────────────────────────
    return (
      <div style={{...ROOT,minHeight:"100vh"}}><style>{GCSS}</style>
      <div style={TOPBAR}>5-STAR CHALLENGE</div>
      <div style={{padding:"12px 13px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span style={{fontSize:34,color:"#FFD700"}}>{year}</span>
            <span style={{fontSize:10,color:"#444",fontFamily:"Arial",letterSpacing:2}}>Rankings</span>
            {noteLabel&&<span style={{fontSize:9,color:noteColor,fontFamily:"Arial",letterSpacing:1}}>{noteLabel}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {noDq&&<span style={{fontSize:9,color:"#ff9d00",fontFamily:"Arial",padding:"2px 6px",border:"1px solid rgba(255,157,0,0.4)",borderRadius:3}}>⚡ NO DQ</span>}
            {genderMode!=="intergender"&&<span style={{fontSize:9,color:genderMode==="women"?"#f472b6":"#3da9fc",fontFamily:"Arial",padding:"2px 6px",border:`1px solid ${genderMode==="women"?"rgba(244,114,182,0.4)":"rgba(61,169,252,0.4)"}`,borderRadius:3}}>{genderMode==="women"?"♀ WOMEN":"♂ MEN"}</span>}
            <span style={{fontSize:10,fontFamily:"Arial",letterSpacing:1,padding:"3px 8px",background:mode==="easy"?"rgba(0,229,84,0.1)":"rgba(245,71,72,0.1)",border:`1px solid ${mode==="easy"?"rgba(0,229,84,0.3)":"rgba(245,71,72,0.3)"}`,borderRadius:3,color:mode==="easy"?"#00e554":"#f54748"}}>{mode==="easy"?"EASY":"HARD"}</span>
            <span style={{fontFamily:"Arial",fontSize:11,color:"#444"}}>Streak: <span style={{color:"#FFD700"}}>{streak}</span><span style={{margin:"0 5px",color:"#2a2a2a"}}>·</span>Best: <span style={{color:"#FFD700"}}>{best}</span></span>
          </div>
        </div>
        <div style={{fontSize:9,color:"#3a3a3a",fontFamily:"Arial",letterSpacing:2,marginBottom:9}}>PICK YOUR 5 — SKIPPED WRESTLERS JOIN THE OPPOSITION</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:5,marginBottom:11}}>
          {pool.map((w,i)=>{
            const sel=!!team.find(t=>t.name===w.name), dis=!sel&&team.length>=5;
            const c=rankColor(w.rank), gl=rankGlow(w.rank);
            const bdr=mode==="easy"?(sel?c:"rgba(255,255,255,0.07)"):(sel?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.07)");
            const bg=mode==="easy"?(sel?`linear-gradient(145deg,${c}12,${c}25)`:"rgba(255,255,255,0.04)"):(sel?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)");
            const shd=mode==="easy"?(sel?`0 0 11px ${gl}`:"none"):(sel?"0 0 10px rgba(255,255,255,0.15)":"none");
            return (
              <div key={i} onClick={!dis?()=>pick(w):undefined} style={{background:bg,border:`2px solid ${bdr}`,borderRadius:7,padding:"8px 8px 6px",cursor:dis?"not-allowed":"pointer",opacity:dis?0.28:1,boxShadow:shd,transition:"border-color 0.12s,background 0.12s",minHeight:70,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  {sel?<div style={{width:13,height:13,borderRadius:"50%",background:mode==="easy"?c:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#000",fontWeight:"bold"}}>✓</span></div>:<span/>}
                  <RankBadge rank={w.rank} mode={mode} size={26}/>
                </div>
                <div>
                  <div style={{fontSize:12,fontFamily:'"Impact","Arial Narrow",Arial',letterSpacing:0.4,color:sel?(mode==="easy"?c:"#fff"):"#bbb",lineHeight:1.2,marginBottom:2}}>{w.name}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
                    {w.custom&&<span style={{fontSize:8,color:"#FFD70077",fontFamily:"Arial"}}>★</span>}
                    {showEmojis&&w.specialType==="guest"&&<span style={{fontSize:9}}>⭐</span>}
                    {showEmojis&&w.specialType==="manager"&&<span style={{fontSize:9}}>🎙️</span>}
                    {w.female&&<span style={{fontSize:9,background:"#f472b6",color:"#fff",borderRadius:3,padding:"0 3px",fontWeight:"bold",lineHeight:"1.4",fontFamily:"Arial"}}>♀</span>}
                    {showEmojis&&w.persona==="face"&&<span style={{fontSize:9}}>😇</span>}
                    {showEmojis&&w.persona==="heel"&&<span style={{fontSize:9}}>😈</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,215,0,0.14)",borderRadius:7,padding:"8px 10px",marginBottom:10}}>
          <div style={{fontSize:9,color:"#444",fontFamily:"Arial",letterSpacing:2,marginBottom:6}}>YOUR TEAM ({team.length}/5)</div>
          <div style={{display:"flex",gap:5}}>
            {Array.from({length:5}).map((_,i)=>{
              const w=team[i];
              if(!w) return <div key={i} style={{flex:1,height:46,border:"2px dashed rgba(255,255,255,0.08)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#222",fontSize:16}}>?</span></div>;
              const c=rankColor(w.rank);
              return <div key={i} onClick={()=>pick(w)} style={{flex:1,height:46,background:mode==="easy"?`${c}12`:"rgba(255,255,255,0.08)",border:`2px solid ${mode==="easy"?`${c}45`:"rgba(255,255,255,0.2)"}`,borderRadius:5,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:"0 3px"}}>
                <RankBadge rank={w.rank} mode={mode} size={16}/>
                <span style={{fontSize:8,color:"#aaa",fontFamily:"Arial",textAlign:"center",marginTop:2,lineHeight:1.1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",maxWidth:"100%"}}>{w.name.split(" ").pop()}</span>
              </div>;
            })}
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <button style={{...mkBtn(true),opacity:team.length<5?0.28:1,cursor:team.length<5?"not-allowed":"pointer"}} onClick={team.length===5?goToWar:undefined}>
            {noDq?"⚡ NO RULES — GO TO WAR!":"⚔️ GO TO WAR!"}
          </button>
          {team.length<5&&<div style={{fontSize:10,color:"#333",fontFamily:"Arial",marginTop:5}}>Pick {5-team.length} more wrestler{5-team.length!==1?"s":""}</div>}
        </div>
      </div></div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase==="result") {
    const {won,prob,newStreak,starRating,noDqUsed,wargames:isWargamesResult}=result;
    const note=won&&newStreak>=50?"PHENOMENAL RUN!":won&&newStreak>=25?"ON FIRE!":won&&newStreak>=10?"IMPRESSIVE!":"";
    return (
      <div style={{...ROOT,minHeight:"100vh"}}><style>{GCSS}</style>
      <div style={TOPBAR}>5-STAR CHALLENGE</div>
      <div style={{padding:"18px 14px",maxWidth:620,margin:"0 auto"}}>
        <div style={{textAlign:"center",padding:"20px 14px",background:won?"linear-gradient(135deg,rgba(0,150,50,0.09),rgba(0,45,15,0.18))":"linear-gradient(135deg,rgba(150,0,0,0.09),rgba(45,0,0,0.18))",border:`2px solid ${won?"#00e554":"#f54748"}`,borderRadius:11,marginBottom:15}}>
          <div style={{fontSize:52,lineHeight:1}}>{won?"🏆":"💀"}</div>
          <div style={{fontSize:50,letterSpacing:5,color:won?"#00e554":"#f54748",animation:"stampIn 0.35s ease both",lineHeight:1,marginTop:4}}>{won?"VICTORY":"ELIMINATED"}</div>
          <div style={{fontSize:12,color:"#555",fontFamily:"Arial",marginTop:5}}>
            {isWargamesResult
              ? <span style={{color:"#FFD700"}}>⭐ Wargames Draft Complete</span>
              : won ? <><>Streak: </><strong style={{color:"#FFD700"}}>{newStreak}</strong>{note&&<span style={{color:"#FFD700"}}> — {note}</span>}</> : <>Streak ended · Best: <strong style={{color:"#FFD700"}}>{best}</strong></>
            }
          </div>
          {/* Star rating */}
          <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:22,color:"#FFD700",letterSpacing:1}}>{formatStars(starRating)}</span>
            <span style={{fontSize:11,color:"#666",fontFamily:"Arial"}}>{starRating.toFixed(2)} stars{noDqUsed?" · No DQ":""}</span>
          </div>
          <div style={{fontSize:10,color:"#2e2e2e",fontFamily:"Arial",marginTop:3}}>Estimated win probability: {prob}%</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          <TeamPanel label="Your Team" wrestlers={team} highlight mode={mode}/>
          <TeamPanel label="Opponent"  wrestlers={opp}  mode={mode}/>
        </div>
        <div style={{background:"rgba(0,0,0,0.45)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"11px 12px",marginBottom:17}}>
          <div style={{fontSize:9,color:"#333",fontFamily:"Arial",letterSpacing:3,marginBottom:7}}>MATCH SUMMARY</div>
          {log.map((ev,i)=>{
            const isCheat=ev.type==="cheat";
            const isTheatric=ev.type==="theatric";
            const col=isTheatric?"#FFD700":isCheat?"#ff9d00":ev.type==="win"?"#00e554":"#f54748";
            const icon=isTheatric?"✨":isCheat?"⚡":ev.type==="win"?"✓":"✕";
            const textCol=isTheatric?"#fff9c4":isCheat?"#ffd88a":ev.type==="win"?"#aaffcc":"#ffaaaa";
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.03)",animation:`fadeIn 0.22s ease ${i*0.04}s both`}}>
                <span style={{width:17,height:17,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",flexShrink:0}}>{icon}</span>
                <span style={{fontSize:12,fontFamily:"Arial",color:textCol}}>{ev.msg}</span>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:9,justifyContent:"center"}}>
          {isWargamesResult
            ? <button style={mkBtn(true)} onClick={startDraft}>🌟 NEW WARGAMES DRAFT</button>
            : won ? <button style={mkBtn(true)} onClick={startDraft}>⚡ NEXT DRAFT</button>
                  : <button style={mkBtn(true)} onClick={()=>{setStreak(0);startDraft();}}>🔄 TRY AGAIN</button>
          }
          <button style={mkBtn(false)} onClick={()=>setPhase("menu")}>🏠 MENU</button>
        </div>
      </div></div>
    );
  }
  return null;
}
