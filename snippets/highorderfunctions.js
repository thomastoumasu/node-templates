// from https://www.youtube.com/watch?v=1DMolJ2FrNY&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84&index=4

// filter and map
console.log("demo filter");
var animals = [
  { name: "Fluffykins", species: "rabbit" },
  { name: "Caro", species: "dog" },
  { name: "Hamilton", species: "dog" },
  { name: "Harold", species: "fish" },
  { name: "Ursula", species: "cat" },
  { name: "Jimmy", species: "fish" },
];

var dogs = animals.filter((e) => e.species === "dog");

console.log(animals);
console.log(dogs);
console.log(dogs.map((e) => e.name));

// reduce
console.log("----------------------------------");
console.log("demo reduce");
var orders = [{ amount: 250 }, { amount: 400 }, { amount: 100 }, { amount: 325 }];

var total = orders.reduce((sum, e) => sum + e.amount, 0);
console.log(total);

var numbers = [250, 400, 100, 325];
var total = numbers.reduce((sum, e) => sum + e, 0);
console.log(total);

// reduce on file
console.log("----------------------------------");
console.log("demo reduce - from file data.txt");
import fs from "fs";
var output = fs
  .readFileSync("data.txt", "utf8") // makes a big string of all
  .trim() // takes the EOF away
  .split("\n") // makes an array of strings
  .map((line) => line.split("\t")) // each array elements is itself an array of strings
  .reduce(
    (customers, line) => {
      // iterates array elements (line, an array of strings) and write into state (customers, an object)
      customers[line[0]] = customers[line[0]] || []; // if do not exist yet, create, else do no overwrite
      customers[line[0]].push({ name: line[1], price: line[2], amount: line[3] });
      return customers; // returns the state
    },
    {} // state initial value
  );
console.log(JSON.stringify(output, null, 2));
