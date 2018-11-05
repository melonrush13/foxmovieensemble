import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'

const sources = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  test: 'http://media.w3.org/2010/05/video/movie_300.webm',
};

 
class App extends Component {
  state = {
    played: 0,
    loaded: 0,
    playing: true,
    url: null,
    volume: 0.8,
    loop: true,
    duration: 0,
    playbackRate: 1.0,

  }

  // load = url => {
  //   this.setState({
  //     url,
  //     played: 0,
  //     loaded: 0
  //   })
  // }

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

  setPlaybackRateSlow = () => {
    this.setState({ playingbackRate: 1.5 })
  }

  setPlaybackRateFast = () => {
    this.setState({ playingbackRate: 2 })
  }


  // onDuration = (duration) => {
  //   console.log('onDuration', duration)
  //   this.setState({ duration })
  // }

  // onProgress = state => {
  //   console.log('onProgress', state)
  // }



  render() {
    const { url, playing, volume, loaded, duration, playbackRate, played } = this.state

    return (
      <div className ='app'>
        <section className='section'>
          <h1>ReactPlayer Demo</h1>
          <div className='player-wrapper'>
            <ReactPlayer
                className = 'react-player'
                url = {sources.sintelTrailer} //'https://www.youtube.com/watch?v=ysz5S6PUM-U'
                playing = {playing}
                volume = {volume}
                height = '75%'
                width = '75%'
                playbackRate = {playbackRate}
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
              <button onClick={this.setPlaybackRateSlow} value ={.5}>.5</button>
              <button onClick={this.setPlaybackRateFast} value ={1.5}>1.5</button>
            </td>
          </tr>
         
        
        </tbody>
        <h2>State </h2>
        <tbody>
          <tr>
            <th>Seconds Elapsed:</th>
            <td>{loaded}</td>
          </tr>
          <tr>
            <th>Time Remaining:</th>
            <td>{played}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ) 
  }
}


export default App;
