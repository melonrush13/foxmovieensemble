import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import './App.css';
import ReactPlayer from 'react-player'
import {Stage, Layer, Rect, Transformer } from 'react-konva'
import { dragDistance } from 'konva';


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
                {classifier: 'violence', confidence: 3, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 15, },
                {classifier: 'nudity', confidence: 4, xStart: 100, yStart: 100, xEnd: 200, yEnd: 200, time: 10},
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
          mediamap : {[key:number]:IVideoPrediction}} = {

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
  } 


  componentDidMount() {
  }
  componentDidUpdate() {
  }

  uniqueValues() {
    var unique = this.state.categories.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    })

    console.log("unique array: " + unique);
    let i=0;
    let j=0;
    let data;
    for (i=0; i<unique.length; i++) {
      console.log("category " + unique[i])
      for (j=0; j < deadpool.predictions.length; j++ ) {
          console.log("confidence " + deadpool.predictions[j].confidence);
          if(deadpool.predictions[j].classifier === unique[i]) {
            console.log("these are the same: " + deadpool.predictions[j].classifier + " and " + unique[i])
            data = deadpool.predictions[j];
            console.log("classifier: " + data.classifier + ", confidence: " + data.confidence + ", time: " + data.time)
           // return data.time;

           
          }
          var testOne = <div>
          mel
        </div>
      }
    } 

    return (
      <div id="taggingcentral" className="tagcent">
        <p>"Hello!"</p>
      </div>
    );
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
     //Get classifier active for this second
    this.setState({curr_classifier:this.state.mediamap[state.playedSeconds].classifier});
    //TODO: Highlight this classifier with a different color
     //Get x and y co-ordinates for this second
    this.setState({curr_xstart:this.state.mediamap[state.playedSeconds].xStart});
    this.setState({curr_xend:this.state.mediamap[state.playedSeconds].xEnd});
    this.setState({curr_ystart:this.state.mediamap[state.playedSeconds].yStart});
    this.setState({curr_yend:this.state.mediamap[state.playedSeconds].yEnd});
    //TODO: Draw the bounding box for this coordinates at this second
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
    deadpool.predictions.map(a=> this.state.mediamap[a.time]=a)
    console.log(this.state.mediamap[4])
    console.log(this.state.mediamap[10])
    console.log(this.state.mediamap[12])
    console.log(this.state.mediamap[4].classifier)
    console.log(this.state.mediamap[10].classifier)
    console.log(this.state.mediamap[12].classifier)
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

    //const test: JSX.Element | null = this.uniqueValues();

    console.log("unique array: " + unique);
    let i=0;
    let j=0;
    let data;
    var uno;
    var dos;
    var tres;
    for (i=0; i<unique.length; i++) {
      console.log("category " + unique[i])
      for (j=0; j < deadpool.predictions.length; j++ ) {
          console.log("confidence " + deadpool.predictions[j].confidence);
        if(deadpool.predictions[j].classifier === unique[i]) {
          console.log("these are the same: " + deadpool.predictions[j].classifier + " and " + unique[i])
          data = deadpool.predictions[j];
          console.log("classifier: " + data.classifier + ", confidence: " + data.confidence + ", time: " + data.time);

          //maybe add these to a new array........? (media map)
         // [key: number] ivideoprediction

          uno = deadpool.predictions[i].classifier;
          dos = deadpool.predictions[i].confidence;
          tres = deadpool.predictions[i].time;

         // deadpool.predictions.map(a=> this.state.mediamap[a.time]=a.classifier)



          var test = <div>
            hello!
          </div>
        //deadpool.predictions.map(a => <span>{a.classifier}</span>)}
        }
      }
    } 

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
                        console.log("oh hai")
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
                    <td>classifier: {uno}</td>
                    <td>classification: {dos}</td>
                    <td>time: {tres}</td>
                  </tr>
                  <tr>
                      <th className={unique[1]}>{unique[1]}</th>
                      <td>classifier: {uno}</td>
                      <td>classification: {dos}</td>
                      <td>time: {tres}</td>
                  </tr>
                  <tr>
                      <th className={unique[2]}>{unique[2]}</th>
                      <td>classifier: {uno}</td>
                      <td>classification: {dos}</td>
                      <td>time: {tres}</td>
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
