import React, { Component } from 'react';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'


const movies = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  deadpool: 'https://www.youtube.com/watch?v=ONHBaC-pfsk',
};


const deadpool: IMedia<IVideoPrediction> = {
  title: 'Deadpool 2',
  sourceUrl: 'https://www.youtube.com/watch?v=D86RtevtfrA',
  predictions: [{classifier: 'gun', confidence: 1, xStart: 0, yStart: 0, xEnd: 100, yEnd: 100, time: 3, },
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
  }

  private player!:ReactPlayer;

  state: { media:IMedia<IVideoPrediction>,
          played:number, loaded:number, playing: boolean, url:string, 
          volume:number, loop: boolean, duration: number, playbackRate: number, loadedSeconds: number,
          playedSeconds: number, boxHeight: number, boxWidth: number, isDragging: boolean, startbbx: number,
          startbby: number, categories: Array<string>, mediamap : {[key:number]:string} } = {

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
      categories: deadpool.predictions.map(a => a.classifier), 
      
      media: deadpool,
      // media: {
      //   title: '',
      //   sourceUrl: '',
      //   predictions:[],
      // }
      mediamap: {},
      
  } 


  componentDidMount() {
  }
  
  componentDidUpdate() {
  }

  playPause = () => {
    console.log('play/pause')
    this.setState({ playing: !this.state.playing })
  }
  onPlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }
  onPause = () => {
    console.log('onPause')
    this.setState({ playing: false })
  }

  changeCurrentTime = (e: number) => {
    console.log("clicked ")
    const currTime = this.state.playedSeconds;
    // const newTime = currTime + e; 
    // //this.setState({playedSeconds: newTime})
    // this.setState({played: newTime})
    // //console.log(this.refs.ReactPlayer)
    
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
    var roundedPlayedSec = Math.round(this.state.playedSeconds);
  }

//attempting to display bounding box based on time given on tag
    // var i;
    // for(i = 0; i < this.state.media.predictions.length; i++) {
    //   if (this.state.media.predictions[i].time === roundedPlayedSec)
    //   {
    //     console.log("boop!")
    //     this.setState({correctTime: true})
    //   }

    // }

  setPlaybackRate = (e: number) => {
    console.log(e)
    this.state.playbackRate = e;
    this.setState({ playingbackRate: e })
  }
  createMapofTagsForMovie = () => {
    console.log('createMapOfTagsForMovie')
    //The value might need to be Array<string> if we can have more than one classifier at a particular time of the video
    deadpool.predictions.map(a=> this.state.mediamap[a.time]=a.classifier)
    
    console.log(this.state.mediamap[4])
    console.log(this.state.mediamap[10])
    console.log(this.state.mediamap[12])
  }
  setMovieUrl = (r: string ) => {
    console.log(r)
    this.state.url = r;
    this.setState({ url: r })
    this.createMapofTagsForMovie()
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
  }

  ref = (player : any) => {
    this.player = player
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
                        console.log("new x and y :" + this.state.startbbx, this.state.startbby)
                        
                      }}
                      onTransformStart={() => {
                        console.log("oh hai")
                      }}
                      />})    
                  }
                </Layer>
              </Stage>
            </div>
          </div>  
          <h2>Settings</h2>
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
              <tr>
                <th>Search</th>
                <td>
                  <input type="text" onChange={this.onSearch} placeholder="Search by classifier.." />
                  
                </td>
                <td>
                  {this.state.categories}
                </td>
              </tr>
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
          <section>
          <div  id="tagtable">
          <h2>Tags</h2>
              <table >
                <tbody>
                    <tr>

                    </tr>
                </tbody>
            </table>
          </div>
            
          </section>
      </div>
    ) 
  }
}

export default App;
