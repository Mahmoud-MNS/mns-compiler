const mnsQuestions = [
  {
    label: "Question 1",
    title: "Robot Boot Card",
    description: "Print this three-line message. Put each part on its own line.",
    input: "No input.",
    sample: String.raw`[ ROBOT READY ]
Mode: "Explore"
Log file: Logs\boot.txt`,
    linePoints: [20, 40, 40],
    cases: [{ input: "" }]
  },

  {
    label: "Question 2",
    title: "Observatory Reading",
    description: "Store the station number, temperature, and zone in variables of suitable types. Print each reading with its label. Use the default number formatting.",
    input: "An integer station number, a real temperature, and an uppercase zone letter. Example: 7 -2.5 N",
    cases: [
      { input: "7 -2.5 N", expected: "Station: 7\nTemperature: -2.5\nZone: N", points: 40 },
      { input: "24 18.75 E", expected: "Station: 24\nTemperature: 18.75\nZone: E", points: 35 },
      { input: "3 0 S", expected: "Station: 3\nTemperature: 0\nZone: S", points: 25 }
    ]
  },

  {
    label: "Question 3",
    title: "Print Shop Sheets",
    description: "A shop has two packs with the same number of sheets per pack, plus some loose sheets. Calculate and print the total number of sheets.",
    input: "Two nonnegative integers: sheets per pack and loose sheets. Example: 25 8",
    cases: [
      { input: "25 8", expected: "Total: 58", points: 40 },
      { input: "12 0", expected: "Total: 24", points: 30 },
      { input: "0 9", expected: "Total: 9", points: 30 }
    ]
  },

  {
    label: "Question 4",
    title: "Garden Water Tank",
    description: "Declare 0.5 meters as the constant depth of a rectangular tank. Multiply length, width, and depth to get cubic meters, then multiply by 1000 to get liters. Use the default number formatting.",
    input: "Two positive real numbers: length and width in meters. Example: 2.5 1.2",
    cases: [
      { input: "2.5 1.2", expected: "Liters: 1500", points: 35 },
      { input: "1.25 0.5", expected: "Liters: 312.5", points: 40 },
      { input: "4 2", expected: "Liters: 4000", points: 25 }
    ]
  },

  {
    label: "Question 5",
    title: "Warehouse Packing",
    description: "Pack 8 bottles per carton and 6 full cartons per crate. Use integer division and remainder to find full crates, full cartons outside crates, and loose bottles.",
    input: "One nonnegative integer: the total number of bottles. Example: 109",
    cases: [
      { input: "109", expected: "Crates: 2\nCartons: 1\nBottles: 5", points: 40 },
      { input: "48", expected: "Crates: 1\nCartons: 0\nBottles: 0", points: 35 },
      { input: "7", expected: "Crates: 0\nCartons: 0\nBottles: 7", points: 25 }
    ]
  },

  {
    label: "Question 6",
    title: "Pace Per Lap",
    description: "Use static_cast<double> to calculate the average minutes per lap. Print the result with exactly two digits after the decimal point.",
    input: "Two positive integers: total minutes and number of laps. Example: 11 4",
    cases: [
      { input: "11 4", expected: "Average: 2.75", points: 35 },
      { input: "7 3", expected: "Average: 2.33", points: 40 },
      { input: "18 6", expected: "Average: 3.00", points: 25 }
    ]
  },

  {
    label: "Question 7",
    title: "Workshop Estimates",
    description: "Plan A charges a setup fee once, plus the kit price for each kit. Plan B charges both fees for every kit. Calculate both totals and use parentheses to group Plan B's per-kit charges.",
    input: "Three nonnegative integers: setup fee, kit price, and number of kits. Example: 6 4 5",
    cases: [
      { input: "6 4 5", expected: "Plan A: 26\nPlan B: 50", points: 40 },
      { input: "9 2 1", expected: "Plan A: 11\nPlan B: 11", points: 25 },
      { input: "3 7 8", expected: "Plan A: 59\nPlan B: 80", points: 35 }
    ]
  },

  {
    label: "Question 8",
    title: "Letter Gap",
    description: "Print the ASCII code of the first letter. Then subtract the first letter's code from the second letter's code and print the signed difference.",
    input: "Two uppercase English letters separated by a space. Example: D H",
    cases: [
      { input: "D H", expected: "First code: 68\nGap: 4", points: 30 },
      { input: "T C", expected: "First code: 84\nGap: -17", points: 45 },
      { input: "M M", expected: "First code: 77\nGap: 0", points: 25 }
    ]
  },

  {
    label: "Question 9",
    title: "Water Station Status",
    description: "Calculate how many liters the station needs to reach capacity. Store whether it is full in a bool variable and print that value using boolalpha.",
    input: "A one-word station name, current liters, and positive capacity. The last two values are integers and current liters are between zero and capacity. Example: Cedar 18 25",
    cases: [
      { input: "Cedar 18 25", expected: "Station: Cedar\nNeeded: 7\nFull: false", points: 35 },
      { input: "Oak 32 32", expected: "Station: Oak\nNeeded: 0\nFull: true", points: 40 },
      { input: "Pine 0 12", expected: "Station: Pine\nNeeded: 12\nFull: false", points: 25 }
    ]
  },

  {
    label: "Question 10",
    title: "Workshop Material Fee",
    description: "Multiply the fee per attendee by the number of attendees. Calculate the service charge as a percentage of that subtotal, then add it to find the total. Use fixed and setprecision(2) when printing the results.",
    input: "A nonnegative real fee per attendee, a nonnegative integer attendee count, and a nonnegative real service rate as a percentage. Example: 12.5 4 7.5",
    cases: [
      { input: "12.5 4 7.5", expected: "Materials: 50.00\nService: 3.75\nTotal: 53.75", points: 35 },
      { input: "8.25 3 7", expected: "Materials: 24.75\nService: 1.73\nTotal: 26.48", points: 45 },
      { input: "6.5 2 0", expected: "Materials: 13.00\nService: 0.00\nTotal: 13.00", points: 20 }
    ]
  },

  {
    label: "Question 11",
    title: "Museum Ticket",
    description: "A museum charges 4 for visitors younger than 12 and 7 for everyone else. Use if/else to print the ticket price.",
    input: "One nonnegative integer: the visitor's age. Example: 11",
    cases: [
      { input: "11", expected: "Price: 4", points: 30 },
      { input: "12", expected: "Price: 7", points: 45 },
      { input: "28", expected: "Price: 7", points: 25 }
    ]
  },

  {
    label: "Question 12",
    title: "Battery Indicator",
    description: "Print Low below 20 percent, Normal from 20 through 79 percent, and High from 80 percent upward.",
    input: "One integer from 0 to 100. Example: 53",
    cases: [
      { input: "53", expected: "Normal", points: 15 },
      { input: "19", expected: "Low", points: 20 },
      { input: "20", expected: "Normal", points: 25 },
      { input: "79", expected: "Normal", points: 15 },
      { input: "80", expected: "High", points: 25 }
    ]
  },

  {
    label: "Question 13",
    title: "Studio Access",
    description: "Entry is allowed with a booking and an age of at least 16. A staff pass allows entry at any age, even without a booking. Print Allowed or Denied.",
    input: "Three integers: age, booking flag, and staff-pass flag. Each flag is 0 or 1. Example: 16 1 0",
    cases: [
      { input: "16 1 0", expected: "Allowed", points: 30 },
      { input: "15 1 0", expected: "Denied", points: 25 },
      { input: "22 0 0", expected: "Denied", points: 20 },
      { input: "13 0 1", expected: "Allowed", points: 25 }
    ]
  },

  {
    label: "Question 14",
    title: "Robot Service Code",
    description: "A robot needs service if its code is divisible by 6 but not by 5, or if it is divisible by both 5 and 7. Print Service or Skip.",
    input: "One positive integer: the robot's code. Example: 18",
    cases: [
      { input: "18", expected: "Service", points: 25 },
      { input: "30", expected: "Skip", points: 25 },
      { input: "35", expected: "Service", points: 25 },
      { input: "14", expected: "Skip", points: 15 },
      { input: "210", expected: "Service", points: 10 }
    ]
  },

  {
    label: "Question 15",
    title: "Delivery Fee",
    description: "Local delivery costs 3, and remote delivery costs 6. Local delivery is free at a subtotal of 30 or more. The remote fee applies at any subtotal. Print the fee and total with two decimal places.",
    input: "A nonnegative real subtotal and a zone letter: L for local or R for remote. Example: 30 L",
    cases: [
      { input: "30 L", expected: "Delivery: 0.00\nTotal: 30.00", points: 35 },
      { input: "29.75 L", expected: "Delivery: 3.00\nTotal: 32.75", points: 30 },
      { input: "45 R", expected: "Delivery: 6.00\nTotal: 51.00", points: 35 }
    ]
  }
];