import { SEAT_STATUS } from './constants';

const generateRandomBooleam = () => Math.random() > 0.5 ? SEAT_STATUS.EMPTY : SEAT_STATUS.TAKEN;
const generateArrayOfBooleans = (size) => {
    let arr = [];
    for(let i = 0; i < size; i++){
        arr.push(generateRandomBooleam());
    };
    return arr;
}

const generateSeatsMap = () => {
    const letters = ["A", "B", "C","|", "D", "E" ,"F"];
    const size = 8;
    return letters.reduce((acc, letter) => ({
      ...acc,
      [letter]: generateArrayOfBooleans(size)
    }) , {})
};

export default generateSeatsMap;