import { SEAT_STATUS } from './constants';

const generateRandomBooleam = () => Math.random() > 0.5 ? SEAT_STATUS.EMPTY : SEAT_STATUS.TAKEN;
const generateArrayOfBooleans = (size) => {
    let arr = [];
    for(let i = 0; i < size; i++){
        arr.push(generateRandomBooleam());
    };
    return arr;
}

/* 
    Generates a seats map with its seats status randomly selected
    ex: 
    {
        A: [0, 1, 0, 1, 0 ],
        B: [1, 0, 1, 1, 1 ],
        c: [1, 1, 1, 0, 0 ]
        ...
    }
*/
export const generateSeatsMap = () => {
    const letters = ["A", "B", "C","|", "D", "E" ,"F"];
    const size = 5;
    return letters.reduce((acc, letter) => ({
      ...acc,
      [letter]: generateArrayOfBooleans(size)
    }) , {})
};


/* 
    Updates the seat map by selecting the seat provided with its number and letter
*/
export const selectSeat = (seats, letter, num, force = false) => {
    return {
      ...seats,
      [letter]: seats[letter].map((seat, idx) => idx === num && (force || (seat !== SEAT_STATUS.TAKEN)) ?
        (seat !== SEAT_STATUS.SELECTED
          ? SEAT_STATUS.SELECTED :
          SEAT_STATUS.EMPTY)
        : seat)
    };
}

export const selectMultipleSeats = (seats, seatsToSelect) => 
    seatsToSelect
        .reduce((acc, seat) => selectSeat(acc, seat.letter, seat.num, true) , seats);


/* 
    Return an array containing the selected seats info
    Ex:
    [{ letter: "A", num: 4, seat: 2 }, { letter: "E", num: 6, seat: 2 }]
*/
export const getSelectedSeatsAsArray = (seats) => {
    return Object.keys(seats).reduce((acc, letter) => {
      return acc.concat(seats[letter]
        .map((seat, idx) => ({ letter, num: idx, status: seat }))
        .filter(info => info.status === SEAT_STATUS.SELECTED));
    }, []);
}

/*
  Converts an array of seats ("E0, E4, C2")
  to an array: 
  [{letter: "E", num: 0}, {letter: "E", num: 4}, {letter: "C", num: 2}]
*/
export const convertSeatsToArray = (selectedSeats) => {
    return selectedSeats ? selectedSeats.trim().split(", ").map(seat => ({
      letter: seat[0],
      num: parseInt(seat[1], 10)
    })) : [];
}