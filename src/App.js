import React, { Component } from 'react';
import './App.css';
import { 
  generateSeatsMap, 
  selectSeat, 
  getSelectedSeatsAsArray,
  selectMultipleSeats,
  convertSeatsToArray
 } from './lib/seatsMap';
import SeatsMap from './components/SeatsMap';
import ErrorMessage from './components/ErrorMessage';
import { getParameterByName } from './lib/utils';
import { onSubmit, onCloseApp } from './lib/api';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seats: generateSeatsMap(),
      finished: false,
      errorBeforeFinish: ""
    }
  }

  componentDidMount() {
    this.selectRecivedSeatsFromUrl();
  }

  selectRecivedSeatsFromUrl = () => {
    let selectedSeats = getParameterByName("seats") || "";
    const formatedSeats = convertSeatsToArray(selectedSeats);
    this.handleSelectMultipleSeats(formatedSeats);
  }

  handleFinishApp = (isError = false) => {
    const fallback = getParameterByName("fallback") || undefined;
    if (fallback) {
      // if a "fallback=1" is provided it means the user is on a desktop
      // so the app has to be closed manually
      this.setState({
        finished: true,
        errorBeforeFinish: isError ? "The parameters provided are invalid. You need to re-open the micro app." : ""
      })
    } else {
      // if the "fallback=1" isn't provided the user is accessing from a mobile device
      // to we can call the Messenger Extension API to close the application
      onCloseApp();
    } 
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
          if(error === "close") {
            console.log('got here')
            this.handleFinishApp(true);
          }
          this.setState({
            error
          })
      });
  }

  handleSelectMultipleSeats = (seatsToSelect) => {
    const { seats } = this.state;
    this.setState({
      seats: selectMultipleSeats(seats, seatsToSelect)
    });
  }

  handleSelectSeat = ({ num, letter }) => {
    const { seats } = this.state;
    this.setState({
      seats: selectSeat(seats, letter, num)
    });
  }

  getSelectedSeats = () => {
    const { seats } = this.state;
    return getSelectedSeatsAsArray(seats);
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
    const { seats, finished, error, errorBeforeFinish } = this.state;
    return finished ?
      <span className="app-closable-message" >{errorBeforeFinish || "You can close this page"}</span> :
      (
        <div className="app">
          <div className="app-header">
            Select plane seat
          </div>
          {error && <ErrorMessage message={error} />}
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
