import React, { Component } from 'react';
import request from 'superagent';
import './App.css';
import seatsMap from './lib/seatsMap';
import SeatsMap from './components/SeatsMap';
import { SEAT_STATUS } from './lib/constants';
import { getParameterByName} from './lib/utils';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seats: seatsMap(),
      finished: false
    }
  }
  
  componentDidMount() {
    const fallback = getParameterByName("fallback") || undefined;
    const fredToken = getParameterByName("fred_token") || "thereisnotoken";
    const fredConnector = getParameterByName("connector") || "thereisnoconnector";
    let selectedSeats = getParameterByName("seats") || [];
    console.log(fallback, selectedSeats, fredToken, fredConnector);
    this.setState({
      fredConnector,
      fredToken,
      fallback
    })
  }
  handleSubmit = () => {
    const seats = this.getSelectedSeats();
    const { fredToken, fredConnector, fallback } = this.state;
    request
      .post("https://connectors.staging1.fredapi.net/microapp/v1/continue")
      .send({
        attributes: {
          seats
        },  
        fred_token: fredToken,
        connector: fredConnector
      })
      .end((res, err) => {
        if(res && !res.errors) {
          this.handleFinishApp(fallback);
        } else {
          throw err || res.errors.detail;
        }
      })
  }
  handleFinishApp = (fallback) => {
    if (fallback) { //user is on desktop so only set the flow as done
      // alert("you can close it now");
      this.setState({
        finished: true
      })
    } else { // user is in mobile so the app can be closed from here
      window.MessengerExtensions.requestCloseBrowser(function success() {
        },
        function error(err) {
          // Show error and instruct user to try again
          alert('App could not be finished. Please Try again.');
      });
    }
  }
  handleSelectSeat = ({ num, letter }) => {
    const { seats } = this.state;
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
    const { seats, finished } = this.state;
    return finished ? 
    <span 
      style={{
        display: "flex",
        width: "100vw",
        justifyContent: "center",
        paddingTop: "40px"
      }}
    >You can close this page</span> :
    (
      <div className="App">
        <div className="App-header">
          Select plane seat
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
