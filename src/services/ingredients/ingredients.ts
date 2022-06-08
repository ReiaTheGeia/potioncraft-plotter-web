import { cubicBezierCurve } from "@/curves";
import { IngredientDescriptor, ingredientId } from "./types";

export const ingredients: IngredientDescriptor[] = [
  {
    id: ingredientId("BloodRuby"),

    name: "Blood Ruby",

    color: "#C24647",

    price: 90,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -3, -3, -3, -3),

      cubicBezierCurve(-3, -3, -3, -3, -3, 3, -3, 3),

      cubicBezierCurve(-3, 3, -3, 3, -5.9999, 0, -6, 0),
    ],

    preGrindPercent: 0.1465,
  },

  {
    id: ingredientId("BloodyRoot"),

    name: "Bloodthorn",

    color: "#AC4937",

    price: 14,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, 0.0001001358, -2, 0, -2),

      cubicBezierCurve(0, -2, -0.0001001358, -2, -1.7499, 1, -1.75, 1),

      cubicBezierCurve(-1.75, 1, -1.7501, 1, -1.7501, -3, -1.75, -3),

      cubicBezierCurve(-1.75, -3, -1.7499, -3, -4.0001, 2, -4, 2),

      cubicBezierCurve(-4, 2, -3.9999, 2, -3.9999, -4, -4, -4),

      cubicBezierCurve(-4, -4, -4.0001, -4, -5.9999, 0, -6, 0),
    ],

    preGrindPercent: 0.435,
  },

  {
    id: ingredientId("CliffFungus"),

    name: "Brown Mushroom",

    color: "#957C64",

    price: 6,

    path: [
      cubicBezierCurve(0, 0, 0, -1, 0, -1, -1, -1),

      cubicBezierCurve(-1, -1, -2, -1, -2, -1, -2, -2),

      cubicBezierCurve(-2, -2, -2, -3, -2, -3, 0, -3),

      cubicBezierCurve(0, -3, 2, -3, 2, -3, 2, -4),

      cubicBezierCurve(2, -4, 2, -5, 2, -5, 0.5, -5),

      cubicBezierCurve(0.5, -5, 0, -5, 0, -5, 0, -6),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("Crystal"),

    name: "Cloud Crystal",

    color: "#ADADAD",

    price: 60,

    path: [
      cubicBezierCurve(0, 0, 0, 0, -0.75, 1, 0, 1.5),

      cubicBezierCurve(0, 1.5, 0.7499999, 2, 1, 2, 1, 2.75),

      cubicBezierCurve(1, 2.75, 0.9999999, 3.75, -0.9999999, 3.25, -1, 4.25),

      cubicBezierCurve(-1, 4.25, -1, 5, -0.75, 5, 0, 5.5),

      cubicBezierCurve(0, 5.5, 0.7499999, 6, 0.0001, 7, 0, 7),
    ],

    preGrindPercent: 0.177,
  },

  {
    id: ingredientId("DryadMushroom"),

    name: "Dryad's Saddle",

    color: "#9C785A",

    price: 5.5,

    path: [
      cubicBezierCurve(0, 0, -0.25, 0, -1.33541, -0.3291796, -1, -1),

      cubicBezierCurve(-1, -1, -0.5, -2, 2, -0.5, 2, -2),

      cubicBezierCurve(2, -2, 2, -3.5, -2, -1.25, -2, -3),

      cubicBezierCurve(-2, -3, -2, -3.75, 0.0001, -3.75, 0, -3.75),
    ],

    preGrindPercent: 0.53,
  },

  {
    id: ingredientId("EarthCrystal"),

    name: "Earth Pyrite",

    color: "#93806A",

    price: 30,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, 0, -1.5, 0, -1.5),

      cubicBezierCurve(0, -1.5, 0, -1.5, -1, -1.5, -1, -1.5),

      cubicBezierCurve(-1, -1.5, -1, -1.5, -1, -3.5, -1, -3.5),

      cubicBezierCurve(-1, -3.5, -1, -3.5, 1, -3.5, 1, -3.5),

      cubicBezierCurve(1, -3.5, 1, -3.5, 1, -5.5, 1, -5.5),

      cubicBezierCurve(1, -5.5, 1, -5.5, 0, -5.5, 0, -5.5),

      cubicBezierCurve(0, -5.5, 0, -5.5, 0.0001, -7, 0, -7),
    ],

    preGrindPercent: 0.1364,
  },

  {
    id: ingredientId("Firebell"),

    name: "Firebell",

    color: "#D1810D",

    price: 5,

    path: [
      cubicBezierCurve(0, 0, -1.25, 1, -1.2501, 1, -1.25, 1),

      cubicBezierCurve(-1.25, 1, -1.2499, 1, -2.5001, 0, -2.5, 0),

      cubicBezierCurve(-2.5, 0, -2.4999, 0, -3.7501, 1, -3.75, 1),

      cubicBezierCurve(-3.75, 1, -3.7499, 1, -3.75, 1, -5, 0),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("FireCitrine"),

    name: "Fire Citrine",

    color: "#CD7C19",

    price: 50,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -0.75, -1.5, -1.5, 0),

      cubicBezierCurve(-1.5, 0, -2.5, 2, -2.75, -0.7499999, -3.5, -0.75),

      cubicBezierCurve(-3.5, -0.75, -4.25, -0.75, -4.5, 2, -5.5, 0),

      cubicBezierCurve(-5.5, 0, -6.25, -1.5, -6.9999, 0, -7, 0),
    ],

    preGrindPercent: 0.202,
  },

  {
    id: ingredientId("FrostSapphire"),

    name: "Frost Sapphire",

    color: "#7399BF",

    price: 40,

    path: [
      cubicBezierCurve(0, 0, 0, 0, 0.25, 0.5, 0.25, 0.5),

      cubicBezierCurve(0.25, 0.5, 0.25, 0.5, 1, -1, 1, -1),

      cubicBezierCurve(1, -1, 1, -1, 2, 1, 2, 1),

      cubicBezierCurve(2, 1, 2, 1, 3, -1, 3, -1),

      cubicBezierCurve(3, -1, 3, -1, 4, 1, 4, 1),

      cubicBezierCurve(4, 1, 4, 1, 5, -1, 5, -1),

      cubicBezierCurve(5, -1, 5, -1, 6, 1, 6, 1),

      cubicBezierCurve(6, 1, 6, 1, 6.75, -0.5, 6.75, -0.5),

      cubicBezierCurve(6.75, -0.5, 6.75, -0.5, 7.0001, 0, 7, 0),
    ],

    preGrindPercent: 0.2139,
  },

  {
    id: ingredientId("GoblinMushroom"),

    name: "Goblin Shroom",

    color: "#928A5E",

    price: 5,

    path: [cubicBezierCurve(0, 0, 3, 0, 3, -5, 0, -5)],

    preGrindPercent: 0.663,
  },

  {
    id: ingredientId("Goldthorn"),

    name: "Goldthorn",

    color: "#96714E",

    price: 12.5,

    path: [
      cubicBezierCurve(0, 0, -0.25, 0, -0.5, 0.25, -0.5, 0.5),

      cubicBezierCurve(-0.5, 0.5, -0.5, 0.75, -0.25, 1, 0, 1),

      cubicBezierCurve(0, 1, 1, 1, 1, 0.5, 1, 0),

      cubicBezierCurve(1, 0, 1, -0.5, 0.5, -0.9999999, 0, -1),

      cubicBezierCurve(0, -1, -0.75, -1, -1.5, -0.25, -1.5, 0.25),

      cubicBezierCurve(-1.5, 0.25, -1.5, 1.75, -0.75, 2, 0, 2),

      cubicBezierCurve(0, 2, 1.25, 2, 2, 1.25, 2, 0),

      cubicBezierCurve(2, 0, 2, -1, 1, -2, 0, -2),
    ],

    preGrindPercent: 0.3013,
  },

  {
    id: ingredientId("GraveTruffle"),

    name: "Grave Truffle",

    color: "#908B7F",

    price: 10,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -3.0001, -2, -3, -2),

      cubicBezierCurve(-3, -2, -2.9999, -2, -0.7501, -7, -0.75, -7),

      cubicBezierCurve(-0.75, -7, -0.7499, -7, 0.7499, -7, 0.75, -7),

      cubicBezierCurve(0.75, -7, 0.7501, -7, 3, -2, 3, -2),

      cubicBezierCurve(3, -2, 3, -2, -0.0001, -1.25, 0, -1.25),

      cubicBezierCurve(0, -1.25, 0.0001, -1.25, 0.0001, -5, 0, -5),
    ],

    preGrindPercent: 0.2535,
  },

  {
    id: ingredientId("GreenMushroom"),

    name: "Green Mushroom",

    color: "#A5A24F",

    price: 9,

    path: [
      cubicBezierCurve(
        0,
        0,
        3.02107,
        1.020414,
        0.5508628,
        -1.518064,
        1.527383,
        -2.506451
      ),

      cubicBezierCurve(
        1.527383,
        -2.506451,
        2.500548,
        -3.491441,
        5.012281,
        -0.9910625,
        3.996144,
        -3.978157
      ),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("GreyChanterelle"),

    name: "Shadow Chanterelle",

    color: "#887C77",

    price: 10,

    path: [
      cubicBezierCurve(0, 0, 3, 0, -2.384186e-7, 5, 3, 5),

      cubicBezierCurve(3, 5, 4, 5, 4.5, 4, 4.5, 3),
    ],

    preGrindPercent: 0.512,
  },

  {
    id: ingredientId("IceDragonfruit"),

    name: "Ice Fruit",

    color: "#5D8089",

    price: 9,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, 0.9999, 2, 1, 2),

      cubicBezierCurve(1, 2, 1.0001, 2, 3, -2, 3, -2),

      cubicBezierCurve(3, -2, 3, -2, 4.9999, 2, 5, 2),

      cubicBezierCurve(5, 2, 5.0001, 2, 6.0001, 0, 6, 0),
    ],

    preGrindPercent: 0.333,
  },

  {
    id: ingredientId("LavaRoot"),

    name: "Lava Root",

    color: "#C86B41",

    price: 11.5,

    path: [
      cubicBezierCurve(0, 0, 0, 1.5, -2.5, 1.5, -2.5, 0),

      cubicBezierCurve(-2.5, 0, -2.5, -1.5, -5, -1.5, -5, 0),

      cubicBezierCurve(-5, 0, -5, 1.5, -7.5, 1.5, -7.5, 0),

      cubicBezierCurve(-7.5, 0, -7.5, -0.75, -6.25, -0.75, -6.25, 0),
    ],

    preGrindPercent: 0.4289,
  },

  {
    id: ingredientId("Leaf"),

    name: "Terraria",

    color: "#749064",

    price: 3,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -0.25, -0.75, 0, -1),

      cubicBezierCurve(0, -1, 0.25, -1.25, 0.5, -1, 0.75, -1.25),

      cubicBezierCurve(0.75, -1.25, 1, -1.5, 1, -2.25, 0.75, -2.5),

      cubicBezierCurve(0.75, -2.5, 0.5, -2.75, -0.5, -2.25, -0.75, -2.5),

      cubicBezierCurve(-0.75, -2.5, -1, -2.75, -1, -3.5, -0.75, -3.75),

      cubicBezierCurve(-0.75, -3.75, -0.5, -4, -0.1767767, -3.823223, 0, -4),

      cubicBezierCurve(0, -4, 0.25, -4.25, 0.0001, -5, 0, -5),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("LumpyBeet"),

    name: "Lumpy Beet",

    color: "#A36674",

    price: 9,

    path: [
      cubicBezierCurve(0, 0, 0, 2, 3, 1, 3, 3),

      cubicBezierCurve(3, 3, 3, 4, 1, 4, 1, 3),

      cubicBezierCurve(1, 3, 1, 2, 1, 1, 1, 0),

      cubicBezierCurve(1, 0, 1, -1, 3, -1, 3, 0),

      cubicBezierCurve(3, 0, 3, 1, 3, 2, 4, 2),
    ],

    preGrindPercent: 0.1805,
  },

  {
    id: ingredientId("Marshrooms"),

    name: "Marshroom",

    color: "#837956",

    price: 7,

    path: [
      cubicBezierCurve(0, 0, 2, -2, 1, -4, 3, -4),

      cubicBezierCurve(3, -4, 3.5, -4, 5, -4, 5, -3),
    ],

    preGrindPercent: 0.423,
  },

  {
    id: ingredientId("RedMushroom"),

    name: "Red Mushroom",

    color: "#A76C3F",

    price: 9.5,

    path: [cubicBezierCurve(0, 0, -4, 4, -4, -4, -8, 0)],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("Refruit"),

    name: "Hairy Banana",

    color: "#C5B13E",

    price: 12.5,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -3, -3, -4, -3),

      cubicBezierCurve(-4, -3, -5, -3, -8.000098, -2.453497e-5, -8, 0),

      cubicBezierCurve(-8, 0, -7, 0.25, -5, -1.25, -4, -1),
    ],

    preGrindPercent: 0.3375,
  },

  {
    id: ingredientId("SulphurShelf"),

    name: "Sulphur Shelf",

    color: "#D77838",

    price: 11,

    path: [
      cubicBezierCurve(0, 0, -2, 0, -3.5, 0, -3.5, 0.75),

      cubicBezierCurve(-3.5, 0.75, -3.5, 1.5, -2.75, 1.5, -2.25, 1.5),

      cubicBezierCurve(-2.25, 1.5, -1.75, 1.5, -1, 1.5, -1, 2.25),

      cubicBezierCurve(-1, 2.25, -1, 3, -2.5, 3, -4.5, 3),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("Tangleweeds"),

    name: "Tangleweed",

    color: "#759786",

    price: 8.5,

    path: [
      cubicBezierCurve(0, 0, 0, -1, 3, -1, 3, 0),

      cubicBezierCurve(3, 0, 3, 1, 1.5, 1, 1.5, 0),

      cubicBezierCurve(1.5, 0, 1.5, -1, 3, -2, 4, 0),

      cubicBezierCurve(4, 0, 5, 2, 6.5, 1, 6.5, 0),

      cubicBezierCurve(6.5, 0, 6.5, -1, 5, -1, 5, 0),

      cubicBezierCurve(5, 0, 5, 1, 8, 1, 8, 0),
    ],

    preGrindPercent: 0.5005,
  },

  {
    id: ingredientId("Thistle"),

    name: "Thunder Thistle",

    color: "#9E5874",

    price: 9,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, 1.9999, 3.5, 2, 3.5),

      cubicBezierCurve(2, 3.5, 2.0001, 3.5, -0.9999, 2.5, -1, 2.5),

      cubicBezierCurve(-1, 2.5, -1.0001, 2.5, 1.0001, 6, 1, 6),
    ],

    preGrindPercent: 0.353,
  },

  {
    id: ingredientId("Thornstick"),

    name: "Thornstick",

    color: "#818C4D",

    price: 8,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, -3.9999, -6, -4, -6),

      cubicBezierCurve(-4, -6, -4.0001, -6, -1.9999, -5, -2, -5),
    ],

    preGrindPercent: 0.319,
  },

  {
    id: ingredientId("Waterbloom"),

    name: "Waterbloom",

    color: "#539278",

    price: 4,

    path: [
      cubicBezierCurve(0, 0, 0.25, -0.5, 1, -0.5, 1.25, 0),

      cubicBezierCurve(1.25, 0, 1.5, 0.4999999, 2.25, 0.5, 2.5, 0),

      cubicBezierCurve(2.5, 0, 2.75, -0.5, 3.5, -0.5, 3.75, 0),

      cubicBezierCurve(3.75, 0, 4, 0.4999999, 4.75, 0.5, 5, 0),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("Wierdshroom"),

    name: "Weirdshroom",

    color: "#B88A51",

    price: 8.5,

    path: [
      cubicBezierCurve(0, 0, -2, 0, -2, -6, -1, -6),

      cubicBezierCurve(-1, -6, 0.25, -6, 1.353553, -6.207107, 1, -5.5),

      cubicBezierCurve(1, -5.5, 0.5, -4.5, -0.25, -3.75, 0, -3),
    ],

    preGrindPercent: 0.3045,
  },

  {
    id: ingredientId("Windbloom"),

    name: "Windbloom",

    color: "#ADABA2",

    price: 6,

    path: [
      cubicBezierCurve(0, 0, 0.0001, 0, 0, 0, 0.5, 1.25),

      cubicBezierCurve(0.5, 1.25, 0.9999999, 2.5, 0.9999, 2.5, 1, 2.5),

      cubicBezierCurve(1, 2.5, 1.0001, 2.5, -1.0001, 2.5, -1, 2.5),

      cubicBezierCurve(-1, 2.5, -0.9999, 2.5, -1, 2.5, -0.5, 3.75),

      cubicBezierCurve(-0.5, 3.75, -2.086163e-7, 5, 0.0001, 5, 0, 5),
    ],

    preGrindPercent: 0.5,
  },

  {
    id: ingredientId("WitchMushroom"),

    name: "Witch Mushroom",

    color: "#92777C",

    price: 13,

    path: [cubicBezierCurve(0, 0, 0, 4, 5, 1, 5, 5)],

    preGrindPercent: 0.5,
  },
];
