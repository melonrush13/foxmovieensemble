import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'


const sources = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};


// var movies = [
//     {url : "http://media.w3.org/2010/05/sintel/trailer.mp4", MovieName: "sintelTrailer"},
//     {url : "http://media.w3.org/2010/05/bunny/trailer.mp4", MovieName: "bunnyTrailer"},
//     {url : "http://media.w3.org/2010/05/bunny/movie.mp4", MovieName: "bunnyMovie"},
//     {url: "http://media.w3.org/2010/05/bunny/movie.mp4", MovieName: "test"}
// ];


//used to define a type with properties
//interface Iface { }

 
class App extends Component {
  state = {
    played: 0,
    loaded: 0,
    playing: true,
    url: '',
   // url: null,
    volume: 0.8,
    loop: true,
    duration: 0,
    playbackRate: 1.0,

  }

  playPause () {
   console.log("hi")
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
  
  onProgress = (state : {playedSeconds: number }) => {
      console.log('onProgress', state)

    //TODO:
    //frame number - num of boxes per frame, 
    //draw # of those frames
  }

  render() {
    const { url, playing, volume, loaded, duration, playbackRate, played } = this.state

    return (
      <div className ='app'>
        <section className='section'>
          <h1>ReactPlayer Demo</h1>
          <div className='player-wrapper'>
            <ReactPlayer
                className = 'react-player'
               // url = {sources.sintelTrailer} //'https://www.youtube.com/watch?v=ysz5S6PUM-U'
                url = {url} //'https://www.youtube.com/watch?v=ysz5S6PUM-U'

                playing = {playing}
                volume = {volume}
                height = '75%'
                width = '75%'
                playbackRate = {playbackRate}
                onProgress = {this.onProgress}
                //onDuration ={this.onDuration}
            />
          </div>  
        </section>      
      <table>
        <tbody>
          <button onClick={this.playPause}> Play Pause Button</button>
          <button onClick={this.onPause}> Pause</button>
          <button onClick={this.onPlay}> Play</button>
      
        </tbody>
        <tbody>
          <tr>
            <td>
            <h6>Playback Speed</h6>
              <button onClick={()=> this.setPlaybackRate(.5)}>.5</button>
              <button onClick={()=> this.setPlaybackRate(1)}>1</button>
              <button onClick={() => this.setPlaybackRate(2)}>2</button>
            </td>
          </tr>
        </tbody>
        <h2>State </h2>
        <tbody>
          <tr>
            <th>Seconds Elapsed:</th>
            <td></td>
          </tr>
          <tr>
            <th>Time Remaining:</th>
            <td>{played}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <section className='section'>
        <table>
          <tbody>
            <tr> 
              <th>Sintel Trailer</th>
              <button onClick={() => this.setMovieUrl(sources.sintelTrailer)}>Watch</button>
            </tr>
            <tr>
              <th>Bunny Movie Trailer</th>
              <button onClick={() => this.setMovieUrl(sources.bunnyTrailer)}>Watch</button>
            </tr>
            <tr>
              <th>Bunny Movie</th>
              <button onClick={() => this.setMovieUrl(sources.bunnyMovie)}>Watch </button>
            </tr> <tr>
              <th>Deadpool Trailer</th>
              <button onClick={() => this.setMovieUrl(sources.deadpool)}>Watch</button>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
    ) 
  }
}


export default App;
