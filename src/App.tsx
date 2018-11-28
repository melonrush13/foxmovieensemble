import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'
import { dragDistance } from 'konva';
import { S_IFCHR } from 'constants';


const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
//  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
 // bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};


const deadpool: IMedia<IVideoPrediction> = {
  title: 'Deadpool 2',
  sourceUrl: 'https://www.youtube.com/watch?v=D86RtevtfrA',
  predictions: [{classifier: 'violence', confidence: 1, xStart: 0, yStart: 0, xEnd: 100, yEnd: 100, time: 3, },
                {classifier: 'violence', confidence: 2, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 7, },
                {classifier: 'nudity', confidence: 4, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 10},
                {classifier: 'violence', confidence: 3, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 15, },
                {classifier: 'deadpool', confidence: 5, xStart: 200, yStart: 200, xEnd: 300, yEnd: 300, time: 12},
                {classifier: 'deadpool', confidence: 6, xStart: 200, yStart: 200, xEnd: 300, yEnd: 300, time: 14}
              ],
}

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
          volume:number, loop: boolean, duration: number, playbackRate: number, loadedSeconds: number,
          playedSeconds: number, boxHeight: number, boxWidth: number, isDragging: boolean, categories: Array<string>, 
          mediamap : {[key:number]:IVideoPrediction}, displayBox: boolean} = {

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
      boxWidth: 100,
      isDragging: false,
      categories: deadpool.predictions.map(a => a.classifier),
      media: deadpool,
      mediamap: {},
      displayBox: false,
  } 


  componentDidMount() {
   //this.createMapofTagsForMovie()

  }
  componentDidUpdate() {
  }

  playPause = () => {
    console.log('play/pause')
    this.setState({ playing: !this.state.playing })

    //plays a default movie if none is selected
    if(this.state.url === '') {
      this.setMovieUrl(movies.sintelTrailer)
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

  OnSeek = (e: number) => {
    console.log("seeeeeking")
    this.player.seekTo(e);
  }
  
  onSeekMouseDown = (e:any) => {
    this.setState({ seeking: true })
  }
  onSeekChange = (e:any) => {
    this.setState({ played: parseFloat(e.target.value) })
  }
  onSeekMouseUp = (e:any) => {
    this.setState({ seeking: false })
    this.player.seekTo(parseFloat(e.target.value))
  }

  onProgress = (state : {playedSeconds: number , loadedSeconds: number, played: number}) => {
    console.log('onProgress ', state)
    // console.log("secs: " + state.playedSeconds);    
    this.setState({loadedSeconds: state.loadedSeconds}); 
    this.setState({playedSeconds: state.playedSeconds});

    //displays the correct bounding box based on time
    var i;
    var finishTime;
    var roundedPlayedSec = Math.round(this.state.playedSeconds)

    var currentPrediction = this.state.mediamap[roundedPlayedSec];
    {
     //console.log(currentPrediction.classifier);
      //console.log(currentPrediction.confidence);
      //console.log(currentPrediction.time);
    }
    //check if current prediction is null
    //if not, print out the currentprediction on the side (classifier, and current xtart, ystart, and show that specific bounding )

    for (i=0; i < deadpool.predictions.length; i++) {
      finishTime = deadpool.predictions[i].time + 2;
      if (deadpool.predictions[i].time === roundedPlayedSec) {
        this.setState({displayBox: true})
        console.log("can display bounding box " + deadpool.predictions[i].confidence + "? = " + this.state.displayBox)

      }
      //todo: have box fade in a second before and after
      if(finishTime === roundedPlayedSec) {
        this.setState({displayBox: false})
        console.log("End display of box " + deadpool.predictions[i].confidence)
      }

    }
   }

    
 

  setPlaybackRate = (e: number) => {
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
  // onSearch = (event: any) => {
  //   console.log("searching tags....")
  // }


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
                  className = 'react-player'
                  url = {url} 
                  playing = {playing}
                  volume = {volume}
                  playbackRate = {playbackRate}
                  onProgress = {this.onProgress}
                  onSeek={e => console.log('onSeek', e)}
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
                      visible={this.state.displayBox}
                      fill={this.state.isDragging ? 'red' : 'transparent'}
                      stroke="black"
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
                  <button onClick={()=> this.setPlaybackRate(.5)}>.5</button>
                  <button onClick={()=> this.setPlaybackRate(1)}>1</button>
                  <button onClick={() => this.setPlaybackRate(2)}>2</button>
                </td>
              </tr>
              {/*
              <tr>
                <th>Skip</th>
                <td>
                  <button onClick={() => this.OnSeek(-1)}>Previous Frame</button>
                  <button onClick={() => this.OnSeek(1)}>Next Frame</button>
                  <button onClick={() => this.OnSeek(.5)}>test Frame</button>
                  <input
                  type='range' min={0} max={1} step='any'
                  value={played}
                  onMouseDown={this.onSeekMouseDown}
                  onChange={this.onSeekChange}
                  onMouseUp={this.onSeekMouseUp}
                />
                </td>
              </tr>
              */}
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
              {/*<div className={<data/>} > </div> */}
              {/*<div> Hey!!!{this.uniqueValues()}</div>*/}
              {/*<div> {mydata.filter(foo => true).map(data => <div key={data.someIdentifier}>{data.whatever}</div>)} </div>  */}            
              <table id="tagtable">
                <tbody>
                  <tr>
                    <th className={unique[0]}>{unique[0]}</th> 
                    <td>classifier: </td>
                    <td>classification: </td>
                    <td>time: </td>
                  </tr>
                  <tr>
                    <th className={unique[1]}>{unique[1]}</th>
                    <td>classifier: </td>
                    <td>classification: </td>
                    <td>time: </td>
                  </tr>
                  <tr>
                    <th className={unique[2]}>{unique[2]}</th>
                    <td>classifier: </td>
                    <td>classification: </td>
                    <td>time: </td>
                  </tr>
                  <tr>
                    <th>Displaying:</th>
                    <td>{this.state.displayBox}</td>
                  </tr>
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
