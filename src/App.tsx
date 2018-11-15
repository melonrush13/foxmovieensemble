import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'
import Konva from 'konva'

const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};

const media: IMedia<IVideoPrediction> = {
  title: 'xyz',
  sourceUrl: 'xyxxx',
  predictions: [{classifier: 'deadpool', confidence: 2, xStart: 2, yStart: 2, xEnd: 4, yEnd: 4, time: 4}],
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

    this.handleHeightChange = this.handleHeightChange.bind(this);
    this.handleHeightSubmit = this.handleHeightSubmit.bind(this);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleWidthSubmit = this.handleWidthSubmit.bind(this);
  }


  state: { //media:IMedia<IVideoPrediction>,
          played:number, loaded:number, playing: boolean, url:string, 
          volume:number, loop: boolean, duration: number, playbackRate: number, loadedSeconds: number,
          playedSeconds: number, boxHeight: number, boxWidth: number, isDragging: boolean } = {

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
     // media: '',

    // rectangles: [ 
    //   { x: 10, y: 10, width: 100, height: 100, fill: 'red', name: 'rect1'},
    //   { x: 20, y: 20, width: 100, height: 100, fill: 'green', name: 'rect2'},
    // ],
  
  } 


  componentDidMount() {
    console.log("HELLO Mel!");
   // this.updateCanvas();


  }

  componentDidUpdate() {
  //  this.updateCanvas();
  
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
  updateCanvas() {
    var canvas : any = this.refs.myCanvas
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, this.state.boxWidth, this.state.boxHeight);

    //console.log("height " + this.state.boxHeight)
    //  console.log("width " + this.state.boxWidth)
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

  handleTransform = () => {
    console.log("transforming.....");
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
                  url = {url} 
                  playing = {playing}
                  volume = {volume}
                  playbackRate = {playbackRate}
                  onProgress = {this.onProgress}
              />
              <Stage width={640} height={360} className="konvastage">
                <Layer>
                  <Rect
                    x={0}
                    y={0} 
                    width={100} 
                    height={100} 
                    draggable 
                    name="myRect"
                    fill={this.state.isDragging ? 'orange' : 'transparent'}
                    stroke="black"
                    onDragStart={() => {  
                      this.setState({
                        isDragging: true
                      });
                      console.log("Dragging started!");
                  //    console.log(this.state.rectangles);

                    }}
                    onDragEnd={() => {
                      this.setState({
                        isDragging: false,
                      });
                      console.log("Done dragging!");
                    }}
                    onTransformStart={() => {
                      console.log("oh hai")
                    }}
                    />
                </Layer>
              </Stage>
              {/* <canvas id="canvas" ref="myCanvas" width="640" height="360" onClick={this.boundingBoxClicked}></canvas> */}        
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
