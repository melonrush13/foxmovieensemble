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
    loop: true
  }
  

  playPause () {
   // this.setState({ playing: !this.state.playing })
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

  //<ReactPlayer url='https://www.youtube.com/watch?v=ysz5S6PUM-U' playing />

  render() {
    const { url, playing, volume, loaded, played } = this.state
   // const SEPARATOR = ' . '

    return (
      <div className ='app'>
        <section className='section'>
          <h1>ReactPlayer Demo</h1>
          <div className='player-wrapper'>
            <ReactPlayer
                className = 'react-player'
                url = {sources.sintelTrailer} //'https://www.youtube.com/watch?v=ysz5S6PUM-U'
                playing
                volume = {volume}
                
            />
          </div>  
        </section>      
      <table>
        <tbody>
          <button onClick={this.playPause}> Play Pause Button</button>
          <button onClick={this.onPause}> Pause</button>
          <button onClick={this.onPlay}> Play</button>
        </tbody>
      </table>
    </div>
    ) 
  }
}


export default App;
