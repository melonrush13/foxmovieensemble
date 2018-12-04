import React from "react";
import { stringToRGBA } from "./colour";
// import "./App.css";
import ReactPlayer from "react-player";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import Peaks, { init } from "peaks.js";
import { any } from "prop-types";

//todo: have display one second before and one second
//add color from evan's code, returns rgb string and defaults to opacity

//todo:change color of table element when correct tag is being displayed
export interface IMedia {
  title: string;
  sourceUrl: string; // URL to either video, image, or audio file
  predictions: (IVideoPrediction | IAudioPrediction)[];
}

interface IPrediction {
  classifier: string;
  confidence: number; // 0 - 100
  time: number; // time in ms relative to 0:00:00.000 in source
}

interface IVideoPrediction extends IPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IAudioPrediction extends IPrediction {
  duration: number; // duration in ms
}

interface IAppState {
  url: string;
  volume: number;
  loop: boolean;
  playbackRate: number;
  boxHeight: number;
  boxWidth: number;
  categories: string[];
  predictionsByTime: { [key: number]: IPrediction[] | undefined };
  currentPlaybackTime: number;
  peakInstance: Peaks.PeaksInstance | null;
}

class App extends React.Component<IMedia, IAppState> {
  constructor(props: any) {
    super(props);
  }

  private playerRef = React.createRef<ReactPlayer>();
  private currentlyPlayingRefs: HTMLElement[] = [];
  private peaksContainerRef = React.createRef<HTMLDivElement>();
  private peaksAudioRef = React.createRef<HTMLAudioElement>();

  state: IAppState = {
    peakInstance: null,
    currentPlaybackTime: 0,
    url: this.props.sourceUrl, // url: '',
    volume: 0.8,
    loop: true,
    playbackRate: 1.0,
    boxHeight: 100,
    boxWidth: 100,
    categories: Object.keys(
      this.props.predictions.reduce(
        (categories, { classifier }) => ({ ...categories, [classifier]: true }),
        {}
      )
    ),
    predictionsByTime: this.props.predictions.reduce<{
      [t: number]: IPrediction[];
    }>((predictionsByTime, p) => {
      const timeS = Math.round(p.time / 1000);
      return {
        ...predictionsByTime,
        [timeS]: [...(predictionsByTime[timeS] || []), p]
      };
    }, {})
  };

  public componentDidMount() {
    const audioPredictions = this.props.predictions.filter(
      p => "time" in p && "duration" in p
    ) as IAudioPrediction[];

    const audioSegments = audioPredictions.map(p => {
      return {
        startTime: p.time / 1000,
        endTime: p.time + p.duration / 1000,
        color: "red"
      };
    });
    const options: Peaks.PeaksOptions = {
      container: this.peaksContainerRef.current as HTMLElement,
      mediaElement: this.peaksAudioRef.current as Element,
      audioContext: new AudioContext(),
      keyboard: true,
      pointMarkerColor: "#006eb0",
      showPlayheadTime: true,
      segments: audioSegments
    };
    const peakInstance = Peaks.init(options);

    //console.log(peakInstance.segments.getSegments());
    this.setState({ peakInstance }, () => {
      this.forceUpdate();
    });
  }

  public componentDidUpdate() {
    // Ensure the first label in always in view
    this.currentlyPlayingRefs.slice(0, 1).forEach(el => {
      el.scrollIntoView({ block: "center" });
    });
  }

  onSeek = (newTime: number) => {
    console.log("new Time: " + newTime);
  };

  seek = (e: number) => {
    const { current } = this.playerRef;
    if (current) {
      current.seekTo(e);
    }
  };

  setPlaybackRate = (rate: number) => {
    console.log("Setting playback rate: " + rate);
    this.setState({ playbackRate: rate });
  };

