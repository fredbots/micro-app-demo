import React from 'react';
import PropTypes from 'prop-types';
import { SEAT_STATUS } from '../lib/constants';

const { TAKEN, EMPTY, SELECTED } = SEAT_STATUS;

const Number = ({ num }) => {
    return (
        <div className="number" >
            {num}
        </div>
    )
}

const ColumnOfNumbers = ({ seats }) => {
    const columnStyle = {
        display: "flex",
        flexDirection: "column",
        marginRight: "10px"
    };
    return (
        <div style={columnStyle}>
            {seats.map((seat, idx) => 
                <Number num={idx} key={`numb-${idx}`} />
            )}
        </div>
    )
}

const Seat = ({ status, onClick, num }) => {
    const mapStatusToClass = {
        [TAKEN]: "",
        [EMPTY]: "available",
        [SELECTED]: "selected"
    };

    return (
        <div   
            className={`seat ${mapStatusToClass[status]}`}  
            onClick={() => onClick(num)} >
        </div>
    )
}

const ColumnOfSeats = ({ seats, letter, onSeatClick }) => {
    const columnStyle = {
        display: "flex",
        flexDirection: "column",
        marginRight: "10px"
    };
    return (
        <div style={columnStyle}>
            {seats.map((seat, idx) => 
                <Seat 
                    key={`seat-${idx}`}
                    status={seat} 
                    num={idx} 
                    onClick={(num) => onSeatClick({num, letter})}
                />
            )}
        </div>
    )
}

class SeatsMap extends React.Component {
    render() {
        const { seats, onSeatClick } = this.props;
        return (
            <div style={{ display: "flex" }}>
                {
                    Object.keys(seats).map(key =>
                        key === "|" ?
                        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
                            <Number num={key} />
                            {<ColumnOfNumbers seats={seats[key]}  />}
                        </div> :
                        <div key={key} style={{ display: "flex", flexDirection: "column" }}>
                            <Number num={key} />
                            {<ColumnOfSeats 
                                seats={seats[key]} 
                                letter={key}
                                onSeatClick={info => onSeatClick(info)}
                            />}
                        </div>
                    )
                }
            </div>
        )
    }
}

SeatsMap.propTypes = {
    seats: PropTypes.object.isRequired,
    onSeatClick: PropTypes.func
}

export default SeatsMap;