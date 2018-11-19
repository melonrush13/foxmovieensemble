import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'

//import Search from '../components/search'

const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};

// const media: IMedia<IVideoPrediction> = {
//   title: 'Deadpool One',
//   sourceUrl: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
//   predictions: [{classifier: 'gun', confidence: 1, xStart: 300, yStart: 300, xEnd: 350, yEnd: 350, time: 4},
//                 {classifier: 'sex', confidence: 1, xStart: 100, yStart: 100, xEnd: 20, yEnd: 20, time: 10},
//                 {classifier: 'deadpool', confidence: 1, xStart: 300, yStart: 300, xEnd: 30, yEnd: 30, time: 12}
//   ],
// }

const mediaTwo: IMedia<IVideoPrediction> = {
  title: 'Deadpool 2',
  sourceUrl: 'https://www.youtube.com/watch?v=D86RtevtfrA',
  predictions: [{classifier: 'gun', confidence: 1, xStart: 0, yStart: 0, xEnd: 100, yEnd: 100, time: 4},
                {classifier: 'sex', confidence: 1, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 10},
                {classifier: 'deadpool', confidence: 1, xStart: 200, yStart: 200, xEnd: 300, yEnd: 300, time: 12}
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

    this.handleHeightChange = this.handleHeightChange.bind(this);
    this.handleHeightSubmit = this.handleHeightSubmit.bind(this);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.handleWidthSubmit = this.handleWidthSubmit.bind(this);
  }


  state: { media:IMedia<IVideoPrediction>,
          played:number, loaded:number, playing: boolean, url:string, 
          volume:number, loop: boolean, duration: number, playbackRate: number, loadedSeconds: number,
          playedSeconds: number, boxHeight: number, boxWidth: number, isDragging: boolean, startbbx: number,
          startbby: number, categories: Array<string>, color: string } = {

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
      startbbx: 10,
      startbby: 10,
      categories: mediaTwo.predictions.map(a => a.classifier), 
      color: '',
      
      media: mediaTwo,
      // media: {
      //   title: '',
      //   sourceUrl: '',
      //   predictions:[],
      // }

      
  } 


  componentDidMount() {
    console.log("HELLO Mel!");
   // this.updateCanvas();

    // if(mediaTwo.predictions[0].classifier==='gun') { console.log('heyo'); }

    // var i;
    // var counter = 0;
    // for(i = 0; i < mediaTwo.predictions.length; i++) {
    //   counter ++;
    //   console.log("current count: " + counter)

    //   if(media.predictions[i].classifier === 'deadpool') {
    //     this.state.color = 'red'
    //   }
    //   if(media.predictions[i].classifier === 'gun') {
    //     this.state.color = 'black'
    //   }
    //   if(media.predictions[i].classifier === 'sex') {
    //    //change to setstate
    //     this.state.color = 'pink'
    //   }
    //   console.log(this.state.color);
    // }
    

   
    
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

  onSearch = (event: any) => {
    console.log("searching tags....")

    //console.log(deadpoolTwoObject.predictions[0]);

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
                  {
                    this.state.media.predictions.map((prediction) => {return <Rect
                      x= {prediction.xStart}
                      y= {prediction.yStart}
                      width={prediction.xEnd - prediction.xStart} 
                      height={prediction.yEnd - prediction.yStart} 
                      draggable 
                      name="myRect"
                      fill={this.state.isDragging ? 'red' : 'transparent'}
                      stroke="black"

                      //stroke = prediction.classifier
                      onDragStart={() => {  
                        this.setState({ isDragging: true });
                        console.log("Dragging started! of Rec1");
                      }}
                      onDragEnd={() => { this.setState({ isDragging: false });
                        console.log("Done dragging!");
                        console.log("new x and y :" + this.state.startbbx, this.state.startbby)
                        
                      }}
                      onTransformStart={() => {
                        console.log("oh hai")
                      }}
                      />})
                    
                  }
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
              <tr>
                <th>Search</th>
                <td>
                  <input type="text" onChange={this.onSearch} placeholder="Search by classifier.." />
                  
                </td>
                <td>
                  {this.state.categories}
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