  render() {
    this.currentlyPlayingRefs = [];
    const {
      url,
      volume,
      playbackRate,
      predictionsByTime,
      currentPlaybackTime
    } = this.state;

    const reactPlayer = this.playerRef.current;
    const duration = (reactPlayer && reactPlayer.getDuration()) || -1;
    const {
      videoWidth = -1,
      videoHeight = -1,
      offsetWidth = 640,
      offsetHeight = 360
    } =
      (reactPlayer && (reactPlayer.getInternalPlayer() as HTMLVideoElement)) ||
      {};
    const scaleX = offsetWidth / videoWidth;
    const scaleY = offsetHeight / videoHeight;

    const currentPredictions =
      predictionsByTime[Math.round(currentPlaybackTime)] || [];
    const currentVideoPredictions = currentPredictions.filter(
      ({ x, y, width, height, time }: any) => x && y && width && height && time
    ) as IVideoPrediction[];
    const currentAudioPredictions = currentPredictions.filter(
      ({ time, duration }: any) => time && duration
    ) as IAudioPrediction[];

    return (
      <div
        className="App"
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <section id="header">
          <h1>{this.props.title}</h1>
        </section>

        <div
          className="main"
          style={{
            flex: "1",
            display: "flex",
            flexFlow: "row nowrap",
            justifyContent: "space-around"
          }}
        >
          <section
            className="video-player"
            style={{ border: "1px dotted grey" }}
          >
            <h2>Visualizer</h2>
            <div className="player-video" style={{ position: "relative" }}>
              <ReactPlayer
                ref={this.playerRef}
                url={url}
                controls={true}
                volume={volume}
                playbackRate={playbackRate}
                onProgress={({ playedSeconds }) => {
                  this.setState({ currentPlaybackTime: playedSeconds });
                }}
                progressInterval={250}
                onSeek={this.onSeek}
                onPause={() => {
                  const { peakInstance } = this.state;
                  peakInstance && peakInstance.player.pause();
                }}
                onPlay={() => {
                  const { peakInstance } = this.state;
                  peakInstance && peakInstance.player.play();
                }}
              />
              <Stage
                width={videoWidth}
                height={videoHeight}
                scale={{ x: scaleX, y: scaleY }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  overflow: "hidden", // Generated canvas will be videoWidth x videoHeight even when scaled.
                  pointerEvents: "none"
                }}
              >
                <Layer>
                  {currentVideoPredictions.map(prediction => {
                    return (
                      <Rect
                        key={JSON.stringify(prediction)}
                        x={prediction.x}
                        y={prediction.y}
                        width={prediction.width}
                        height={prediction.height}
                        name={prediction.classifier}
                        fill={stringToRGBA(prediction.classifier)}
                        stroke="black"
                      />
                    );
                  })}
                  {currentAudioPredictions.map(prediction => {
                    return (
                      <Rect
                        key={JSON.stringify(prediction)}
                        x={0}
                        y={0}
                        width={videoWidth}
                        height={videoHeight}
                        name={prediction.classifier}
                        fill={stringToRGBA(prediction.classifier, {
                          alpha: 0.5
                        })}
                      />
                    );
                  })}
                </Layer>
              </Stage>
            </div>
            <div ref={this.peaksContainerRef} />
            <audio ref={this.peaksAudioRef} controls>
              <source src={this.props.sourceUrl} type="audio/mpeg" />
            </audio>
            <h2 id="settings">Settings</h2>
            <table id="controls">
              <tbody>
                <tr>
                  <th>Playback</th>
                  <td>
                    <button onClick={() => this.setPlaybackRate(0.5)}>
                      .5x
                    </button>
                    <button onClick={() => this.setPlaybackRate(1)}>1x</button>
                    <button onClick={() => this.setPlaybackRate(2)}>2x</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <h2>State</h2>
            <table id="time">
              <tbody>
                <tr>
                  <th>Seconds Elapsed: </th>
                  <td>{currentPlaybackTime}</td>
                </tr>
                <tr>
                  <th>Played</th>
                  <td>
                    <progress max={duration} value={currentPlaybackTime} />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section
            style={{
              maxHeight: "100%",
              overflowY: "scroll",
              border: "1px dotted grey"
            }}
          >
            <h2>Tags</h2>
            <table style={{ border: "1px dotted grey" }}>
              <thead>
                <tr>
                  <th>Time (ms)</th>
                  <th>Classifier</th>
                  <th>Confidence</th>
                  <th>Video/Audio</th>
                  <th>Button</th>
                </tr>
              </thead>
              <tbody>
                {this.props.predictions
                  .sort((a, b) => a.time - b.time)
                  .map(prediction => {
                    const isPlaying =
                      Math.round(prediction.time / 1000) ===
                      Math.round(currentPlaybackTime);
                    return (
                      <tr
                        style={{
                          background: isPlaying ? "lightgrey" : "unset"
                        }}
                        key={JSON.stringify(prediction)}
                        ref={ref =>
                          isPlaying &&
                          ref &&
                          this.currentlyPlayingRefs.push(ref)
                        }
                      >
                        <td>{prediction.time}</td>
                        <td
                          style={{
                            color: stringToRGBA(prediction.classifier, {
                              alpha: 1
                            })
                          }}
                        >
                          {prediction.classifier}
                        </td>
                        <td>{prediction.confidence}</td>
                        <td>{"duration" in prediction ? "Audio" : "Video"}</td>
                        <td>
                          <button
                            onClick={_ => {
                              const { current } = this.playerRef;
                              const { peakInstance } = this.state;
                              if (current) {
                                const fraction =
                                  prediction.time / 1000 / duration;
                                current.seekTo(fraction);
                                peakInstance &&
                                  peakInstance.player.seek(
                                    prediction.time / 1000
                                  );
                              }
                            }}
                          >
                            Seek
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    );
  }
}

export default App;
