import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'
import { dragDistance } from 'konva';
import { S_IFCHR } from 'constants';
import { timingSafeEqual } from 'crypto';


const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};


const deadpool: IMedia<IVideoPrediction> = {
  title: 'Deadpool 2',
  sourceUrl: 'https://www.youtube.com/watch?v=D86RtevtfrA',
  predictions: [{classifier: 'violence', confidence: 1, xStart: 0, yStart: 0, xEnd: 100, yEnd: 100, time: 3, },
                {classifier: 'violence', confidence: 2, xStart: 250, yStart: 350, xEnd: 300, yEnd: 400, time: 7, },
                {classifier: 'nudity', confidence: 4, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 10},
                {classifier: 'violence', confidence: 3, xStart: 100, yStart: 0, xEnd: 200, yEnd: 100, time: 15, },
                {classifier: 'deadpool', confidence: 5, xStart: 200, yStart: 200, xEnd: 300, yEnd: 300, time: 12},
                {classifier: 'deadpool', confidence: 6, xStart: 300, yStart: 300, xEnd: 350, yEnd: 350, time: 30}
              ],
}


//todo: have display one second before and one second 
//add color from evan's code, returns rgb string and defaults to opacity

//todo:change color of table element when correct tag is being displayed
interface IMedia<PredictionTypes extends IVisualPrediction | IVideoPrediction | IAudioPrediction> {
  title: string
  sourceUrl: string // URL to either video, image, or audio file
  predictions: PredictionTypes[]
}

interface IPrediction {
  classifier: string
  confidence: number // 0 - 100
}

interface IVisualPrediction extends IPrediction {
  xStart: number // top left x
  yStart: number // top left y
  xEnd: number // bottom right x
  yEnd: number // bottom right y
}

interface IVideoPrediction extends IVisualPrediction {
  time: number // time in ms relative to 0:00:00.000 in source
}

interface IAudioPrediction extends IPrediction {
  time: number // time in ms relative to 0:00:00.000 in source
  duration: number // duration in ms
}

class App extends React.Component { 
  constructor(props: any) {
    super(props);
  }

  private player!:ReactPlayer;

  state: { media:IMedia<IVideoPrediction>,
          played:number, loaded:number, playing: boolean, url:string, 
          volume:number, mute: boolean, loop: boolean, duration: number, playbackRate: number, loadedSeconds: number,
          playedSeconds: number, boxHeight: number, boxWidth: number, isDragging: boolean, categories: Array<string>, 
          mediamap : {[key:number]:IVideoPrediction}, color: string, time: number} = {

      //percentage out of 100
      played: 0,
      loaded: 0,
      playing: true,
      url: movies.deadpool, // url: '',
      volume: 0.8,
      mute: true,
      loop: true,
      duration: 0,
      playbackRate: 1.0,
      loadedSeconds: 0,
      playedSeconds: 0,
      boxHeight: 100,
      boxWidth: 100,
      isDragging: false,
      categories: deadpool.predictions.map(a => a.classifier),
      media: deadpool,
      mediamap: {},
      color: '',
      //rounded number of played seconds
      time: 0,
  } 


  componentDidMount() {
  }
  
  componentDidUpdate() {
   // console.log(this.state.time)

  }

  playPause = () => {
   // console.log('play/pause')
    this.setState({ playing: !this.state.playing })

    //plays a default movie if none is selected
    if(this.state.url === '') {
      this.setMovieUrl(movies.sintelTrailer)
    }
    console.log("play/pause @: " + this.state.time)
  }

  onPlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }
  onPause = () => {
    console.log('onPause')
    this.setState({ playing: false })
  }

  onToggleMute = () => {
    this.setState({mute: !this.state.mute})

    if(this.state.mute === true) {
      this.setState({ volume: 0})
    }
    if(this.state.mute === false) {
      this.setState({ volume: .8})
    }

  }

  onProgress = (state : {playedSeconds: number , loadedSeconds: number, played: number, loaded: number}) => {
    console.log('onProgress ', state)
    var roundedPlayedSec = Math.round(this.state.playedSeconds)
    this.setState({loadedSeconds: state.loadedSeconds, playedSeconds: state.playedSeconds, time: roundedPlayedSec})

    //console.log(roundedPlayedSec);
    //ellapsed : duration * played
    
    //displays the correct bounding box based on time
    var i;
    var finishTime;
    var currentPrediction;
    for (i=0; i < deadpool.predictions.length; i++) {
      finishTime = deadpool.predictions[i].time + 2;
      if (deadpool.predictions[i].time === roundedPlayedSec) {
        //console.log(this.state.mediamap[roundedPlayedSec]);
      }
      if(finishTime === roundedPlayedSec) {
       // console.log("End display of box " + deadpool.predictions[i].confidence)
      }
    }
   }

   OnSeek = (e: number) => {
    var newTime = this.state.played + e;
    console.log("new Time: " + newTime)
    console.log("current Time: " + this.state.time )

    this.setState({playedSeconds: newTime})
  }  


  OnSeekChange = (e: number) => {
    this.setState({ played: e})


    this.player.seekTo(e)

  }

  setPlaybackRate = (e: number) => {
    if(this.state.playing === false) {
      this.setState({playing: true})
    }

    console.log(e)
    this.state.playbackRate = e;
    this.setState({ playingbackRate: e })

  }
  createMapofTagsForMovie = () => {
    console.log('createMapOfTagsForMovie')
    //The value might need to be Array<string> if we can have more than one classifier at a particular time of the video
    deadpool.predictions.map(a=> this.state.mediamap[a.time]=a)
    console.log(this.state.mediamap[3])
  }
  
  setMovieUrl = (r: string ) => {
    console.log(r)
    this.state.url = r;
    this.setState({ url: r })
   //this.createMapofTagsForMovie()
  }


  boundingBoxClicked() {
    console.log("video clicked")

  }

  handleTransform = () => {
    console.log("transforming.....");
  }

  ref = (player: any) => {
    this.player = player
  }


  render() {
    const { url, playing, volume, loaded, duration, playbackRate, played } = this.state


    var unique = this.state.categories.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    })
          
    return (                

      <div className ='app'>
      <section id="header">
        <div id="title">
          <h1>Fox Movie Ensemble</h1>
        </div>
      </section>
        <section className='videoPlayer' id="videoplayer">
          <div className='player-wrapper' id="player-wrapper">
            <div id="videocontainer">
              <ReactPlayer
                  ref ={this.ref}
                  className = 'react-player'
                  url = {url} 
                  playing = {playing}
                  volume = {volume}
                  playbackRate = {playbackRate}
                  onProgress = {this.onProgress}
                  onSeek={this.OnSeek}
                  onStart={() => console.log('onStart')}
              />
              <Stage width={640} height={360} className="konvastage">
                <Layer>
                  { 
                    this.state.media.predictions.map((prediction) => {return <Rect
                      x= {prediction.xStart}
                      y= {prediction.yStart}
                      width={prediction.xEnd - prediction.xStart} 
                      height={prediction.yEnd - prediction.yStart} 
                      draggable 
                      name="myRect"
                      visible={this.state.time === Math.round(prediction.time)}
                      fill={this.state.isDragging ? 'red' : 'transparent'}
                      stroke="white"
                      //stroke = prediction.classifier
                      onDragStart={() => {  
                        this.setState({ isDragging: true });
                        console.log("Dragging started!");
                        console.log("Time: " + prediction.time);
                        console.log("Confidence: " + prediction.confidence);
                      }}
                      onDragEnd={() => { this.setState({ isDragging: false });
                        console.log("Done dragging!");                          
                      }}
                      onTransformStart={() => {
                      }}
                      />})    
                  }
                </Layer>
              </Stage>
            </div>
          </div>  
          <h2 id="settings">Settings</h2>
          <table id="controls">
            <tbody>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.playPause}> Play/Pause</button>
                </td>
              </tr>
              <tr>
                <th>Playback</th>
                <td>
                  <button onClick={()=> this.setPlaybackRate(.5)}>.5x</button>
                  <button onClick={()=> this.setPlaybackRate(1)}>1x</button>
                  <button onClick={() => this.setPlaybackRate(2)}>2x</button>
                </td>
              </tr>
              <tr>
                <th>Skip</th>
                <td>
                  <button onClick={() => this.OnSeek(-1)}>Previous Frame</button>
                  <button onClick={() => this.OnSeek(1)}>Next Frame</button>
                  <button onClick={() => this.OnSeekChange(10)}>test Frame</button>
                  <button onClick={() => this.OnSeekChange(10)}>test Two</button>   
                </td>
              </tr>
              <tr>
                <th>Volume</th>
                <td>
                  <input type='checkbox' checked={this.state.mute} onChange={this.onToggleMute}></input>
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
              <tr>
                <th>Played</th>
                <td><progress max={100} value={this.state.playedSeconds} /></td>
            </tr>
            </tbody>
          </table>
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
                  <th>Deadpool Trailer</th>
                  <td>
                    <button onClick={() => this.setMovieUrl(movies.deadpool)}>Play</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section id="tags">
            <div>
              <h2 id="tagheader">Tags</h2>
              <table id="tagtable">
              <thead>
                <tr> 
                  <th>Time</th>
                  <th>Classifier</th>
                  <th>Button</th>
                </tr>
              </thead>
              <tbody> 
                  {this.state.media.predictions.map((prediction) => {return <tr>
                      <td>{prediction.time}</td>
                      <td> {prediction.classifier} </td>
                      <td>
                        <button onClick = {a => {
                          this.OnSeekChange(prediction.time)
                        }}>Seek</button>
                      </td> 
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <section id="footer">
            <div id="title">
            </div>
           </section>
      </div>
      ) 
   }
}



export default App;
