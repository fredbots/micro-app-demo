import React, { Component } from 'react';
import './App.css';
import seatsMap from './lib/seatsMap';
import SeatsMap from './components/SeatsMap';
import { SEAT_STATUS } from './lib/constants';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seats: seatsMap()
    }
  }
  handleSubmit = () => {
    
  }
  handleSelectSeat = ({ num, letter }) => {
    const { seats } = this.state;
    const numberOfSelected = this.getSelectedSeats().length;
    this.setState({
      seats: {
        ...seats,
        [letter]: seats[letter].map((seat, idx) => 
          idx === num && seat !== SEAT_STATUS.TAKEN ? 
            (seat !== SEAT_STATUS.SELECTED 
              ? SEAT_STATUS.SELECTED : 
                SEAT_STATUS.EMPTY
            )
            : seat 
        )
      }
    })
  }
  getSelectedSeats = () => {
    const { seats } = this.state;
    return Object.keys(seats).reduce((acc, letter) => {
      return acc.concat(seats[letter]
        .map((seat, idx) => ({ letter, num: idx, status: seat }))
        .filter(info => info.status === SEAT_STATUS.SELECTED))
    }, [])
  }
  renderSelectedSeat = (info) => (
    <div style={{ padding: "5px" }}>
      <span>{`Seat ${info.num+info.letter}`}</span>
    </div>
  )
  renderSelectedSeats = () => 
    this.getSelectedSeats().length > 0 ? 
    <div 
      style={{ 
        width: "100%", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h3>Selected</h3>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {
            this.getSelectedSeats()
              .map(ss => this.renderSelectedSeat(ss))
          }
          {/* { JSON.stringify(this.getSelectedSeats(), null, 2)} */}
        </div>
    </div> : null
  render() {
    const { seats } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <h2>Select plane seat</h2>
        </div>
        {this.renderSelectedSeats()}
        <div style={{ display: "flex", width: "100%", justifyContent: "center" }} >
          <SeatsMap 
            onSeatClick={this.handleSelectSeat}
            seats={seats} 
          />
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <button 
            onClick={this.handleSubmit}
            className="submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default App;
