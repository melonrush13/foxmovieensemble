import Peaks from "peaks.js";
import React from "react";
import { Layer, Path, Rect, Stage } from "react-konva";
import ReactPlayer from "react-player";
import { stringToRGBA } from "./colour";
import { secondsToTime } from "./time";

export interface IMedia {
  title: string;
  sourceUrl?: string; // URL to either video, image, or audio file
  predictions: Array<IVideoPrediction | IAudioPrediction>;
  subtitles?: { [language: string]: string };
}

interface IPrediction {
  classifier: string;
  confidence: number; // 0 - 100
  time: number; // time in ms relative to 0:00:00.000 in source
  model?: string;
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
  filters: { [classification: string]: boolean };
  checked: boolean;
  volume: number;
  playing: boolean;
  playbackRate: number;
  categories: string[];
  predictionsByTime: { [seconds: number]: IPrediction[] | undefined };
  currentPlaybackTime: number;
  peakInstance?: Peaks.PeaksInstance;
  sourceUrl?: string;
  waveformReady: boolean;
  peaksError?: string;
  models: string[];
}

class App extends React.Component<IMedia, IAppState> {
  public state: IAppState = {
    filters: this.props.predictions
      .map(prediction => prediction.classifier)
      .reduce<{ [classification: string]: boolean }>((filters, classifier) => {
        filters[classifier] = true;
        return filters;
      }, {}),
    checked: true,
    currentPlaybackTime: 0,
    playing: false,
    volume: 0.0,
    playbackRate: 1.0,
    sourceUrl: this.props.sourceUrl,
    waveformReady: false,
    models: [...new Set(this.props.predictions.map(p => p.model || ""))].filter(
      e => e
    ),
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
    }, {}),
  };

  private playerRef = React.createRef<ReactPlayer>();
  private currentlyPlayingRefs: HTMLElement[] = [];
  private peaksContainerRef = React.createRef<HTMLDivElement>();
  private peaksAudioRef = React.createRef<HTMLAudioElement>();

  constructor(props: any) {
    super(props);
  }


  public componentDidUpdate() {
    // Ensure the first label in always in view
    this.currentlyPlayingRefs.slice(0, 1).forEach(el => {
      el.scrollIntoView({ block: "start" });
    });

    // Init peaks
    const peaksContainer = this.peaksContainerRef.current;
    const peaksMedia = this.peaksAudioRef.current;
    if (!this.state.peakInstance && peaksContainer && peaksMedia) {
      const { predictions } = this.props;
      const audioPredictions = predictions.filter(
        p => "time" in p && "duration" in p
      ) as IAudioPrediction[];
      const videoPredictions = predictions.filter(
        ({ x, y, width, height, time }: any) =>
          x && y && width && height && time
      ) as IVideoPrediction[];

      const audioSegments = audioPredictions.map(p => {
        return {
          startTime: p.time / 1000,
          endTime: p.time + p.duration / 1000,
          color: stringToRGBA(p.classifier),
          labelText: p.classifier
        };
      });

      const videoPoints = videoPredictions.map(p => {
        return {
          time: p.time / 1000,
          labelText: p.classifier
        };
      });

      const options: Peaks.PeaksOptions = {
        container: this.peaksContainerRef.current as HTMLElement,
        mediaElement: this.peaksAudioRef.current as Element,
        audioContext: new AudioContext(),
        pointMarkerColor: "#006eb0",
        showPlayheadTime: true,
        segments: audioSegments,
        points: videoPoints
      };
      const peakInstance = Peaks.init(options);
      peakInstance.on("peaks.ready", () => {
        this.setState({ waveformReady: true });
      });
      peakInstance.on("error", (error: Error) => {
        alert(error);
        console.error(error);
        this.setState({
          peaksError: error.message,
          waveformReady: true
        });
      });

      this.setState({ peakInstance });

      peakInstance.on("player_seek", (e: number) => {
        const { current } = this.playerRef;
        if (current) {
          current.seekTo(e);
        }
      });
    }
  }
  public playPause = () => {
    console.log("play")
    this.setState({playing: !this.state.playing})
  }

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
      predictionsByTime,
      currentPlaybackTime,
      sourceUrl,
      waveformReady,
      peaksError,
      models
    } = this.state;
    const { title, predictions, subtitles } = this.props;

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
    const currentVideoPredictions = (currentPredictions.filter(
      ({ x, y, width, height, time }: any) => x && y && width && height && time
    ) as IVideoPrediction[]).filter(p => this.state.filters[p.classifier]);
    const currentAudioPredictions = (predictions.filter(
      ({ time, duration: pDuration }: any) =>
        pDuration &&
        time &&
        currentPlaybackTime >= time / 1000 &&
        currentPlaybackTime <= (time + duration) / 1000
    ) as IAudioPrediction[]).filter(p => this.state.filters[p.classifier]);
    const hasModelMetadata = models.length > 0;

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
        <section
          id="header"
          style={{
            maxHeight: "100%",
            border: "1px dotted grey",
            flex: "1"
          }}
        >
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
            {/* If sourceUrl provided, present visualizations. Otherwise, show <input /> */}
            {sourceUrl ? (
              <div
                className="visualizations"
                style={{
                  height: "100%",
                  maxHeight: "100%",
                  overflowY: "scroll"
                }}
              >
                <audio
                  controls
                  onPlay={() => this.setState({ playing: true })}
                  onPause={() => this.setState({ playing: false })}
                  ref={this.peaksAudioRef}
                  onSeeking={() => this.setState({ playing: true })}
                  style={{ width: "100%" }}
                >
                  <source src={sourceUrl} type="audio/mpeg" />
                </audio>
                <div className="player-video" style={{ position: "relative" }} onClick={this.playPause}>
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    ref={this.playerRef}
                    url={sourceUrl}
                    playing={this.state.playing}
                    controls={false}
                    config={{
                      file: {
                        tracks: subtitles
                          ? Object.keys(subtitles).map(language => {
                              return {
                                kind: "subtitles",
                                src: subtitles[language],
                                srcLang: language,
                                label: language
                              };
                            })
                          : []
                      }
                    }}
                    width="100%"
                    height="100%"
                    controls={true}
                    volume={volume}
                    onProgress={({ playedSeconds }) => {
                      this.setState({ currentPlaybackTime: playedSeconds });
                    }}
                    progressInterval={250}
                    onSeek={this.seek}
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
                      {currentVideoPredictions.map(p => {
                        const hasValidBoundingBox = p.width > 0 && p.height > 0;
                        return [
                          hasValidBoundingBox && (
                            <Rect
                              key={JSON.stringify(p)}
                              x={p.x}
                              y={p.y}
                              width={p.width}
                              height={p.height}
                              name={p.classifier}
                              fill={stringToRGBA(p.classifier, {
                                alpha: p.confidence / 100
                              })}
                              stroke="black"
                            />
                          ),
                          <Path
                            fill={stringToRGBA(p.classifier, {
                              alpha: p.confidence / 100
                            })}
                            key={JSON.stringify(p) + "-icon"}
                            width={videoHeight / 10}
                            height={videoHeight / 10}
                            x={20}
                            y={20}
                            scale={{ x: 5, y: 5 }}
                            data="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"
                          />
                        ];
                      })}
                      {currentAudioPredictions.map(p => {
                        return (
                          <Path
                            fill={stringToRGBA(p.classifier, {
                              alpha: p.confidence / 100
                            })}
                            key={JSON.stringify(p)}
                            width={videoHeight / 10}
                            height={videoHeight / 10}
                            x={20}
                            y={40 + videoHeight / 10}
                            scale={{ x: 5, y: 5 }}
                            data="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.76 16.24l-1.41 1.41C4.78 16.1 4 14.05 4 12c0-2.05.78-4.1 2.34-5.66l1.41 1.41C6.59 8.93 6 10.46 6 12s.59 3.07 1.76 4.24zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.66 1.66l-1.41-1.41C17.41 15.07 18 13.54 18 12s-.59-3.07-1.76-4.24l1.41-1.41C19.22 7.9 20 9.95 20 12c0 2.05-.78 4.1-2.34 5.66zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          />
                        );
                      })}
                    </Layer>
                  </Stage>
                </div>
                <div ref={this.peaksContainerRef} />
                {!waveformReady && (
                  <code>
                    Generating audio waveform. May take a long time depending on
                    media length...
                  </code>
                )}
                {peaksError && <pre>ERROR: {peaksError}</pre>}
                <audio ref={this.peaksAudioRef}>
                  <source src={sourceUrl} type="audio/mpeg" />
                </audio>
              </div>
            ) : (
              // Allow user to input media from local filesystem
              <figure>
                <figcaption>
                  No MediaFile <code>url</code> found associated with with{" "}
                  <code>{title}</code>. Select local media file to underlay
                  labels.
                </figcaption>
                <input
                  type="file"
                  accept="video/*"
                  onChange={ev => {
                    const { files } = ev.currentTarget;
                    if (files) {
                      const file = files[0];
                      this.setState({
                        sourceUrl: URL.createObjectURL(file)
                      });
                    }
                  }}
                />
              </figure>
            )}
          </section>
          <section
            style={{
              maxHeight: "100%",
              overflowY: "scroll",
              border: "1px dotted grey",
              flex: "1"
            }}
          >
            <h2>Filter</h2>
            <tbody>
              {this.state.categories.map((category, i) => {
                return (
                  <tr>
                    <th
                      className={category}
                      style={{
                        color: stringToRGBA(category, {
                          alpha: 1
                        })
                      }}
                    >
                      {category}
                    </th>
                    <th>
                      <input
                        key={i}
                        type="checkbox"
                        value={category}
                        checked={this.state.filters[category]}
                        onChange={ev => {
                          this.setState({
                            filters: {
                              ...this.state.filters,
                              [category]: ev.currentTarget.checked
                            }
                          });
                        }}
                      />
                    </th>
                  </tr>
                );
              })}
            </tbody>
            <tbody>
              {predictions.map(prediction => {
                return <div />;
              })}
            </tbody>
            <table style={{ border: "1px dotted grey", width: "100%" }}>
              <thead>
                <tr>
                  <th>Time (ms)</th>
                  <th>Classifier</th>
                  {hasModelMetadata && <th>Model</th>}
                  <th>Confidence</th>
                  <th>Video/Audio</th>
                  <th>Button</th>
                </tr>
              </thead>
              <tbody>
                {predictions
                  .sort((a, b) => a.time - b.time)
                  .filter(p => this.state.filters[p.classifier])
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

                        {hasModelMetadata && (
                          <td>
                            <code>{prediction.model || "---"}</code>
                          </td>
                        )}
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
