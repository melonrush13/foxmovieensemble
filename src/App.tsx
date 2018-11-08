import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'
import { number } from 'prop-types';

const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};

// interface Props {
//   boxHeight: Number;
//   boxWidth: Number;
// }

// interface State {
//   boxHeight: Number;
//   boxWidth: Number;
// }

class App extends Component { 
  // constructor() {
  //   super();

  //   this.onFieldChange = this.onFieldChange.bind(this);
  // }
  state = {
    played: 0,
    loaded: 0,
    playing: true,
    url: '', // url: null,
    volume: 0.8,
    loop: true,
    duration: 0,
    playbackRate: 1.0,
    loadedSeconds: 0,
    playedSeconds: 0,
    boxHeight: 0,
    boxWidth: 0,

  }
  

  playPause () {
    if (this.state.playing == true) {
      this.setState({ playing: false })
    }
    else {
      this.setState({ playing: true })
    }

  }

  onPlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }
  onPause = () => {
    console.log('onPause')
    this.setState({ playing: false })
  }

  setPlaybackRate = (e: number) => {
    console.log(e)
    this.state.playbackRate = e;
    this.setState({ playingbackRate: e })
  }

  setMovieUrl = (r: string ) => {
    console.log(r)
    this.state.url = r;
    this.setState({ url: r })
  }
  
  onProgress = (state : {playedSeconds: number , loadedSeconds: number, played: number}) => {
      console.log('onProgress ', state)
      console.log("secs: " + state.playedSeconds);
      console.log("loaded: " + state.loadedSeconds);
      console.log("played: " + state.played);
      
      this.setState({loadedSeconds: state.loadedSeconds}); 
      this.setState({playedSeconds: state.playedSeconds});

      // let played = state.played;
      // let loaded = state.loadedSeconds;
      // const secs = state.playedSeconds;
      // let frames = secs * 60;

      var canvas : any = this.refs.boundingboxcanvas
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(0,0,500,500);
      ctx.moveTo(0,0);


    }

  boundingBoxClicked() {
    console.log("video clicked")
  }


  onHeightSubmit(d: any) {
    console.log("box height clicked")
    d.preventDefault(); 
    this.setState({
      boxHeight: d.target.value,
    })
  }
  onWidthSubmit(c: any) {
    console.log("box width clicked")
    c.preventDefault(); 
    this.setState({
      boxWidth: c.target.value,
    })
  }



  render() {
    const { url, playing, volume, loaded, duration, playbackRate, played } = this.state

    return (
      <div className ='app'>
        <section className='videoPlayer'>
          <div id="title">
            <h1>Fox Movie Ensemble</h1>
          </div>
          <div className='player-wrapper'>
            <div id="base">
              <ReactPlayer
                  className = 'react-player'
                // url = {sources.sintelTrailer} //'https://www.youtube.com/watch?v=ysz5S6PUM-U'
                  url = {url} 
                  playing = {playing}
                  volume = {volume}
                  playbackRate = {playbackRate}
                  onProgress = {this.onProgress}
                  //width - 640px
                  //height - 360px
              />
            </div>
            <div id="overlay">
              <canvas ref="boundingboxcanvas" onClick={this.boundingBoxClicked}></canvas>
            </div>
          </div>  
          <h2>Settings</h2>
          <table id="controls">
            <tbody>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.playPause}> Play Pause Button</button>
                  <button onClick={this.onPause}> Pause</button>
                  <button onClick={this.onPlay}> Play</button>
                </td>
              </tr>
              <tr>
                <th>Playback</th>
                <td>
                  <button onClick={()=> this.setPlaybackRate(.5)}>.5</button>
                  <button onClick={()=> this.setPlaybackRate(1)}>1</button>
                  <button onClick={() => this.setPlaybackRate(2)}>2</button>
                </td>
              </tr>
              <tr>
                <th>Box Height</th>
                <td>
                  <form onSubmit={(d) => this.onHeightSubmit(d)}>
                    <input 
                      id="boxheight" type='text' name="boxHeight" placeholder='Enter Height'
                      onChange={d => this.setState({boxHeight: d.target.value})} 
                      value={this.state.boxHeight}></input>
                    <button id="subHeight" type="submit">Change</button>
                  </form>
               </td>
                <th>Box Width</th>
                <td>
                  <form onSubmit={(c) => this.onWidthSubmit(c)}>
                    <input 
                      id="boxwidth" type='text' name="boxWidth" placeholder='Enter Width' 
                      onChange={c => this.setState({boxWidth: c.target.value})} 
                      value={this.state.boxWidth} ></input>
                    <button id="subWidth" type="submit">Change</button>
                  </form>
                </td>
              </tr>
              <tr>
                <th>Input</th>
                <td>
                  <label>{this.state.boxHeight}</label>
                </td>
                <th>Input</th>
                <td>
                  <label>{this.state.boxWidth}</label>
                </td>
              </tr>
            </tbody>
          </table>
          </section>
  
          <section className='section'>
          <h2>Movies</h2>
            <table id = 'movies'> 
              <tbody>
                <tr>
                  <th>Sintel Trailer</th>
                  <td> 
                    <button onClick={() => this.setMovieUrl(movies.sintelTrailer)}>Play</button>
                  </td>
                </tr>
                <tr>
                  <th>Bunny Movie Trailer</th>
                  <td>
                    <button onClick={() => this.setMovieUrl(movies.bunnyTrailer)}>Play</button>
                  </td>
                </tr>
                <tr>
                  <th>Bunny Movie</th>
                  <td>
                    <button onClick={() => this.setMovieUrl(movies.bunnyMovie)}>Play </button>
                  </td>
                </tr>
                <tr>
                  <th>Deadpool Trailer</th>
                  <td>
                    <button onClick={() => this.setMovieUrl(movies.deadpool)}>Play</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <h2>State</h2>
          <table id="time">
            <tbody>
              <tr>
                <th>Seconds Ellapsed: </th>
                <td> {this.state.playedSeconds} </td>
              </tr>
              <tr>
                <th>Loaded:</th>
                <td> {this.state.loadedSeconds} </td>
              </tr>
            </tbody>
          </table>
      </div>
    ) 
  }
}

export default App;
