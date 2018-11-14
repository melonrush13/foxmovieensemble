import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'

const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};

class App extends React.Component { 
  constructor(props: any) {
    super(props);

    this.handleHeightChange = this.handleHeightChange.bind(this);
    this.handleHeightSubmit = this.handleHeightSubmit.bind(this);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleWidthSubmit = this.handleWidthSubmit.bind(this);
  }

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
    boxHeight: 100,
    boxWidth: 400,
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
      // console.log("secs: " + state.playedSeconds);    
      this.setState({loadedSeconds: state.loadedSeconds}); 
      this.setState({playedSeconds: state.playedSeconds});
    }

  boundingBoxClicked() {
    console.log("video clicked")
  }

  componentDidUpdate() {
    console.log("Hi Mel!");
    
    var canvas : any = this.refs.myCanvas
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, this.state.boxWidth, this.state.boxHeight);

    console.log("height " + this.state.boxHeight)
    console.log("width " + this.state.boxWidth)
  }
 
  handleWidthSubmit(event: any) {
    alert('New change to bounding box width of: ' + this.state.boxWidth);
    event.preventDefault();
  }
  handleWidthChange = (event : any) => {
    this.setState({ boxWidth: event.target.value });
  }

  handleHeightSubmit(event: any) {
    alert('New change to bounding box height of: ' + this.state.boxHeight);
    event.preventDefault();
  }
  handleHeightChange = (event : any) => {
    this.setState({ boxHeight: event.target.value});
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
            <div id="videocontainer">
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
              <canvas id="canvas" ref="myCanvas" width="640" height="360" onClick={this.boundingBoxClicked}></canvas>

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
            </tbody>
          </table>

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
          <h2>Tags</h2>
          <table id="tags">
            <tbody>
              <tr>
                <th>Box Width: </th>
                <td> {this.state.boxWidth} </td>
              </tr>
              <tr>
                <th>Modify:</th>
                <td>
                 <form onSubmit={this.handleWidthSubmit}>
                    <input 
                      name="newwidth" 
                      ref="newwidth"
                      type="text" 
                      value={this.state.boxWidth} 
                      onChange={this.handleWidthChange}/>
                  <input type="submit" value="Change!"></input>
                </form>
                </td>
              </tr>
              <tr>
                <th>Box Height: </th>
                <td> {this.state.boxHeight} </td>
              </tr>
              <tr>
                <th>Modify:</th>
                <td>
                 <form onSubmit={this.handleHeightSubmit}>
                    <input 
                      name="newheight" 
                      ref="newheight"
                      type="text" 
                      value={this.state.boxHeight} 
                      onChange={this.handleHeightChange}/>
                  <input type="submit" value="Change!"></input>
                </form>
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
      </div>
    ) 
  }
}

export default App;
