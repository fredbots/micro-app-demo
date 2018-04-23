import React, { Component } from 'react';
import './App.css';
import { generateSeatsMap, selectSeat, getSelectedSeatsAsArray } from './lib/seatsMap';
import SeatsMap from './components/SeatsMap';
import { getParameterByName } from './lib/utils';
import { onSubmit, onCloseApp } from './lib/api';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seats: generateSeatsMap(),
      finished: false
    }
  }

  componentDidMount() {
    // let selectedSeats = getParameterByName("seats") || [];
  }

  handleFinishApp = () => {
    const fallback = getParameterByName("fallback") || undefined;
    if (fallback)
      onCloseApp();
    else
      this.setState({
        finished: true
      })
  }

  handleSubmit = () => {
    const seats = this.getSelectedSeats();
    const attributes = {
      seats
    };
    onSubmit(attributes)
      .then((res) => {
          // successfull submited attributes back
          this.handleFinishApp();
        }
      )
      .catch((error) => {
          // error response
          throw error;
      })
  }

  handleSelectSeat = ({ num, letter }) => {
    const { seats } = this.state;
    this.setState({
      seats: selectSeat(seats, letter, num)
    })
  }

  getSelectedSeats = () => {
    const { seats } = this.state;
    return getSelectedSeatsAsArray(seats)
  }

  renderSelectedSeat = (info, idx) => (
    <div key={`seat-${idx}`} style={{ padding: "5px" }}>
      <span>{`Seat ${info.num + info.letter}`}</span>
    </div>
  )

  renderSelectedSeats = () =>
    this.getSelectedSeats().length > 0 ?
      <div className="flex-centralize-vert flex-column" >
        <h3>Selected</h3>
        <div className="flex-centralize-hor flex-wrap">
          {
            this.getSelectedSeats()
              .map((ss, idx) => this.renderSelectedSeat(ss, idx))
          }
        </div>
      </div> : null

  render() {
    const { seats, finished } = this.state;
    return finished ?
      <span className="app-closable-message" >You can close this page</span> :
      (
        <div className="app">
          <div className="app-header">
            Select plane seat
        </div>
          {this.renderSelectedSeats()}
          <div className="flex-centralize-hor" >
            <SeatsMap
              onSeatClick={this.handleSelectSeat}
              seats={seats}
            />
          </div>
          <div className="flex-centralize-hor">
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


