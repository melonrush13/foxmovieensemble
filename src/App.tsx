import Peaks from "peaks.js";
import React from "react";
import { Layer, Path, Rect, Stage } from "react-konva";
import ReactPlayer from "react-player";
import { stringToRGBA } from "./colour";
import { secondsToTime } from "./time";

export interface IMedia {
  title: string;
  sourceUrl: string; // URL to either video, image, or audio file
  predictions: Array<IVideoPrediction | IAudioPrediction>;
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
  volume: number;
  playbackRate: number;
  categories: string[];
  predictionsByTime: { [seconds: number]: IPrediction[] | undefined };
  currentPlaybackTime: number;
  peakInstance: Peaks.PeaksInstance | null;
}

class App extends React.Component<IMedia, IAppState> {
  public state: IAppState = {
    peakInstance: null,
    currentPlaybackTime: 0,
    volume: 0.8,
    playbackRate: 1.0,
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

  private playerRef = React.createRef<ReactPlayer>();
  private currentlyPlayingRefs: HTMLElement[] = [];
  private peaksContainerRef = React.createRef<HTMLDivElement>();
  private peaksAudioRef = React.createRef<HTMLAudioElement>();

  constructor(props: any) {
    super(props);
  }

  public componentDidMount() {
    const audioPredictions = this.props.predictions.filter(
      p => "time" in p && "duration" in p
    ) as IAudioPrediction[];

    const audioSegments = audioPredictions.map(p => {
      return {
        startTime: p.time / 1000,
        endTime: p.time + p.duration / 1000,
        color: stringToRGBA(p.classifier),
        labelText: p.classifier
      };
    });
    const options: Peaks.PeaksOptions = {
      container: this.peaksContainerRef.current as HTMLElement,
      mediaElement: this.peaksAudioRef.current as Element,
      audioContext: new AudioContext(),
      pointMarkerColor: "#006eb0",
      showPlayheadTime: true
      // segments: audioSegments
    };
    const peakInstance = Peaks.init(options);

    this.setState({ peakInstance });
  }

  public componentDidUpdate() {
    // Ensure the first label in always in view
    this.currentlyPlayingRefs.slice(0, 1).forEach(el => {
      el.scrollIntoView({ block: "center" });
    });
  }

  public onSeek = (newTime: number) => {
    console.log("new Time: " + newTime);
  };

  public seek = (e: number) => {
    const { current } = this.playerRef;
    if (current) {
      current.seekTo(e);
    }
  };

  public setPlaybackRate = (rate: number) => {
    console.log("Setting playback rate: " + rate);
    this.setState({ playbackRate: rate });
  };

  public render() {
    this.currentlyPlayingRefs = [];
    const {
      volume,
      playbackRate,
      predictionsByTime,
      currentPlaybackTime
    } = this.state;
    const { title, predictions, sourceUrl } = this.props;

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
    const currentAudioPredictions = predictions.filter(
      ({ time, duration: pDuration }: any) =>
        pDuration &&
        time &&
        currentPlaybackTime >= time / 1000 &&
        currentPlaybackTime <= (time + duration) / 1000
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
          <h1>{title}</h1>
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
            style={{ border: "1px dotted grey", flex: "1" }}
          >
            <div className="player-video" style={{ position: "relative" }}>
              <ReactPlayer
                ref={this.playerRef}
                url={sourceUrl}
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
                  if (peakInstance) {
                    peakInstance.player.pause();
                  }
                }}
                onPlay={() => {
                  const { peakInstance } = this.state;
                  if (peakInstance) {
                    peakInstance.player.play();
                  }
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
                        fill={stringToRGBA(prediction.classifier, {
                          alpha: prediction.confidence / 100
                        })}
                        stroke="black"
                      />
                    );
                  })}
                  {currentAudioPredictions.map(prediction => {
                    return (
                      <Path
                        fill={stringToRGBA(prediction.classifier, {
                          alpha: prediction.confidence / 100
                        })}
                        key={JSON.stringify(prediction)}
                        x={20}
                        y={20}
                        scale={{ x: 5, y: 5 }}
                        data="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.76 16.24l-1.41 1.41C4.78 16.1 4 14.05 4 12c0-2.05.78-4.1 2.34-5.66l1.41 1.41C6.59 8.93 6 10.46 6 12s.59 3.07 1.76 4.24zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.66 1.66l-1.41-1.41C17.41 15.07 18 13.54 18 12s-.59-3.07-1.76-4.24l1.41-1.41C19.22 7.9 20 9.95 20 12c0 2.05-.78 4.1-2.34 5.66zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      />
                    );
                  })}
                </Layer>
              </Stage>
            </div>
            <div ref={this.peaksContainerRef} />
            <audio ref={this.peaksAudioRef}>
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
              border: "1px dotted grey",
              flex: "1"
            }}
          >
            <table style={{ border: "1px dotted grey", width: "100%" }}>
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
                {predictions
                  .sort((a, b) => a.time - b.time)
                  .map(prediction => {
                    const isAudio = "duration" in prediction;
                    const isPlaying =
                      Math.round(prediction.time / 1000) ===
                      Math.round(currentPlaybackTime);
                    const formatTime = (seconds: number) =>
                      secondsToTime(seconds, { useColons: true });
                    const timeCode = isAudio
                      ? formatTime(prediction.time / 1000) +
                        " - " +
                        formatTime(
                          ((prediction as IAudioPrediction).duration +
                            prediction.time) /
                            1000
                        )
                      : formatTime(prediction.time / 1000);
                    const play = <T extends {}>(_: React.MouseEvent<T>) => {
                      const { current } = this.playerRef;
                      const { peakInstance } = this.state;
                      if (current) {
                        const fraction = prediction.time / 1000 / duration;
                        current.seekTo(fraction);
                      }
                      if (peakInstance) {
                        peakInstance.player.seek(prediction.time / 1000);
                      }
                    };
                    const ref = (r: HTMLSpanElement | null) => {
                      if (isPlaying && r) {
                        this.currentlyPlayingRefs.push(r);
                      }
                    };

                    return (
                      <tr
                        style={{
                          background: isPlaying ? "lightgrey" : "unset"
                        }}
                        key={JSON.stringify(prediction)}
                        ref={ref}
                      >
                        <td>
                          <code>{timeCode}</code>
                        </td>
                        <td
                          style={{
                            color: stringToRGBA(prediction.classifier, {
                              alpha: 1
                            })
                          }}
                        >
                          <code>{prediction.classifier}</code>
                        </td>
                        <td>
                          <code>{prediction.confidence}</code>
                        </td>
                        <td>
                          <code>
                            {"duration" in prediction ? "Audio" : "Video"}
                          </code>
                        </td>
                        <td>
                          <button onClick={play}>Seek</button>
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
