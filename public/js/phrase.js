/* a bit modded version of http://metal-sole.com/2012/10/12/random-phrases-computers-is-funny/   */

var MMPhraseGenerator = {
    phrase              : function() {
        return  this.adjective().charAt(0).toUpperCase() + this.adjective().slice(1) + " " + // capitalize
                this.noun() + " " + 
                this.verb() + " " + 
                this.noun() + " while visiting " + 
                this.places()
    },

    name                : function() {
        return this.randomItemFrom(this.names);
    },
    noun                : function() {
        return this.randomItemFrom(this.nouns);
    },  
    verb                : function() {
        return this.randomItemFrom(this.verbs);
    },  
    adjective           : function() {
        return this.randomItemFrom(this.adjectives);
    },
    adverb              : function() {
        return this.randomItemFrom(this.adverbs);
    },
    places                : function() {
        return this.randomItemFrom(this.place);
    },  
    randomItemFrom      : function(array) {
        return array[(this.randomNumber(0, (array.length - 1) ))];
    },
    randomNumber        : function(minNumber, maxNumber) {
        
        if ( minNumber > maxNumber ) {
            minNumber                               = 1;
            maxNumber                               = 10;
        }

        var randomNumber                            = (Math.floor(Math.random() * maxNumber)) + minNumber;
        return randomNumber;
    },
    isHeads             : function() {
        flip                                        = this.randomNumber(0, 1);
        return flip == 1;
    },

    // crush nouns and names together */
    nouns               : [
            "Aaron Burr",
            "Abraham Lincoln",
            "Adlai E. Stevenson",
            "Al Gore",
            "Alben Barkley",
            "Andrew Jackson",
            "Andrew Johnson",
            "Barack Obama",
            "Benjamin Harrison",
            "Bill Clinton",
            "Calvin Coolidge",
            "Charles Curtis",
            "Charles Dawes",
            "Charles Fairbanks",
            "Chester Arthur",
            "Dan Quayle",
            "Daniel D. Tompkins",
            "Dick Cheney",
            "Dwight D. Eisenhower",
            "Elbridge Gerry",
            "Franklin D. Roosevelt",
            "Franklin Pierce",
            "Garret Hobart",
            "George Bush",
            "George Clinton",
            "George M. Dallas",
            "George W. Bush",
            "George Washington",
            "Gerald Ford",
            "Grover Cleveland",
            "Hannibal Hamlin",
            "Harry S Truman",
            "Henry A. Wallace",
            "Henry Wilson",
            "Herbert Hoover",
            "Hubert Humphrey",
            "James A. Garfield",
            "James Buchanan",
            "James K. Polk",
            "James Madison",
            "James Monroe",
            "James S. Sherman",
            "Jimmy Carter",
            "Joe Biden ",
            "John Adams",
            "John C. Breckinridge",
            "John C. Calhoun",
            "John F. Kennedy",
            "John Nance Garner",
            "John Quincy Adams",
            "John Tyler",
            "Levi P. Morton",
            "Lyndon B. Johnson",
            "Martin Van Buren",
            "Millard Fillmore",
            "Nelson Rockefeller",
            "Richard M. Johnson",
            "Richard Nixon",
            "Ronald Reagan",
            "Rutherford B. Hayes",
            "Schuyler Colfax",
            "Spiro Agnew",
            "Theodore Roosevelt",
            "Thomas Hendricks",
            "Thomas Jefferson",
            "Thomas R. Marshall",
            "Ulysses S. Grant",
            "Walter Mondale",
            "Warren G. Harding",
            "William Henry Harrison",
            "William Howard Taft",
            "William King",
            "William McKinley",
            "William Wheeler",
            "Woodrow Wilson",
            "Zachary Taylor",
            "time",
            "person",
            "year",
            "way",
            "day",
            "thing",
            "man",
            "world",
            "life",
            "hand",
            "part",
            "child",
            "eye",
            "woman",
            "place",
            "work",
            "week",
            "case",
            "point",
            "government",
            "company",
            "number",
            "group",
            "problem",
            "fact",
            "able",
            "achieve",
            "acoustics",
            "action",
            "activity",
            "aftermath",
            "afternoon",
            "afterthought",
            "apparel",
            "appliance",
            "beginner",
            "believe",
            "bomb",
            "border",
            "boundary",
            "breakfast",
            "cabbage",
            "cable",
            "calculator",
            "calendar",
            "caption",
            "carpenter",
            "cemetery",
            "channel",
            "circle",
            "creator",
            "creature",
            "education",
            "faucet",
            "feather",
            "friction",
            "fruit",
            "fuel",
            "galley",
            "guide",
            "guitar",
            "health",
            "heart",
            "idea",
            "kitten",
            "laborer",
            "language",
            "lawyer",
            "linen",
            "locket",
            "lumber",
            "magic",
            "minister",
            "mitten",
            "money",
            "mountain",
            "music",
            "partner",
            "passenger",
            "pickle",
            "picture",
            "plantation",
            "plastic",
            "pleasure",
            "pocket",
            "police",
            "pollution",
            "railway",
            "recess",
            "reward",
            "route",
            "scene",
            "scent",
            "squirrel",
            "stranger",
            "suit",
            "sweater",
            "temper",
            "territory",
            "texture",
            "thread",
            "treatment",
            "veil",
            "vein",
            "volcano",
            "wealth",
            "weather",
            "wilderness",
            "wren",
            "wrist",
            "writer",

            // additional animals from  http://www.stlzoo.org/animals/abouttheanimals/mammals/listallmammals/

            "Addax",
            "Allen's Swamp Monkey",
            "Amur Leopard",
            "Amur Tiger",
            "Andean Bear",
            "Babirusa",
            "Bactrian Camel",
            "Banteng",
            "Bat-eared Fox",
            "Black and White Colobus Monkey",
            "Black and White Ruffed Lemur",
            "Black-handed Spider Monkey",
            "Black Lemur",
            "Black Rhinoceros",
            "Black-tailed Prairie Dog",
            "Bush Dog",
            "California Sea Lion",
            "Capybara",
            "Central Chinese Goral",
            "Chacoan Peccary",
            "Cheetah",
            "Chimpanzee",
            "Chinchilla",
            "Coquerel's Sifaka",
            "Cotswold Sheep",
            "Cotton-top Tamarin",
            "Degu",
            "Domestic Goat",
            "Dwarf Mongoose",
            "Dwarf Zebu",
            "Elephants",
            "European Polecat",
            "Fennec Fox",
            "Francois Langur",
            "Gerenuk",
            "Goeldi's Monkey",
            "Golden Lion Tamarin",
            "Grevy's Zebra",
            "Grizzly Bear",
            "Guinea Pig",
            "Harbor Seal",
            "Hippopotamus",
            "Indian Muntjac",
            "Jaguar",
            "Kangaroo Rat",
            "Kinkajou",
            "Lesser Kudu",
            "Lion",
            "Lion-tailed Macaque",
            "Malayan Sun Bear",
            "Matschie's Tree Kangaroo",
            "Mexican Hairy Porcupine",
            "Mongoose Lemur",
            "Mountain Bongo",
            "Naked Mole Rat",
            "North American River Otter",
            "Okapi",
            "Opossum",
            "Prevost's Squirrel",
            "Puma",
            "Red-flanked Duiker",
            "Red Kangaroo",
            "Red Panda",
            "Red River Hog",
            "Reticulated Giraffe",
            "Ring-tailed Lemur",
            "Sichuan Takin",
            "Slender-tailed Meerkat",
            "Snow Leopard",
            "Soemmerring's Gazelle",
            "Somali Wild Ass",
            "Spectacled Langur",
            "Speke's Gazelle",
            "Spotted Hyena",
            "Springhaas",
            "St. Vincent's Agouti",
            "Sumatran Orangutan",
            "Tammar Wallaby",
            "Transcaspian Urial",
            "Visayan Warty Pig",
            "Western Lowland Gorilla",
            "White-faced Saki",
            "Woodchuck"
        ],

    // almost all from http://www.airforcewriter.com/strong-action-verbs.htm
    verbs               : [

            "accelerated",
            "accomplished",
            "aced",
            "achieved",
            "acquired",
            "acted",
            "activated",
            "adapted",
            "addressed",
            "adjusted",
            "administered",
            "advised",
            "aided",
            "alerted",
            "allocated",
            "analyzed",
            "annihilated",
            "anticipated",
            "applied",
            "appraised",
            "approved",
            "arranged",
            "assembled",
            "asserted",
            "assessed",
            "assigned",
            "assisted",
            "attacked",
            "audited",
            "augmented",
            "authored",
            "automated",
            "averted",
            "avoided",
            "balanced",
            "banned",
            "battled",
            "beefed up",
            "bested",
            "bolstered",
            "bought",
            "braced",
            "braved",
            "broke",
            "budgeted",
            "built",
            "bulldogged",
            "busted",
            "calculated",
            "capitalized",
            "captured",
            "cataloged",
            "centralized",
            "certified",
            "chaired",
            "challenged",
            "championed",
            "changed",
            "channeled",
            "charged",
            "choked",
            "clarified",
            "coached",
            "collaborated",
            "collected",
            "commanded",
            "commandeered",
            "communicated",
            "competed",
            "completed",
            "complied",
            "composed",
            "conceived",
            "conceptualized",
            "conciliated",
            "condensed",
            "conducted",
            "conquered",
            "conserved",
            "consolidated",
            "constructed",
            "contained",
            "contracted",
            "contributed",
            "controlled",
            "convened",
            "converted",
            "coordinated",
            "corrected",
            "counseled",
            "created",
            "critiqued",
            "crushed",
            "cultivated",
            "cut",
            "dashed",
            "decreased",
            "dedicated",
            "defined",
            "defused",
            "delivered",
            "demolished",
            "demonstrated",
            "deployed",
            "designed",
            "destroyed",
            "developed",
            "devised",
            "devoted",
            "devoured",
            "diagnosed",
            "directed",
            "disciplined",
            "discovered",
            "dispatched",
            "distributed",
            "documented",
            "doubled",
            "drafted",
            "drove",
            "edited",
            "educated",
            "effected",
            "elevated",
            "eliminated",
            "employed",
            "empowered",
            "enabled",
            "encouraged",
            "enforced",
            "engineered",
            "enhanced",
            "enlarged",
            "enriched",
            "ensured",
            "eradicated",
            "escalated",
            "evaluated",
            "exceeded",
            "executed",
            "expanded",
            "exploited",
            "fabricated",
            "facilitated",
            "familiarized",
            "fashioned",
            "featured",
            "fine tuned",
            "fixed",
            "focused",
            "forced",
            "forecasted",
            "forged",
            "formed",
            "formulated",
            "fortified",
            "founded",
            "governed",
            "grabbed",
            "grasped",
            "guarded",
            "hammered",
            "handled",
            "headed",
            "identified",
            "illustrated",
            "implemented",
            "imposed",
            "improved",
            "improvised",
            "indexed",
            "indoctrinated",
            "informed",
            "infused",
            "initiated",
            "inserted",
            "inspected",
            "inspired",
            "installed",
            "instilled",
            "instructed",
            "instrumental",
            "integrated",
            "interpreted",
            "introduced",
            "invented",
            "investigated",
            "isolated",
            "launched",
            "lectured",
            "led",
            "leveraged",
            "maintained",
            "managed",
            "Maneuvered",
            "manipulated",
            "marketed",
            "marshalled",
            "mastered",
            "masterminded",
            "mentored",
            "migrated",
            "mobilized",
            "moderated",
            "modified",
            "motivated",
            "multiplied",
            "nailed",
            "navigated",
            "negotiated",
            "obliberated",
            "orchestrated",
            "ordered",
            "organized",
            "overhauled",
            "participated",
            "perfected",
            "performed",
            "persevered",
            "pile driver",
            "piloted",
            "pinpointed",
            "pioneered",
            "polished",
            "predicted",
            "prioritized",
            "produced",
            "promoted",
            "proposed",
            "protected",
            "provided",
            "recognized",
            "recorded",
            "recovered",
            "rectified",
            "reduced",
            "reevaluated",
            "referred",
            "regulated",
            "rehabilitated",
            "reinforced",
            "renewed",
            "repaired",
            "reported",
            "represented",
            "rescued",
            "researched",
            "resolved",
            "restored",
            "restructured",
            "retrieved",
            "revealed",
            "reversed",
            "reviewed",
            "revitalized",
            "revived",
            "salvaged",
            "saved",
            "scheduled",
            "scorched",
            "screened",
            "seized",
            "selected",
            "served",
            "settled",
            "shaped",
            "shielded",
            "slammed",
            "smashed",
            "smoked",
            "sold",
            "solidified",
            "solved",
            "sparked",
            "spearheaded",
            "specified",
            "sponsored",
            "spotted",
            "staffed",
            "standardized",
            "stepped-up",
            "stimulated",
            "stopped",
            "streamlined",
            "strengthened",
            "structured",
            "struggled",
            "studied",
            "summarized",
            "supported",
            "tailored",
            "targeted",
            "taught",
            "terminated",
            "tested",
            "tightened",
            "topped",
            "traded",
            "trained",
            "translated",
            "transmitted",
            "traveled",
            "trimmed",
            "tripled",
            "tuned",
            "undertook",
            "unified",
            "united",
            "upgraded",
            "used",
            "validated",
            "vanquished",
            "verified",
            "vetted",
            "wielded",
            "won",
            "worked",
            "zoom"
        ],

    adjectives          : [
                "good",
                "new",
                "first",
                "last",
                "long",
                "great",
                "little",
                "own",
                "other",
                "old",
                "right",
                "big",
                "high",
                "different",
                "small",
                "large",
                "next",
                "early",
                "young",
                "important",
                "few",
                "public",
                "bad",
                "same",
                "able"
        ],
    place           : [
            "Google",
            "Boston Consulting Group",
            "SAS Institute",
            "Wegmans Food Markets",
            "Edward Jones",
            "NetApp",
            "Camden Property Trust",
            "Recreational Equipment (REI)",
            "CHG Healthcare Services",
            "Quicken Loans",
            "Zappos.com",
            "Mercedes-Benz USA",
            "DPR Construction",
            "DreamWorks Animation",
            "NuStar Energy",
            "Kimpton Hotels & Restaurants",
            "JM Family Enterprises",
            "Chesapeake Energy",
            "Intuit",
            "USAA",
            "Robert W. Baird",
            "The Container Store",
            "Qualcomm",
            "Alston & Bird",
            "Ultimate Software",
            "Burns & McDonnell",
            "Salesforce.com",
            "Devon Energy",
            "PCL Construction",
            "Bingham McCutchen",
            "Scottrade",
            "Whole Foods Market",
            "Goldman Sachs",
            "Nugget Market",
            "Millennium: The Takeda Oncology Co.",
            "Southern Ohio Medical Center",
            "Plante Moran",
            "W. L. Gore & Associates",
            "St. Jude Children's Research Hospital",
            "SVB Financial Group",
            "Adobe",
            "Baptist Health South Florida",
            "Novo Nordisk",
            "Balfour Beatty Construction",
            "National Instruments",
            "Intel",
            "American Fidelity Assurance",
            "PricewaterhouseCoopers",
            "Children's Healthcare of Atlanta",
            "World Wide Technology",
            "Allianz Life Insurance",
            "Autodesk",
            "Methodist Hospital",
            "Baker Donelson",
            "Men's Wearhouse",
            "Scripps Health",
            "Marriott International",
            "Perkins Coie",
            "Ernst & Young",
            "American Express",
            "Nordstrom",
            "Build-A-Bear Workshop",
            "General Mills",
            "TDIndustries",
            "Atlantic Health",
            "QuikTrip",
            "Deloitte",
            "Genentech",
            "Umpqua Bank",
            "Teach For America",
            "Mayo Clinic",
            "EOG Resources",
            "Starbucks",
            "Rackspace Hosting",
            "FactSet Research Systems",
            "Microsoft",
            "Aflac",
            "Publix Super Markets",
            "Mattel",
            "Stryker",
            "SRC",
            "Hasbro",
            "Bright Horizons Family Solutions",
            "Booz Allen Hamilton",
            "Four Seasons Hotels & Resorts",
            "Hitachi Data Systems",
            "The Everett Clinic",
            "OhioHealth",
            "Morningstar",
            "Cisco",
            "CarMax",
            "Accenture",
            "GoDaddy.com",
            "KPMG",
            "Navy Federal Credit Union",
            "Meridian Health",
            "Schweitzer Engineering Labs",
            "Capital One",
            "Darden Restaurants",
            "Intercontinental Hotels Group",
            "Shanghai",
            "Istanbul",
            "Karachi",
            "Mumbai",
            "Moscow",
            "Beijing",
            "Sâ€¹o Paulo",
            "Tianjin",
            "Guangzhou",
            "Delhi",
            "Seoul",
            "Shenzhen",
            "Jakarta",
            "Tokyo",
            "Mexico City",
            "Kinshasa",
            "Tehran",
            "Bangalore",
            "New York City",
            "Dongguan",
            "London",
            "Lagos",
            "Lima",
            "Bogotâ€¡",
            "Ho Chi Minh City",
            "Hong Kong",
            "Bangkok",
            "Dhaka",
            "Hyderabad",
            "Cairo",
            "Hanoi",
            "Wuhan",
            "Rio de Janeiro",
            "Lahore",
            "Ahmedabad",
            "Baghdad",
            "Riyadh",
            "Singapore",
            "Santiago",
            "Saint Petersburg",
            "Chennai",
            "Chongqing",
            "Kolkata",
            "Surat",
            "Yangon",
            "Ankara",
            "Alexandria",
            "Shenyang",
            "Suzhou",
            "New Taipei",
            "Johannesburg",
            "Los Angeles",
            "Yokohama",
            "Abidjan",
            "Busan",
            "Berlin",
            "Cape Town",
            "Durban",
            "Jeddah",
            "Pyongyang",
            "Madrid",
            "Nairobi",
            "Pune",
            "Jaipur",
            "Casablanca"
        ]
};

console.log(MMPhraseGenerator.phrase())
